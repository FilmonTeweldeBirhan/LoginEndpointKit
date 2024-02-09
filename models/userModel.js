const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const dateUTC = require("../utils/dateUTC");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    photo: {
      type: String,
      default: "avatar.png",
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Invalid role",
      },
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be atlease 8 characters long"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Password didn't match",
      },
    },
    passwordChangedAt: Date,
    passwordRester: String,
    passwordResterExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  // 1) First check if the pwd is Modified or not
  if (!this.isModified("password")) return next();

  // 2) Then check if the doc is new or not
  if (!this.isNew) {
    // Change the pwdChangedAt fields
    this.passwordChangedAt = dateUTC() - 1000;
  }

  // 3) If the doc is new hash it
  this.password = await bcrypt.hash(this.password, 12);
  // 4) At last delete the passwordConfirm field
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (candidatePwd, userPwd) {
  return await bcrypt.compare(candidatePwd, userPwd);
};

userSchema.methods.createPwdRester = function () {
  const resetToken = crypto.randomBytes(6).toString("hex");

  // Set the reset token in DB
  this.passwordRester = resetToken;

  // Create reset token expiration time (10 minutes)
  // Min  Sec  Milliseconds
  this.passwordResterExpires = dateUTC() + 10 * 60 * 1000;

  // It will be usefull for sending email
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
