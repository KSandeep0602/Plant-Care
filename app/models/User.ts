import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true, // ✅ login based on phone
    },

    name: {
      type: String,
      default: "",
    },

    dob: {
      type: String,
      default: "",
    },

    // ❌ REMOVE email completely OR make it optional
    email: {
      type: String,
      default: null,
      sparse: true, // ✅ important fix
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);