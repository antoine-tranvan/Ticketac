var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");

var userModel = require("../models/users");

// useNewUrlParser ;)
var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// --------------------- BDD -----------------------------------------------------
mongoose.connect(
  "mongodb+srv://antoinetranvan:Peterpan10!@cluster0.d792e.mongodb.net/Ticketac?retryWrites=true&w=majority",
  options,
  function (err) {
    if (err) {
      console.log(
        `error, failed to connect to the database because --> ${err}`
      );
    } else {
      console.info("*** Database Ticketac connection : Success ***");
    }
  }
);

var journeySchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  departureTime: String,
  price: Number,
});

var journeyModel = mongoose.model("journey", journeySchema);

var city = [
  "Paris",
  "Marseille",
  "Nantes",
  "Lyon",
  "Rennes",
  "Melun",
  "Bordeaux",
  "Lille",
];
var date = [
  "2018-11-20",
  "2018-11-21",
  "2018-11-22",
  "2018-11-23",
  "2018-11-24",
];

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("signin");
});

// Remplissage de la base de donnée, une fois suffit
router.get("/save", async function (req, res, next) {
  // How many journeys we want
  var count = 300;

  // Save  ---------------------------------------------------
  for (var i = 0; i < count; i++) {
    departureCity = city[Math.floor(Math.random() * Math.floor(city.length))];
    arrivalCity = city[Math.floor(Math.random() * Math.floor(city.length))];

    if (departureCity != arrivalCity) {
      var newUser = new journeyModel({
        departure: departureCity,
        arrival: arrivalCity,
        date: date[Math.floor(Math.random() * Math.floor(date.length))],
        departureTime: Math.floor(Math.random() * Math.floor(23)) + ":00",
        price: Math.floor(Math.random() * Math.floor(125)) + 25,
      });

      await newUser.save();
    }
  }
  res.render("index", { title: "Express" });
});

router.get("/homepage", function (req, res, next) {
  res.render("homepage", { title: "Express" });
});

router.get("/homepage", function (req, res, next) {
  res.render("homepage", { title: "Express" });
});

router.post("/results", async function (req, res, next) {
  req.session.orders = [];

  var journey = await journeyModel.find({
    departure: req.body.cityDepartureFromFront,
    arrival: req.body.cityArrivalFromFront,
    date: req.body.dateFromFront,
  });

  console.log(journey);

  if (journey.length == 0) {
    res.render("oups");
  } else {
    res.render("results", { journey: journey, name: req.session.user.name });
  }
});

router.get("/homepage", function (req, res, next) {
  res.render("homepage", { title: "Express" });
});

router.get("/orders", function (req, res, next) {
  req.session.totalAmount = 0;

  var date = new Date(req.query.date).toLocaleDateString();

  req.session.orders.push({
    departure: req.query.departure,
    arrival: req.query.arrival,
    date: date,
    departureTime: req.query.departureTime,
    price: req.query.price,
  });
  console.log(req.session.orders);

  for (var i = 0; i < req.session.orders.length; i++) {
    price = Number(req.session.orders[i].price);
    req.session.totalAmount = req.session.totalAmount + price;
  }

  console.log(req.session.totalAmount);

  res.render("orders", {
    orders: req.session.orders,
    totalAmount: req.session.totalAmount,
    name: req.session.user.name,
  });
});

router.get("/lasttrip", function (req, res, next) {
  res.render("lasttrip", { title: "Express" });
});

router.get("/logout", function (req, res, next) {
  req.session.users = null;
  req.session.orders = null;
  res.redirect("/");
});

//route des SignIn & SignUp
// Faire popup erreur déjà inscrit

router.post("/sign-up", async function (req, res, next) {
  var searchUser = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (!searchUser) {
    var newUser = new userModel({
      firstname: req.body.firstNameFromFront,
      lastname: req.body.lastNameFromFront,
      email: req.body.emailFromFront,
      password: req.body.passwordFromFront,
    });

    var newUserSave = await newUser.save();

    req.session.user = {
      name: newUserSave.firstname,
      id: newUserSave._id,
    };

    console.log(req.session.user);

    res.render("homepage", { name: req.session.user.name }); // Il faut la créer
  } else {
    res.redirect("/");
  }
});

router.post("/sign-in", async function (req, res, next) {
  var searchUser = await userModel.findOne({
    email: req.body.emailFromFront,
    password: req.body.passwordFromFront,
  });

  if (searchUser != null) {
    req.session.user = {
      name: searchUser.firstname,
      id: searchUser._id,
    };
    console.log(req.session.user.name);
    res.render("homepage", { name: req.session.user.name }); // Il faut la créer
  } else {
    res.render("signin");
  }
});

router.get("/congrat", async function (req, res, next) {
  console.log("session orders");
  console.log(req.session.orders);

  var user = await userModel.findById(req.session.user.id);
  var date = new Date(20 / 11 / 2018);

  console.log(user);
  console.log(user.myLastTrips);

  for (var i = 0; i < req.session.orders.length; i++) {
    var transform = req.session.orders[i].date.split("/");
    var date = new Date(transform[2], transform[1], transform[0]);
    console.log(date);
    console.log(typeof date);
    user.myLastTrips.push({
      departure: req.session.orders[i].departure,
      arrival: req.session.orders[i].arrival,
      date: date,
      departureTime: req.session.orders[i].departureTime,
      price: Number(req.session.orders[i].price),
    });
  }

  var userSaved = await user.save();
  res.render("congrat");
});

module.exports = router;
