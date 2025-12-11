



// const express = require("express");
// const mongoose = require("mongoose");
// const connectDB = require("./dbconfig/dbconnect");
// require("dotenv").config();
// const cors = require("cors");

// // Import routes
// const supervisorRoutes = require("./routes/supervisor");
// const employeeRoutes = require("./routes/employee");
// const siteRoutes = require("./routes/site");
// const projectRoutes = require("./routes/project");
// const allocationRoutes = require("./routes/allocation");

// // Initialize App
// const app = express();

// // =============================
// // 🌐 GLOBAL CORS FIX (ALL ROUTES + PRE-FLIGHT)
// // =============================

//  const corsOptions = {
//   origin: "*", // replace with your frontend URL in productionmethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],};
// app.use(cors(corsOptions));app.options("*", cors(corsOptions)); // handle preflightapp.use(express.json());



// // =============================
// // Body parser
// // =============================
// app.use(express.json());

// // Load environment variables
// const PORT = process.env.PORT || 3000;
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// // =============================
// // 🔌 MongoDB Connection
// // =============================
// connectDB();

// // Connection Status Events
// mongoose.connection.on("connected", () => console.log("🟢 Mongoose connected to DB"));
// mongoose.connection.on("error", (err) => console.error("🔴 Mongoose connection error:", err));
// mongoose.connection.on("disconnected", () => console.warn("🟠 Mongoose disconnected"));

// // =============================
// // 🧩 Routes
// // =============================
// app.use("/", supervisorRoutes(JWT_SECRET));
// app.use("/", employeeRoutes(JWT_SECRET));
// app.use("/", siteRoutes(JWT_SECRET));
// app.use("/", projectRoutes(JWT_SECRET));
// app.use("/", allocationRoutes(JWT_SECRET));

// // Default Route
// app.get("/", (req, res) => res.send("🚀 Attendance Node.js API is running successfully!"));

// // =============================
// // 🚀 Start Server
// // =============================
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./dbconfig/dbconnect");
require("dotenv").config();
const cors = require("cors");
 
// Initialize App
const app = express();
 
// =============================
// 🌐 GLOBAL CORS FIX
// =============================
const corsOptions = {
  origin: "*", // replace with your frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
 
app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // handle preflight for all routes
 
// =============================
// Body parser
// =============================
app.use(express.json());
 
// =============================
// 🔌 MongoDB Connection
// =============================
connectDB();
 
// =============================
// 🧩 Routes (after CORS)
// =============================
const supervisorRoutes = require("./routes/supervisor");
const employeeRoutes = require("./routes/employee");
const siteRoutes = require("./routes/site");
const projectRoutes = require("./routes/project");
const allocationRoutes = require("./routes/allocation");
 
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";
 
app.use("/", supervisorRoutes(JWT_SECRET));
app.use("/", employeeRoutes(JWT_SECRET));
app.use("/", siteRoutes(JWT_SECRET));
app.use("/", projectRoutes(JWT_SECRET));
app.use("/", allocationRoutes(JWT_SECRET));
 
// Default Route
app.get("/", (req, res) => res.send("🚀 Attendance Node.js API is running successfully!"));
 
// =============================
// 🚀 Start Server
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));