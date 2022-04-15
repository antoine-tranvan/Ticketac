var express = require("express");
var router = express.Router();

<<<<<<< HEAD
var request = require("sync-request");
=======
//Paiement Stripe avec la clé test
const Stripe = require('stripe');
const stripe = Stripe
('sk_test_51KjgSIHcg7XvrheRJClDBL19gJoFUlgAAOn0doHwgmNB8d3HNZ21icf1eWMBA5qB8nvX4t94m4Lj3TPREqnxkU8K00RmPepE1j')



>>>>>>> 633f18e16d5eeea9acfddfb2b1e35aeb9b05ec85

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

var userAlreadyExist;
var emailAlreadyExist;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("signin", {
    userAlreadyExist: userAlreadyExist,
    emailAlreadyExist: emailAlreadyExist,
  });
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
  res.render("homepage", { name: req.session.user.name });
});

router.post("/results", async function (req, res, next) {
  var requete = request(
    "GET",
    `https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityArrivalFromFront}&units=metric&lang=fr&appid=0c815b9455235455a301668a56c67b18`
  );
  var dataAPI = JSON.parse(requete.body);
  console.log(dataAPI);
  var description = dataAPI.weather[0].description;
  var img =
    "http://openweathermap.org/img/wn/" + dataAPI.weather[0].icon + ".png";

  var journey = await journeyModel.find({
    departure: req.body.cityDepartureFromFront,
    arrival: req.body.cityArrivalFromFront,
    date: req.body.dateFromFront,
  });

  console.log(journey);

  if (journey.length == 0) {
    res.render("oups", { name: req.session.user.name });
  } else {
    res.render("results", {
      journey: journey,
      name: req.session.user.name,
      description,
      img,
    });
  }
});

router.get("/orders", function (req, res, next) {
  req.session.orders = [];

  req.session.totalAmount = 0;

  var date = new Date(req.query.date).toLocaleDateString();

  req.session.orders.push({
    departure: req.query.departure,
    arrival: req.query.arrival,
    date: date,
    departureTime: req.query.departureTime,
    price: req.query.price,
  });

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
    userAlreadyExist = true;
    emailAlreadyExist = true;
    res.render("signin", {
      userAlreadyExist: userAlreadyExist,
      emailAlreadyExist: emailAlreadyExist,
    });
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
    emailAlreadyExist = false;
    res.render("signin", {
      userAlreadyExist: userAlreadyExist,
      emailAlreadyExist: emailAlreadyExist,
    });
  }
});

router.get("/congrat", async function (req, res, next) {
  if (req.session.user.id) {
    var user = await userModel.findById(req.session.user.id);

    for (var i = 0; i < req.session.orders.length; i++) {
      user.myLastTrips.push({
        departure: req.session.orders[i].departure,
        arrival: req.session.orders[i].arrival,
        date: req.session.orders[i].date,
        departureTime: req.session.orders[i].departureTime,
        price: Number(req.session.orders[i].price),
      });
    }

    var userSaved = await user.save();
  }

  res.render("congrat", { name: req.session.user.name });
});

router.get("/lasttrip", async function (req, res, next) {
  if (req.session.user.id) {
    var user = await userModel.findById(req.session.user.id);
    var mytrips = user.myLastTrips;
    console.log(mytrips);
    res.render("lasttrip", {
      renderdemytrips: mytrips,
      name: req.session.user.name,
    });
  } else {
    res.render("signin", { userAlreadyExist: userAlreadyExist });
  }
});

router.get("/logout", async function (req, res, next) {
  req.session.user = null;
  req.session.orders = null;
  res.redirect("/");
});

<<<<<<< HEAD
=======
// route du paiement Stripe

router.post('/create-checkout-session', async (req, res) => {

  var stripeItems = [];

  for (var i = 0; i < req.session.orders.length; i++) {
    stripeItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${req.session.orders[i].departure} / ${req.session.orders[i].arrival}`
        },
        unit_amount: req.session.orders[i].price * 100,
      },
      quantity: 1,
    });
  }
  

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: stripeItems,
    mode: "payment",
    success_url: "http://localhost:3000/congrat",
    cancel_url: "http://localhost:3000/",
  });

  res.redirect(303, session.url);
});


>>>>>>> 633f18e16d5eeea9acfddfb2b1e35aeb9b05ec85
module.exports = router;
