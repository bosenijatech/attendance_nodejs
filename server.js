
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const connectDB = require("./dbconfig/dbconnect");
// require("dotenv").config();

// // Import routes
// const supervisorRoutes = require("./routes/supervisor");
// const employeeRoutes = require("./routes/employee");
// const siteRoutes = require("./routes/site");
// const projectRoutes = require("./routes/project");
// const allocationRoutes = require("./routes/allocation");

// // Initialize App
// const app = express();
// app.use(express.json());
// app.use(cors());

// // Load environment variables
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// // =============================
// // 🔌 MongoDB Connection
// // =============================

// connectDB();

// // 🔍 Connection Status Events
// mongoose.connection.on("connected", () => {
//   console.log("🟢 Mongoose connected to DB");
// });
// mongoose.connection.on("error", (err) => {
//   console.error("🔴 Mongoose connection error:", err);
// });
// mongoose.connection.on("disconnected", () => {
//   console.warn("🟠 Mongoose disconnected");
// });

// // =============================
// // 🧩 Routes
// // =============================
// app.use("/", supervisorRoutes(JWT_SECRET));
// app.use("/", employeeRoutes(JWT_SECRET));
// app.use("/", siteRoutes(JWT_SECRET));
// app.use("/", projectRoutes(JWT_SECRET));
// app.use("/", allocationRoutes(JWT_SECRET));

// // Default Route
// app.get("/", (req, res) => {
//   res.send("🚀 Attendance Node.js API is running successfully!");
// });

// // =============================
// // 🚀 Start Server
// // =============================
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const connectDB = require("./dbconfig/dbconnect");
// require("dotenv").config();

// // Import routes
// const supervisorRoutes = require("./routes/supervisor");
// const employeeRoutes = require("./routes/employee");
// const siteRoutes = require("./routes/site");
// const projectRoutes = require("./routes/project");
// const allocationRoutes = require("./routes/allocation");

// // Initialize App
// const app = express();

// // =============================
// // 🛠 FIXED CORS (Flutter + Render)
// // =============================
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//    credentials: true,
// }));

// app.use(express.json());

// // Load environment variables
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// // =============================
// // 🔌 MongoDB Connection
// // =============================
// connectDB();

// // Connection Status Events
// mongoose.connection.on("connected", () => {
//   console.log("🟢 Mongoose connected to DB");
// });
// mongoose.connection.on("error", (err) => {
//   console.error("🔴 Mongoose connection error:", err);
// });
// mongoose.connection.on("disconnected", () => {
//   console.warn("🟠 Mongoose disconnected");
// });

// // =============================
// // 🧩 Routes
// // =============================
// app.use("/", supervisorRoutes(JWT_SECRET));
// app.use("/", employeeRoutes(JWT_SECRET));
// app.use("/", siteRoutes(JWT_SECRET));
// app.use("/", projectRoutes(JWT_SECRET));
// app.use("/", allocationRoutes(JWT_SECRET));

// // Default Route
// app.get("/", (req, res) => {
//   res.send("🚀 Attendance Node.js API is running successfully!");
// });

// // =============================
// // 🚀 Start Server
// // =============================
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



// server.js
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const connectDB = require("./dbconfig/dbconnect");
require("dotenv").config();

// Import routes
const supervisorRoutes = require("./routes/supervisor");
const employeeRoutes = require("./routes/employee");
const siteRoutes = require("./routes/site");
const projectRoutes = require("./routes/project");
const allocationRoutes = require("./routes/allocation");

// Initialize App
const app = express();

// =============================
// 🌐 GLOBAL CORS FIX (ALL ROUTES + PRE-FLIGHT)
// =============================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// =============================
// Body parser
// =============================
app.use(express.json());

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// =============================
// 🔌 MongoDB Connection
// =============================
connectDB();

// Connection Status Events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to DB");
});
mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("🟠 Mongoose disconnected");
});

// =============================
// 🧩 Routes
// =============================
app.use("/", supervisorRoutes(JWT_SECRET));
app.use("/", employeeRoutes(JWT_SECRET));
app.use("/", siteRoutes(JWT_SECRET));
app.use("/", projectRoutes(JWT_SECRET));
app.use("/", allocationRoutes(JWT_SECRET));

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Attendance Node.js API is running successfully!");
});

// =============================
// 🚀 Start Server
// =============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
