import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ["user", "artist"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
