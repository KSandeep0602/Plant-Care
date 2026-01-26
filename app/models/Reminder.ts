import mongoose, { Schema } from "mongoose";

const ReminderSchema = new Schema({
  plantName: {
    type: String,
    required: true,
  },
  reminderDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },

  // ✅ WhatsApp tracking
  phone: {
    type: String,
  },
  whatsappSent: {
    type: Boolean,
    default: false,
  },
  whatsappSentAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Reminder ||
  mongoose.model("Reminder", ReminderSchema);
