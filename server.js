const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "config.env") });

// Catching Unhandled Exceptions!
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED EXCEPTION 💥 Shutting down...");
  // Exit immediately
  process.exit(1);
});

const app = require("./app");

(async () => {
  // Setting up the SERVER!
  const [port, host] = [process.env.PORT || 8080, "localhost"];
  const Server = app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}...`);
  });

  // Catching Unhandled Rejection!
  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION 💥 Shutting down...");
    // Exit Gracefully!
    Server.close(() => {
      process.exit(1);
    });
  });

  // Setting up the DATABASE!
  await mongoose.connect(process.env.DATABASE);

  console.log(process.env.NODE_ENV);
  console.log("DB Connected Successfully.");
})();
