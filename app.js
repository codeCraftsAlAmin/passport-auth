// requires
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const ejs = require("ejs");

const Users = require("./model/user.model");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("./config/user.config");
require("./config/user.db");
require("./config/user.passport");

const bcrypt = require("bcrypt");
const passport = require("passport");
const saltRounds = 10;

app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// express-session cookie
app.set("trust proxy", 1);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      collectionName: "sessions",
    }),
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// register:get
app.get("/register", (req, res) => {
  res.render("register");
});

// register:post
app.post("/register", async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.body.username });
    if (user) {
      return res.status(200).send({ message: "user already exits" });
    }

    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      const newUsers = new Users({
        username: req.body.username,
        email: req.body.email,
        password: hash,
      });
      await newUsers.save();
      res.render("login");
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// login:get
const checkLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  return next();
};

app.get("/login", checkLogin, (req, res) => {
  res.render("login");
});

// login:post
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/profile",
  })
);

// profile
const checkProfile = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.use("/profile", checkProfile, (req, res) => {
  res.render("profile");
});

// logout
app.get("/logout", (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// base route
app.get("/", (req, res) => {
  res.status(201).render("index");
});

module.exports = app;
