const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;
const ReservationSchema = new Schema({
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  guests: {
    type: Number,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectID,
    ref: "User",
  },
  Resto: {
    type: mongoose.SchemaTypes.ObjectID,
    ref: "Resto",
  },
  state: {
    type: String,
    enum: ["pending", "accepted", "rejected", "canceled"],
    default: "pending",
  },
  datepost: {
    type: Date,
    default: Date.now,
  },
});

const Reserve = mongoose.model("Reserve", ReservationSchema);

module.exports = Reserve;
