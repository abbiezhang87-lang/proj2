const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    relationship: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    building: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const workAuthSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['H1-B', 'L2', 'F1', 'H4', 'Other'],
    },
    otherTitle: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
  },
  { _id: false }
);

const onboardingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    feedback: { type: String, default: '' },

    // Name
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    preferredName: { type: String, trim: true },
    profilePicture: { type: mongoose.Types.ObjectId, ref: 'Document' },

    // Address
    address: { type: addressSchema, required: true },

    // Contact
    cellPhone: { type: String, required: true, trim: true },
    workPhone: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    // Identity
    ssn: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'no_answer'],
      required: true,
    },

    // Citizenship / work authorisation
    isCitizenOrPR: { type: Boolean, required: true },
    residencyType: { type: String, enum: ['green_card', 'citizen'] },
    workAuthorization: workAuthSchema,

    // Reference & emergency contacts
    reference: contactSchema,
    emergencyContacts: {
      type: [contactSchema],
      validate: [(arr) => arr && arr.length >= 1, 'At least one emergency contact required'],
    },

    // Uploaded documents (driver's license, work auth, etc.) — profile picture
    // is referenced separately above for convenience.
    documents: [{ type: mongoose.Types.ObjectId, ref: 'Document' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnboardingApplication', onboardingSchema);
