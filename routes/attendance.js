
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

const express = require("express");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const Allocation = require("../models/Allocation");
const Counter = require("../models/Counter");

module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // 🔐 JWT middleware
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(403).json({
        status: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: "Invalid token",
        });
      }
      req.user = decoded;
      next();
    });
  };

  // 🟢 MARK ATTENDANCE (one allocation → one day)
  router.post("/mark", verifyToken, async (req, res) => {
    try {
      const { allocationid } = req.body;

      if (!allocationid) {
        return res.status(400).json({
          status: false,
          message: "allocationid required",
        });
      }

      // 🔍 find allocation
      const allocation = await Allocation.findOne({ allocationid });
      if (!allocation) {
        return res.status(404).json({
          status: false,
          message: "Allocation not found",
        });
      }

      // 📅 today (00:00)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ❌ duplicate check (allocation + today)
      const exists = await Attendance.findOne({
        allocationid,
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

      // 🔢 generate attendanceid
      const counter = await Counter.findOneAndUpdate(
        { name: "Attendance" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;

      // 👷 employees from allocation
      const employees = allocation.employee.map(emp => ({
        id: emp.id,
        employeeid: emp.employeeid,
        employeename: emp.employeename,
        attendancestatus: "",
      }));

      // 📝 save attendance
      const attendance = new Attendance({
        attendanceid,
        allocationid,
        attendanceDate: today,

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

  // 📄 GET ALL ATTENDANCE (ELLAME VARUM)
  router.post("/getAll", verifyToken, async (req, res) => {
    try {
      const { allocationid } = req.body;

      let filter = {};
      if (allocationid) {
        filter.allocationid = allocationid;
      }

      const attendanceList = await Attendance.find(filter)
        .sort({ attendanceDate: -1 });

      res.json({
        status: true,
        count: attendanceList.length,
        data: attendanceList,
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
