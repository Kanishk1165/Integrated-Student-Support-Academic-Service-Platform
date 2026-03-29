require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bootstrapAdmin = require("./services/bootstrapAdmin");
const { getDbClient } = require("./services/supabaseDbService");

const authRoutes = require("./routes/authRoutes");
const queryRoutes = require("./routes/queryRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

const app = express();

bootstrapAdmin().catch((err) => console.error("Startup bootstrap error:", err.message));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/api/health", async (req, res) => {
  const supabase = getDbClient();
  if (!supabase) {
    return res.status(500).json({
      status: "ERROR",
      supabaseConnected: false,
      message: "Supabase DB client is not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
      timestamp: new Date(),
    });
  }

  const { error } = await supabase.from("profiles").select("id").limit(1);
  return res.status(error ? 500 : 200).json({
    status: error ? "ERROR" : "OK",
    supabaseConnected: !error,
    ...(error && { message: error.message }),
    timestamp: new Date(),
  });
});

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