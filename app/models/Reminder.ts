import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    plantName: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Date the user selected in the UI (used for display)
    reminderDate: {
      type: Date,
    },

    phone: {
      type: String,
      required: true,
    },

    // 🔁 Smart watering system
    nextWateringDate: {
      type: Date,
      required: true,
    },

    frequencyPerWeek: {
      type: Number,
      required: true,
      default: 1,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    whatsappSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Reminder = (
  mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema)
) as mongoose.Model<any>;

export default Reminder;
  