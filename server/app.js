require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bootstrapAdmin = require("./services/bootstrapAdmin");

const authRoutes = require("./routes/authRoutes");
const queryRoutes = require("./routes/queryRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

const app = express();

const corsOrigin = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

connectDB()
  .then(() => bootstrapAdmin())
  .catch((err) => console.error("Startup DB/bootstrap error:", err.message));

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/api/health", (req, res) =>
  res.json({
    status: "OK",
    dbConnected: connectDB.isDatabaseConnected(),
    timestamp: new Date(),
  })
);

app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();
  if (connectDB.isDatabaseConnected()) return next();

  try {
    await connectDB();
    return next();
  } catch (err) {
    console.error("DB unavailable for request:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Configure a reachable MONGO_URI and redeploy backend.",
      ...(process.env.NODE_ENV === "development" && { detail: err.message }),
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/departments", departmentRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = err.message || "Internal Server Error";
  const mongoUnavailable = /buffering timed out|server selection timed out|MONGO_URI/i.test(message);

  res.status(err.statusCode || 500).json({
    message: mongoUnavailable
      ? "Database unavailable. Configure a reachable MONGO_URI and redeploy backend."
      : message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;