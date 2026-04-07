import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [3, "Name can't be less than 3 characters"],
      maxLength: [30, "Name can't exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: [true, "Email already registered, enter another email"],
      validate: {
        validator: (v) => {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password can't be less than 6 characters"],
    },
    profileImage: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
    },
    savedVideos: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
          default: null,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likedVideos: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
          default: null,
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subscribedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewHistory: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
