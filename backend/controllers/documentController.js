const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Consultation = require('../models/Consultation');

// Multer config for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, WEBP, DOC, DOCX allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

exports.uploadMiddleware = upload.single('document');

// @desc    Upload document
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { consultationId } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Only client or lawyer of this consultation can upload
    if (
      consultation.client.toString() !== req.user.id &&
      consultation.lawyer.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const document = await Document.create({
      consultation: consultationId,
      uploadedBy: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      accessibleTo: [consultation.client, consultation.lawyer]
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get documents for a consultation
// @route   GET /api/documents/:consultationId
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      consultation: req.params.consultationId,
      accessibleTo: req.user.id
    })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download document
// @route   GET /api/documents/download/:id
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check access
    if (!document.accessibleTo.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.filename);
    res.download(filePath, document.originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
