const userModel = require("../models/user.model");
const rideModel = require("../models/ride.model");

// Controller to search for a rider and match with a passenger
const searchRiderController = async (req, res) => {
  const { pickupLocation, dropoffLocation, passengerId } = req.body;

  try {
    // Check if passenger exists
    const passenger = await userModel.findById(passengerId);
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    // Search for a single available ride with no existing passenger
    const matchedRide = await rideModel
      .findOneAndUpdate(
        {
          currentLocation: pickupLocation,
          destination: dropoffLocation,
          status: "active",
          passengerId: { $exists: false }, // Ensures no passenger has joined yet
        },
        {
          passengerId: passengerId,
          status: "accepted", // Update status to show passenger has joined
          otp: Math.floor(1000 + Math.random() * 9000), // Generate a 4-digit OTP
        },
        { new: true }
      )
      .populate("riderId", "name email phone");

    if (!matchedRide) {
      return res.status(404).json({ message: "No available riders found" });
    }

    res.status(200).json({
      message: "Matched rider found and passenger added",
      rideDetails: {
        rideId: matchedRide._id,
        riderName: matchedRide.riderId?.name,
        riderEmail: matchedRide.riderId?.email,
        riderPhone: matchedRide.riderId?.phone,
        pickupLocation: matchedRide.currentLocation,
        dropoffLocation: matchedRide.destination,
        passengerId: matchedRide.passengerId,
        otp: matchedRide.otp,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error finding or updating ride", error });
  }
};
const bookRideController = async (req, res) => {
  const { pickupLocation, dropoffLocation, passengerId } = req.body;

  try {
    // Check if passenger exists
    const passenger = await userModel.findById(passengerId);
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    // Check if there's an existing active or accepted ride for this passenger
    const existingRide = await rideModel.findOne({
      passengerId,
      status: { $in: ["active", "accepted"] },
    });

    if (existingRide) {
      return res.status(400).json({
        message:
          "You already have an active or accepted ride. Complete it before booking a new one.",
      });
    }

    // Check if there's an available ride with the specified locations
    let availableRide = await rideModel.findOne({
      "currentLocation.address": pickupLocation.address,
      "destination.address": dropoffLocation.address,
      status: "active",
      passengerId: { $exists: false },
    });

    if (!availableRide) {
      // No available ride exists, create a new ride
      availableRide = new rideModel({
        riderId: null,
        currentLocation: pickupLocation,
        destination: dropoffLocation,
        status: "active",
        passengerId: passengerId,
      });
      await availableRide.save();
    } else {
      // Assign the passenger to the existing ride
      availableRide.passengerId = passengerId;
      availableRide.status = "accepted";
      availableRide.otp = Math.floor(1000 + Math.random() * 9000); // Generate OTP
      await availableRide.save();
    }

    res.status(201).json({
      message: "Ride booked successfully",
      rideDetails: {
        rideId: availableRide._id,
        pickupLocation: availableRide.currentLocation,
        dropoffLocation: availableRide.destination,
        status: availableRide.status,
        passengerId: availableRide.passengerId,
        riderId: availableRide.riderId,
        otp: availableRide.otp,
      },
    });
  } catch (error) {
    console.error("Error booking ride:", error);
    res.status(500).json({ message: "Error booking ride", error });
  }
}; // Controller for rider to accept a booked ride
const acceptBookedRideController = async (req, res) => {
  const { rideId, riderId } = req.body;

  try {
    // Check if rider exists
    const rider = await userModel.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Find the ride that is booked by a passenger but not yet accepted by a rider
    const ride = await rideModel.findOne({
      _id: rideId,
      status: "active",
      passengerId: { $exists: true },
      riderId: { $exists: false },
    });

    if (!ride) {
      return res
        .status(404)
        .json({ message: "No matching ride found or already accepted" });
    }

    // Update the ride with the rider's information and change status to "accepted"
    ride.riderId = riderId;
    ride.status = "accepted";
    ride.otp = Math.floor(1000 + Math.random() * 9000); // Generate OTP for the ride
    await ride.save();

    res.status(200).json({
      message: "Ride accepted successfully",
      rideDetails: {
        rideId: ride._id,
        pickupLocation: ride.currentLocation,
        dropoffLocation: ride.destination,
        status: ride.status,
        passengerId: ride.passengerId,
        riderId: ride.riderId,
        otp: ride.otp,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting ride", error });
  }
};

const getUserRidesController = async (req, res) => {
  try {
    const passengerId = req.user?._id;
    if (!passengerId) {
      return res.status(401).json({ message: "Access denied. No user found." });
    }
    // Fetch rides specific to this passenger
    const rides = await rideModel
      .find({ passengerId })
      .populate("riderId", "name") // Optionally populate rider information
      .sort({ createdAt: -1 }); // Sort rides by newest first

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Error fetching user rides:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user rides",
      error,
    });
  }
};

const cancelRideController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Ride ID is required" });
    }
    const ride = await rideModel.findById(id);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active rides can be cancelled",
      });
    }

    ride.status = "cancelled";
    await ride.save();

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    res
      .status(500)
      .json({ success: false, message: "Error cancelling ride", error });
  }
};

