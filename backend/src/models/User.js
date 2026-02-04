import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true, // Allows multiple null values but enforces uniqueness for non-null
    index: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phoneNumber: {
    type: String,
    sparse: true, // Allows multiple null values but enforces uniqueness for non-null
    trim: true,
    index: true,
  },
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes are handled by unique: true and index: true in schema fields above

const User = mongoose.model('User', userSchema)

export default User
