const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an company email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid company email address",
      ],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      // match: [/^\+\d{1,3}\s\d{1,15}$/, "Please enter a valid phone number"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      min: 6,
      max: 64,
      //   select: false, // hide password in response
    },
    role: {
      type: String,
      enum: ["passenger", "rider"],
      default: "passenger",
    },
    license: {
      type: String,
      required: function () {
        return this.role === "rider";
      },
      unique: true,
      sparse: true, // Allows multiple `null` values without violating uniqueness constraint
      match: [/^[A-Za-z0-9-]+$/, "Please enter a valid driving license number"],
    },
    otp: {
      type: Number,
      unique: true,
      sparse: true, // Allows the otp field to be nullable
    },
  },
  { timestamps: true }
);

// Middleware to generate a unique OTP for passengers only when creating the document
userSchema.pre("save", async function (next) {
  if (this.isNew && this.role === "passenger" && !this.otp) {
    let generatedOtp;
    let otpExists = true;

    while (otpExists) {
      // Generate a 4-digit OTP
      generatedOtp = Math.floor(1000 + Math.random() * 9000);

      // Check if OTP is unique
      otpExists = await mongoose.models.User.findOne({ otp: generatedOtp });
    }

    this.otp = generatedOtp;
  }
  next();
});
module.exports = mongoose.model("User", userSchema);
