import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  plantName: String,
  reminderDate: Date,

  // NEW
  phone: String,
  whatsappSent: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.Reminder ||
  mongoose.model("Reminder", ReminderSchema);
