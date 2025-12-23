
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

  // JWT middleware
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(403).json({ status: false, message: "No token provided" });
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ status: false, message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // --- MARK / CREATE ATTENDANCE ---
  router.post("/mark", verifyToken, async (req, res) => {
    try {
      const { allocationid, employee } = req.body;

      if (!allocationid || !employee || !employee.length)
        return res.status(400).json({ status: false, message: "allocationid and employee list required" });

      const validStatuses = ["Present", "Absent", "Leave", ""];
      for (const e of employee) {
        if (!validStatuses.includes(e.attendancestatus)) {
          return res.status(400).json({
            status: false,
            message: `Invalid attendancestatus for employee ${e.employeeid || e.id}`,
          });
        }
      }

      // Find Allocation
      const allocation = await Allocation.findOne({ allocationid });
      if (!allocation)
        return res.status(404).json({ status: false, message: "Allocation not found" });

      // Today's date range
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Check if Attendance exists for today
      let attendance = await Attendance.findOne({
        allocationid,
        attendanceDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!attendance) {
        // Generate new attendanceid
        const counter = await Counter.findOneAndUpdate(
          { name: "Attendance" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;

        // Create Attendance using request body employees
        const finalEmployee = employee.map((emp, idx) => ({
          id: emp.id || String(idx + 1),
          employeeid: emp.employeeid || `EMP${String(idx + 1).padStart(3, "0")}`,
          employeename: emp.employeename || "",
          attendancestatus: emp.attendancestatus || "",
        }));

        attendance = new Attendance({
          attendanceid,
          allocationid,
          attendanceDate: new Date(),
          fromDate: allocation.fromDate,
          toDate: allocation.toDate,
          createdby: allocation.supervisorname,
          supervisorid: allocation.supervisorid,
          supervisorname: allocation.supervisorname,
          projectid: allocation.projectid,
          projectname: allocation.projectname,
          siteid: allocation.siteid,
          sitename: allocation.sitename,
          employee: finalEmployee,
        });
      } else {
        // Update existing Attendance using request body
        employee.forEach(e => {
          const idx = attendance.employee.findIndex(emp => emp.employeeid === e.employeeid || emp.id === e.id);
          if (idx > -1) {
            attendance.employee[idx].attendancestatus = e.attendancestatus;
            attendance.employee[idx].employeename = e.employeename || attendance.employee[idx].employeename;
          }
        });
      }

      await attendance.save();

      res.json({ status: true, message: "Attendance marked successfully", data: attendance });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error", error: err.message });
    }
  });

  // --- GET ALL ATTENDANCE ---
  router.post("/getAll", verifyToken, async (req, res) => {
    try {
      const { id, type } = req.body;
      let filter = {};
      if (type === "Supervisor") {
        if (!id) return res.status(400).json({ status: false, message: "Supervisor id required" });
        filter = { supervisorid: id };
      }

      const data = await Attendance.find(filter).sort({ attendanceDate: -1 });
      res.json({ status: true, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Error fetching attendance", error: err.message });
    }
  });

  return router;
};
