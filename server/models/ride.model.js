const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    currentLocation: {
      address: {
        type: String,
        required: [true, "Please provide the pickup location"],
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: [true, "Please provide the pickup latitude"],
        },
        longitude: {
          type: Number,
          required: [true, "Please provide the pickup longitude"],
        },
      },
    },
    destination: {
      address: {
        type: String,
        required: [true, "Please provide the drop-off location"],
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: [true, "Please provide the drop-off latitude"],
        },
        longitude: {
          type: Number,
          required: [true, "Please provide the drop-off longitude"],
        },
      },
    },
    status: {
      type: String,
      enum: ["active", "accepted", "pickup", "drop", "completed", "cancelled"],
      default: "active",
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    otp: {
      type: Number,
      required: function () {
        return this.status === "accepted"; // OTP required once ride is accepted
      },
    },
    fare: {
      type: Number,
      // required: function () {
      //   return this.status === "completed"; // Fare set upon ride completion
      // },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        // required: function () {
        //   return this.status === "completed"; // Rating required after completion
        // },
      },
      comment: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
