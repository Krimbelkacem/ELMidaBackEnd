const { default: mongoose } = require("mongoose");

const Resto = require("../db/Schema/Restaurant");

const User = require("../db/Schema/User");
const Reserve = require("../db/Schema/Reservation");
const asyncHandler = require("express-async-handler");

const serviceAccount = require("../config/service_account..json");
const io = require("../../../server");

const newReservation = asyncHandler(async (req, res) => {
  console.log(req.body.hours);
  console.log(req.query.userId);
  console.log(req.body.dateR);
  console.log(req.body.guests);
  console.log(req.query.restoId);
  const userId = req.query.userId;
  const restoId = req.query.restoId;
  try {
    // Create a new reservation document
    const reserve = await Reserve.create({
      date: req.body.dateR,
      time: req.body.selectedTime + "h/min",
      guests: req.body.guests,
      user: req.query.userId,
      Resto: req.query.restoId,
    });

    // Add the reservation to the user's reservations array
    const user = await User.findByIdAndUpdate(userId, {
      $addToSet: { reservations: reserve._id },
    });

    // Add the reservation to the restaurant's reservations array
    const resto = await Resto.findByIdAndUpdate(restoId, {
      $addToSet: { reservations: reserve._id },
    });

    // Return the newly created reservation document
    res.status(201).json(reserve);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

const getRestoReservation = asyncHandler(async (req, res) => {
  const restoId = req.query.restoId;

  console.log(restoId);
  try {
    // Verify the token
    const decodedToken = decodeToken(token);
    console.log(decodedToken);

    // Find the user with the decoded ID
    const Reservation = await Reserve.find()
      .populate("Restos")
      .populate("followings")
      .populate("reservations")
      .exec();

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(user.reservations.time);
    // Return the user object as a response
    res.json(user);
    console.log(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

const removeReservation = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    // Find the reservation document by ID and remove it
    const reservation = await Reserve.findByIdAndRemove(id);

    // Remove the reservation from the user's reservations array
    const user = await User.findByIdAndUpdate(reservation.user, {
      $pull: { reservations: id },
    });

    // Remove the reservation from the restaurant's reservations array
    const resto = await Resto.findByIdAndUpdate(reservation.resto, {
      $pull: { reservations: id },
    });

    // Return a success message
    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
const rejectReservation = asyncHandler(async (req, res) => {
  try {
    // Find the reservation document by ID
    const reservation = await Reserve.findById(req.query.id);

    // Update the reservation state to "accepted"
    reservation.state = "rejected";
    await reservation.save();

    // Return the updated reservation document as a response
    res.json(reservation);
  } catch (error) {
    // Handle errors by returning an error response with the error message
    res.status(500).json({ message: error.message });
  }
});

// Define a new endpoint to handle accepting a reservation
const acceptReservation = asyncHandler(async (req, res) => {
  try {
    // Find the reservation document by ID
    const reservation = await Reserve.findById(req.query.id);

    // Update the reservation state to "accepted"
    reservation.state = "accepted";
    await reservation.save(); // Send notification to the user

    res.json(reservation);
  } catch (error) {
    // Handle errors by returning an error response with the error message
    res.status(500).json({ message: error.message });
  }
});
const canceleReservation = async (req, res) => {
  try {
    // Find the reservation by ID
    const reservation = await Reserve.findById(req.query.id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Update the state to "canceled"
    reservation.state = "canceled";
    await reservation.save();

    return res.json({ message: "Reservation canceled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const sendNotification = async (title, body, userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found.");
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      topic: userId, // Using the user ID as the topic
    };

    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};
///////////////////////////////////
const getUserReservations = async (req, res) => {
  const userId = req.query.userId;
  console.log("userId", userId);
  try {
    const reservations = await Reserve.find({ user: userId })
      .populate("Resto")
      .exec();
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  rejectReservation,
  newReservation,
  removeReservation,
  acceptReservation,
  canceleReservation,
  getUserReservations,
};
