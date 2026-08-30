require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const employeeRoutes = require("./routes/employeeroutes");
const authRoutes = require("./routes/authroutes");
const farmerroutes = require("./routes/farmerroutes");
const dashboardroutes = require("./routes/dashboardroutes");
const attendanceroutes = require("./routes/attendanceroutes");
const meetingroutes = require("./routes/meetingroutes");
const fieldvisitroutes = require("./routes/feildvisitroutes");
const taskroutes = require("./routes/taskroutes");
const notificationroutes = require("./routes/notificationroutes");
const leaveroutes = require("./routes/leaveroutes");
const { protect } = require("./middleware/authmiddleware");
const {authorizeRoles}= require("./middleware/rolemiddleware");
const profileroutes = require("./routes/profileroutes");


const app = express();

// Database is connected before the HTTP server starts.

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerroutes);
app.use("/api/attendance", attendanceroutes);
app.use("/api/dashboard", dashboardroutes);
app.use("/api/meetings", meetingroutes);
app.use("/api/fieldvisits", fieldvisitroutes);
app.use("/api/tasks", taskroutes);
app.use("/api/notifications", notificationroutes);
app.use("/api/leaves", leaveroutes);
app.use("/api/profile", protect, authorizeRoles("FA"), profileroutes);


// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LDR Agrofarms Management API is running",
  });
});

// Server
const PORT = Number(process.env.PORT) || 5000;
console.log("JWT CHECK:", process.env.JWT_SECRET ? "JWT_SECRET FOUND" : "JWT_SECRET MISSING");

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});