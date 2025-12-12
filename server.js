const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./dbconfig/dbconnect");
require("dotenv").config();
const cors = require("cors");
 
const supervisorRoutes = require("./routes/supervisor");
const employeeRoutes = require("./routes/employee");
const siteRoutes = require("./routes/site");
const projectRoutes = require("./routes/project");
const allocationRoutes = require("./routes/allocation");
const mobileSupervisorRoutes = require("./routes/mobileSupervisor");
const attendanceRoutes = require("./routes/attendance");
 
// Initialize App
const app = express();
 
app.use(cors());
 
app.use(express.json());
 
connectDB();
 
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";
 
app.use("/", supervisorRoutes(JWT_SECRET));
app.use("/", employeeRoutes(JWT_SECRET));
app.use("/", siteRoutes(JWT_SECRET));
app.use("/", projectRoutes(JWT_SECRET));
app.use("/", allocationRoutes(JWT_SECRET));
app.use("/mobile/supervisor", mobileSupervisorRoutes);
app.use("/attendance", attendanceRoutes);
 
// Default Route
app.get("/", (req, res) => res.send("🚀 Attendance Node.js API is running successfully!"));
 
// =============================
// 🚀 Start Server
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));