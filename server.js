// External modules
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Internal modules
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const visitRoutes = require("./routes/visits");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const middleware = require("./middleware/index");

// Load the environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// create express app instance
const app = express();

// Define allowed front-end origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-2-beta-swart.vercel.app",
]

// Middleware to parse request bodies, cookies, and also allow cors
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS!"))
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "Accept"], // allow these headers
    credentials: true, // allow cookies to be sent
  })
);
app.use(express.json()); // parse request bodies
app.use(cookieParser()); // parse cookies

// App routes
app.use("/api", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware and NotFound middleware
app.use(middleware.handleError);
app.use(middleware.handleNotFound);

// connect to database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("Connection failed!");
  });
