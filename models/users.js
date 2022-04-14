var mongoose = require("mongoose");

var myLastTrips = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  departureTime: String,
  price: Number,
});

var userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  myLastTrips: [myLastTrips],
});

var userModel = mongoose.model("users", userSchema);

module.exports = userModel;
