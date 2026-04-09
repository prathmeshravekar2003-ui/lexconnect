const LawyerProfile = require('../models/LawyerProfile');
const User = require('../models/User');

// @desc    Create/Update lawyer profile
// @route   POST /api/lawyers/profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      specialization, barCouncilId, experience, bio, education,
      languages, consultationFee, location, availability
    } = req.body;

    let profile = await LawyerProfile.findOne({ user: req.user.id });

    const profileData = {
      user: req.user.id,
      specialization, barCouncilId, experience, bio, education,
      languages, consultationFee, availability
    };

    // Handle location GeoJSON format
    if (location) {
      profileData.location = {
        type: 'Point',
        coordinates: [location.longitude || 0, location.latitude || 0],
        city: location.city || '',
        state: location.state || '',
        address: location.address || ''
      };
    }

    if (profile) {
      profile = await LawyerProfile.findOneAndUpdate(
        { user: req.user.id },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      profile = await LawyerProfile.create(profileData);
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my lawyer profile
// @route   GET /api/lawyers/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.user.id }).populate('user', 'name email avatar phone');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lawyer profile by ID
// @route   GET /api/lawyers/:id
exports.getLawyerProfile = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.params.id }).populate('user', 'name email avatar phone');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search & filter lawyers
// @route   GET /api/lawyers
exports.searchLawyers = async (req, res) => {
  try {
    const {
      specialization, minPrice, maxPrice, minRating,
      experience, language, lat, lng, radius,
      sort, page = 1, limit = 12
    } = req.query;

    const query = { isAvailable: true };

    // Filter by specialization
    if (specialization) {
      query.specialization = { $in: specialization.split(',') };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.consultationFee = {};
      if (minPrice) query.consultationFee.$gte = Number(minPrice);
      if (maxPrice) query.consultationFee.$lte = Number(maxPrice);
    }

    // Filter by minimum rating
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Filter by experience
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    // Filter by language
    if (language) {
      query.languages = { $in: language.split(',') };
    }

    // Location-based search (commented out for now)
    /*
    if (lat && lng) {
      const radiusKm = Number(radius) || 50;
      const radiusInRadians = radiusKm / 6378.1; // Earth radius in km
      query.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
        }
      };
    }
    */

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_low':
        sortOption = { consultationFee: 1 };
        break;
      case 'price_high':
        sortOption = { consultationFee: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'experience':
        sortOption = { experience: -1 };
        break;
      default:
        sortOption = { averageRating: -1, totalReviews: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await LawyerProfile.countDocuments(query);

    const lawyers = await LawyerProfile.find(query)
      .populate('user', 'name email avatar phone isOnline')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // If location query, calculate distances (commented out for now)
    let lawyersWithDistance = lawyers;
    /*
    if (lat && lng) {
      lawyersWithDistance = lawyers.map(lawyer => {
        const lawyerObj = lawyer.toObject();
        if (lawyer.location && lawyer.location.coordinates) {
          const distance = calculateDistance(
            Number(lat), Number(lng),
            lawyer.location.coordinates[1], lawyer.location.coordinates[0]
          );
          lawyerObj.distance = Math.round(distance * 10) / 10;
        }
        return lawyerObj;
      });
    }
    */

    res.status(200).json({
      success: true,
      count: lawyersWithDistance.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      lawyers: lawyersWithDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update availability
// @route   PUT /api/lawyers/availability
exports.updateAvailability = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOneAndUpdate(
      { user: req.user.id },
      { availability: req.body.availability },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lawyer earnings
// @route   GET /api/lawyers/earnings
exports.getEarnings = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const Payment = require('../models/Payment');
    const payments = await Payment.find({ lawyer: req.user.id, status: 'paid' })
      .populate('consultation', 'type scheduledDate')
      .sort({ createdAt: -1 });

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      totalEarnings,
      totalConsultations: profile.totalConsultations,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Haversine formula — distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
