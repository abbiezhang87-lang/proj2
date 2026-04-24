// Onboarding application — fields pulled from Project-B spec §3.
// Status lifecycle: Never Submitted → Pending → Approved | Rejected (resubmit).

const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema(
  {
    // user: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
    // status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // feedback: { type: String },              // HR's rejection feedback
    //
    // // Name
    // firstName: String, lastName: String, middleName: String, preferredName: String,
    // profilePicture: { type: mongoose.Types.ObjectId, ref: 'Document' },
    //
    // // Address
    // address: {
    //   building: String, street: String, city: String, state: String, zip: String,
    // },
    //
    // // Contact
    // cellPhone: String, workPhone: String, email: String,
    //
    // // Identity
    // ssn: String, dob: Date,
    // gender: { type: String, enum: ['male', 'female', 'no_answer'] },
    //
    // // Work authorization
    // isCitizenOrPR: Boolean,
    // residencyType: { type: String, enum: ['green_card', 'citizen'] },
    // workAuthorization: {
    //   type: { type: String, enum: ['H1-B', 'L2', 'F1', 'H4', 'Other'] },
    //   otherTitle: String,
    //   startDate: Date,
    //   endDate: Date,
    // },
    //
    // // Reference (single)
    // reference: {
    //   firstName: String, lastName: String, middleName: String,
    //   phone: String, email: String, relationship: String,
    // },
    //
    // // Emergency contacts (1+)
    // emergencyContacts: [
    //   {
    //     firstName: String, lastName: String, middleName: String,
    //     phone: String, email: String, relationship: String,
    //   },
    // ],
    //
    // // Documents (Document refs)
    // documents: [{ type: mongoose.Types.ObjectId, ref: 'Document' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnboardingApplication', onboardingSchema);
