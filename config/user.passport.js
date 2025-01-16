const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../model/user.model.js");

passport.use(
  new LocalStrategy(
    { usernameField: "email" }, //configure for email
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "incorrect username" });
        }

        const bycyptPassword = await bcrypt.compare(password, user.password); //use await at bycyptPassword other wise it gives invalid access in login
        if (!bycyptPassword) {
          return done(null, false, { message: "incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// create session id
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// find user by session id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