const getActiveRidesController = async (req, res) => {
  try {
    const activeRides = await rideModel.find({ status: "active" });
    res.status(200).json({ success: true, rides: activeRides });
  } catch (error) {
    console.error("Error fetching active rides:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch active rides", error });
  }
};
const acceptRideController = async (req, res) => {
  try {
    const { rideId } = req.params;
    const riderId = req?.user?._id; // Get the riderId from the authenticated user
    if (!rideId) {
      return res.status(200).send({
        success: false,
        message: "Ride ID is required",
      });
    }
    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No user found.",
      });
    }
    // Check if the rider already has an active ride
    const existingRide = await rideModel.findOne({
      riderId,
      status: { $in: ["accepted", "pickup", "drop"] },
    });

    if (existingRide) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active ride. Complete it before accepting a new one.",
      });
    }
    // Update ride status to "accepted" and set the riderId
    const ride = await rideModel.findOneAndUpdate(
      { _id: rideId, status: "active" },
      { riderId, status: "accepted" },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or already accepted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ride accepted successfully",
      ride,
    });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept ride due to an internal error",
      error: error.message,
    });
  }
};

const getRiderHistoryController = async (req, res) => {
  const { riderId } = req.params;

  try {
    const rides = await rideModel
      .find({
        riderId,
        status: { $in: ["accepted", "pickup", "drop", "completed"] },
      })
      .populate({
        path: "passengerId",
        select: "otp",
      })
      .sort({ createdAt: -1 })
      .select("currentLocation destination status paymentStatus passengerId");

    if (!rides || rides.length === 0) {
      return res.status(200).json({
        success: true,
        rides: [],
        message: "No rides found for this rider.",
      });
    }

    res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching rider history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch rider history" });
  }
};

const pickupPassengerController = async (req, res) => {
  try {
    const { rideId } = req.params;
    if (!rideId) {
      return res.status(404).send({
        success: false,
        message: "Ride ID is required",
      });
    }
    // Find the ride and check its status and riderId
    const ride = await rideModel.findById(rideId);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // Check if the ride is accepted and has a rider assigned
    if (ride.status === "accepted" && ride.riderId) {
      // Update the status to "pickup"
      ride.status = "pickup";
      await ride.save();
      return res.status(200).json({ success: true, ride });
    } else {
      // If conditions aren't met, send a response indicating the failure
      return res.status(400).json({
        success: false,
        message:
          "Ride must be accepted and have a rider assigned to update to pickup",
      });
    }
  } catch (error) {
    console.error("Error updating ride status to pickup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ride status",
      error,
    });
  }
};
const dropPassengerController = async (req, res) => {
  try {
    const { rideId } = req.params;
    const riderId = req.user?._id; // Assuming req.user is set after authentication

    // Validate IDs
    if (!rideId || !riderId) {
      return res
        .status(400)
        .json({ success: false, message: "Ride ID and Rider ID are required" });
    }

    // Find the ride with status 'pickup' and matching riderId
    const ride = await rideModel.findOne({
      _id: rideId,
      riderId,
      status: "pickup",
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not ready for drop",
      });
    }

    // Update the ride status to 'drop'
    ride.status = "drop";
    await ride.save();

    res.status(200).json({ success: true, ride });
  } catch (error) {
    console.error("Error updating ride status to drop:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update ride status", error });
  }
};

const completeRideController = async (req, res) => {
  try {
    const { rideId } = req.params;
    const riderId = req.user?._id; // Assuming `req.user` contains authenticated user info

    // Check for ride existence and current status
    const ride = await rideModel.findOne({
      _id: rideId,
      riderId,
      status: "drop", // Only allow completion if the status is "drop"
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not ready for completion",
      });
    }

    // Update the status to "completed"
    ride.status = "completed";
    await ride.save();

    res
      .status(200)
      .json({ success: true, message: "Ride marked as completed", ride });
  } catch (error) {
    console.error("Error updating ride status to completed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete the ride",
      error: error.message,
    });
  }
};
module.exports = {
  searchRiderController,
  bookRideController,
  acceptBookedRideController,
  getUserRidesController,
  cancelRideController,
  getActiveRidesController,
  acceptRideController,
  getRiderHistoryController,
  pickupPassengerController,
  dropPassengerController,
  completeRideController,
};
