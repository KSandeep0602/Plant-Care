import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    plantName: String,
    category: String,

    // Smart watering fields
    season: String,
    frequencyPerWeek: Number,
    nextWateringDate: Date,

    phone: String,
    whatsappSent: {
      type: Boolean,
      default: false,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Reminder ||
  mongoose.model("Reminder", ReminderSchema);
