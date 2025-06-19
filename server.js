// External modules
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Internal modules
const authRoutes = require("./routes/auth");
const visitRoutes = require("./routes/visits");
const userRoutes = require("./routes/users");
const middleware = require("./middleware/index");

// Load the environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// create express app instance
const app = express();

// Middleware to parse request bodies and cookies
app.use(express.json()); // parse request bodies
app.use(cookieParser()); // parse cookies

// App routes
app.use("/api/auth", authRoutes);
app.use("/api/visit", visitRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware and NotFound middleware
app.use(middleware.handleError);
app.use(middleware.handleNotFound);

// connect to database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Mongo DB connected");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("Connection failed!");
    console.error(err);
  });
