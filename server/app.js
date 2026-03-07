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

connectDB()
  .then(() => bootstrapAdmin())
  .catch((err) => console.error("Startup DB/bootstrap error:", err.message));

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/departments", departmentRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;