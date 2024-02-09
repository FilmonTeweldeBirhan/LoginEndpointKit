const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./../../models/userModel");
const bcrypt = require("bcryptjs");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const verifyCallback = async (username, password, done) => {
  try {
    const user = await User.findOne({ email: username }).select("+password");

    // if there is no user found!
    if (!user)
      return done(null, false, { message: "Incorrect email or password." });
    if (!(await user.correctPassword(password, user.password)))
      return done(null, false, { message: "Incorrect email or password." });

    return done(null, user);
  } catch (err) {
    done(err);
  }
};

const Strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(Strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  if (!user) return done(null, false);
  done(null, user);
});
