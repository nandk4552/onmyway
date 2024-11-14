// routes/orders.js
const express = require("express");
const {
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
} = require("../controllers/ride.controller");
const { requireSignIn, setUser } = require("../controllers/user.controller");
const router = express.Router();

router.post("/search-rider", searchRiderController);
router.post("/book-ride", bookRideController);
router.get("/my-rides", requireSignIn, setUser, getUserRidesController);
router.put("/cancel/:id", requireSignIn, setUser, cancelRideController);
router.get("/active", requireSignIn, setUser, getActiveRidesController);
// ACCEPT RIDE USING RIDE ID || PUT || /api/v1/ride/accept/:rideId
router.put("/accept/:rideId", requireSignIn, setUser, acceptRideController);
// FETCH THE RIDES ACCEPTED BY THE CURRENT RIDER
router.get(
  "/history/:riderId",
  requireSignIn,
  setUser,
  getRiderHistoryController
);
// allow rider to update the status to pickup
router.put(
  "/pickup/:rideId",
  requireSignIn,
  setUser,
  pickupPassengerController
);
router.put("/drop/:rideId", requireSignIn, setUser, dropPassengerController);
router.put("/complete/:rideId", requireSignIn, setUser, completeRideController);
module.exports = router;
