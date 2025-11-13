// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const supervisorRoutes = require("./routes/supervisor");
// const employeeRoutes = require("./routes/employee");
// const siteRoutes = require("./routes/site");
// const projectRoutes = require("./routes/project");
// const AllocationRoutes = require("./routes/allocation");


// const app = express();
// app.use(express.json());
// app.use(cors());

// const JWT_SECRET = "your_secret_key_here";

// // MongoDB connect
// mongoose.connect('mongodb+srv://bose:1234@cluster0.z0hxk93.mongodb.net/attendance_webapp?retryWrites=true&w=majority', {
//   // useNewUrlParser: true,
//   // useUnifiedTopology: true,
// })
// .then(() => console.log("✅ MongoDB Connected"))
// .catch((err) => console.error("❌ MongoDB Error:", err));



// // Supervisor routes
// app.use("/", supervisorRoutes(JWT_SECRET));

// // Site routes
// app.use("/", siteRoutes(JWT_SECRET));

// // Project routes
// app.use("/", projectRoutes(JWT_SECRET));

// // Employee routes
// app.use("/", employeeRoutes(JWT_SECRET));

// // Allocation Routes 
// app.use("/", AllocationRoutes(JWT_SECRET));

// // Start server
// app.listen(3000, () => console.log("🚀 Server running on 3000"));



// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");

// // Import routes
// const supervisorRoutes = require("./routes/supervisor");
// const employeeRoutes = require("./routes/employee");
// const siteRoutes = require("./routes/site");
// const projectRoutes = require("./routes/project");
// const AllocationRoutes = require("./routes/allocation");
// require("dotenv").config();
// const app = express();
// app.use(express.json());
// app.use(cors());

// const JWT_SECRET = "your_secret_key_here";

// // ✅ MongoDB Connection
// const MONGO_URI = "mongodb+srv://bose:123@cluster0.fqt3e0n.mongodb.net/attendance_webapp?retryWrites=true&w=majority";



// console.log("🔌 Connecting to MongoDB...");

// mongoose.connect(MONGO_URI, {
//   serverSelectionTimeoutMS: 10000, // 10 seconds
// })
//   .then(() => {
//     console.log("✅ MongoDB Connected Successfully");
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err.message);
//     console.error("🔍 Full Error Details:", err);
//   });

// // Check connection state after 5 seconds
// setTimeout(() => {
//   const state = mongoose.connection.readyState;
//   const states = ["disconnected", "connected", "connecting", "disconnecting"];
//   console.log("🔎 MongoDB connection state:", states[state]);
// }, 5000);

// // Handle MongoDB connection events
// mongoose.connection.on("connected", () => {
//   console.log("🟢 Mongoose connected to DB");
// });

// mongoose.connection.on("error", (err) => {
//   console.error("🔴 Mongoose connection error:", err);
// });

// mongoose.connection.on("disconnected", () => {
//   console.warn("🟠 Mongoose disconnected");
// });

// // Routes
// app.use("/", supervisorRoutes(JWT_SECRET));
// app.use("/", employeeRoutes(JWT_SECRET));
// app.use("/", siteRoutes(JWT_SECRET));
// app.use("/", projectRoutes(JWT_SECRET));
// app.use("/", AllocationRoutes(JWT_SECRET));

// // Default route
// app.get("/", (req, res) => {
//   res.send("🚀 Attendance Node.js API is running!");
// });

// // Start server
// //const PORT = 3000;
// app.listen(process.env.PORT, () => {
//   console.log(`🚀 Server running on port ${process.env.PORT}`);
// });

// =============================
// 🟢 Attendance App - Server.js
// =============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Import routes
const supervisorRoutes = require("./routes/supervisor");
const employeeRoutes = require("./routes/employee");
const siteRoutes = require("./routes/site");
const projectRoutes = require("./routes/project");
const allocationRoutes = require("./routes/allocation");

// Initialize App
const app = express();
app.use(express.json());
app.use(cors());

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// =============================
// 🔌 MongoDB Connection
// =============================
async function connectToMongoDB() {
  console.log("🔌 Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGO_URI, {
     
      serverSelectionTimeoutMS: 10000, // 10 seconds
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("⏳ Retrying in 5 seconds...");
    setTimeout(connectToMongoDB, 5000); // Retry connection
  }
}
connectToMongoDB();

// 🔍 Connection Status Events
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
