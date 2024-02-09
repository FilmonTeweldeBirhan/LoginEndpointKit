const path = require("path");
const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const APPError = require("./utils/APPError.js");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const app = express();

/* Use Helmet! */
app.use(helmet());

/* Used cors! */
app.use(
  cors({
    origin: [process.env.DOMAIN],
    credentials: true,
  })
);

/* Rate Limitter */
const limitter = rateLimit({
  limit: 50,
  windowMs: 60 * 60 * 1000,
  message: "too many request, please try again later.",
});

// app.use(limitter);

/* Data sanitization against NOSQL attack */
app.use(mongoSanitize());

/* Prevent parameter pollution but with exceptions! */
app.use(
  hpp({
    whitelist: ["product_price", "product_duration"],
  })
);

/* =========== SETTING UP PUG  =========== */
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

/* Bug fix only for windows */
if (process.env.NODE_ENV !== "development") {
  process.env.NODE_ENV = "production";
  // console.log(process.env.NODE_ENV, "ofcourse this is production:)");
}

// Use morgan only in dev Mode!
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parsing bodys
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Serving Static Files
app.use(express.static(path.join(__dirname, "public")));

/* =========== SESSION SETUP  =========== */
const sessionStore = MongoStore.create({
  mongoUrl: process.env.DATABASE,
  collectionName: "sessions",
});

const options = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};

if (app.get("env") === "production") {
  options.cookie.secure = true;
}

app.use(session(options));

/* =========== PASSPORT AUTHENTICATION  =========== */
// Need to require the passport configuration
require("./controllers/passportConfig/passport");

// Helps to keep persistance session in database
app.use(passport.initialize());
app.use(passport.session());

// consoling info for testing purpose.
app.use((req, res, next) => {
  console.log("SESSION:", req.session);
  console.log("USER:", req.user);
  console.log("isAuthenticated:", req.isAuthenticated());

  next();
});

/* =========== ROUTE  =========== */
app.use("/api/v1/users", userRouter);

/* For giving info about authetic ation! */
app.get("/isAuth", (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    role: req.user.role,
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello from the back-end.</h1>");
});

/* =========== Error Handleres  =========== */
app.use((req, res, next) => {
  next(new APPError(`Can't ${req.method} ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
