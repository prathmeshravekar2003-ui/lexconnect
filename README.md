# ⚖️ LexConnect - Legal Tech Platform

A complete MERN stack platform connecting clients with lawyers for online consultations.

## 🚀 Key Features

- **Authentication**: JWT-based auth with Email OTP verification.
- **Lawyer Discovery**: Search with filters (specialization, rating, fees, location).
- **Consultations**: Instant and scheduled booking with problem description.
- **Payments**: Integrated Razorpay for secure transactions.
- **Real-time Chat**: One-to-one messaging with Socket.io.
- **Video Calls**: Integrated WebRTC calls for consultations.
- **Document Management**: Securely upload and share legal documents.
- **Roles**: Distinct dashboards for Clients and Lawyers.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS 4 + Zustand + Socket.io-client
- **Backend**: Node.js + Express.js + Socket.io + Razorpay SDK
- **Database**: MongoDB (Mongoose)

## 📦 Project Structure

```
lexconnect/
├── backend/    # Node.js + Express API
├── frontend/   # React.js SPA
```

## ⚙️ Setup Instructions

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` based on `.env.example` and add your:
   - `MONGODB_URI` (Atlas)
   - `JWT_SECRET`
   - `EMAIL_USER` & `EMAIL_PASS` (for OTP)
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` based on `.env.example` and add your:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
4. `npm run dev`

## 🎨 Design Aesthetics
Built with a premium glassmorphic UI, responsive layouts, and smooth animations to provide a top-tier user experience.
