
// const express = require("express");
// const router = express.Router();   // 👈 THIS LINE IS MANDATORY
// const verifyToken = require("../middlewares/verifyToken");
// const Attendance = require("../models/attendance");

// // CREATE ATTENDANCE ENTRY
// router.post("/mark", async (req, res) => {
//   try {
//     const {
//       supervisorid,
//       supervisorname,
//       employee,
//       projectid,
//       projectname,
//       siteid,
//       sitename,
//       fromDate,
//       toDate,
//       status,
//       createdby
//     } = req.body;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         status: false,
//         message: "fromDate and toDate are required"
//       });
//     }

//     // 📅 today range
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

    
//     const alreadyMarked = await Attendance.findOne({
//       supervisorid,
//       projectid,
//       siteid,
//       currentDate: { $gte: startOfDay, $lte: endOfDay }
//     });

//     if (alreadyMarked) {
//       return res.status(400).json({
//         status: false,
//         message: "Attendance already marked for today"
//       });
//     }

//     const attendance = new Attendance({
//       supervisorid,
//       supervisorname,
//       employee,
//       projectid,
//       projectname,
//       siteid,
//       sitename,
//       fromDate,
//       toDate,
//       status,
//       createdby
//     });

//     const saved = await attendance.save();

//     res.json({
//       status: true,
//       message: "Attendance saved successfully",
//       data: saved
//     });

//   } catch (err) {
//     res.status(500).json({
//       status: false,
//       message: err.message
//     });
//   }
// });


// router.post("/getAll", verifyToken, async (req, res) => {
//   try {
//     const { id, type } = req.body;

//     let filter = {};

//     if (type === "Supervisor") {
//       if (!id) {
//         return res.status(400).json({ status: false, message: "Supervisor id required" });
//       }

//       // 🔒 Only Attendance that have supervisorid and match
//       filter = { supervisorid: id };
//     }
//     // Admin → empty filter → all Attendance

//     const data = await Attendance.find(filter).sort({ id: 1 });

//     res.json({ status: true, data });
//   } catch (err) {
//     console.error("❌ Error fetching attendance:", err);
//     res.status(500).json({
//       status: false,
//       message: "Error fetching attendance",
//       error: err.message,
//     });
//   }
// });


// module.exports = router;   // 👈 THIS ALSO REQUIRED


// routes/attendance.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const Allocation = require("../models/Allocation");
const Counter = require("../models/Counter");

module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // 🔐 JWT Middleware
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(403).json({ status: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ status: false, message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // 🟢 MARK ATTENDANCE (ONE ALLOCATION → ONE DAY)
  router.post("/mark", verifyToken, async (req, res) => {
    try {
      const { id } = req.body; // 🔥 allocationid = id

      if (!id) {
        return res.status(400).json({
          status: false,
          message: "allocation id required",
        });
      }

      // 🔍 Find allocation
      const allocation = await Allocation.findOne({ id });
      if (!allocation) {
        return res.status(404).json({
          status: false,
          message: "Allocation not found",
        });
      }

      // 📅 Today date (00:00:00)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ❌ Duplicate check (one allocation per day)
      const exists = await Attendance.findOne({
        id,
        attendanceDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (exists) {
        return res.status(409).json({
          status: false,
          message: "Today attendance already marked for this allocation",
        });
      }

      // 🔢 Generate attendanceid
      const counter = await Counter.findOneAndUpdate(
        { name: "Attendance" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;

      // 👷 Employees from allocation
      const employees = allocation.employee.map(emp => ({
        employeeid: emp.employeeid,
        employeename: emp.employeename,
        attendancestatus: "",
      }));

      // 📝 Create attendance
      const attendance = new Attendance({
        attendanceid,
        id, // allocation id
        attendanceDate: today,
        fromDate: allocation.fromDate,
        toDate: allocation.toDate,
        supervisorid: allocation.supervisorid,
        supervisorname: allocation.supervisorname,
        projectid: allocation.projectid,
        projectname: allocation.projectname,
        siteid: allocation.siteid,
        sitename: allocation.sitename,
        employee: employees,
      });

      const saved = await attendance.save();

      res.json({
        status: true,
        message: "Attendance marked successfully",
        data: saved,
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Server error",
        error: err.message,
      });
    }
  });

  // 📄 GET ALL ATTENDANCE BY ALLOCATION ID
  router.post("/getAll", verifyToken, async (req, res) => {
    try {
      const { id } = req.body; // allocation id

      if (!id) {
        return res.status(400).json({
          status: false,
          message: "allocation id required",
        });
      }

      const data = await Attendance.find({ id })
        .sort({ attendanceDate: -1 });

      res.json({
        status: true,
        data,
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Error fetching attendance",
        error: err.message,
      });
    }
  });

  return router;
};
