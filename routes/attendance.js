// const express = require("express");
// const router = express.Router();
// const Attendance = require("../models/attendance");

// // MARK ATTENDANCE
// router.post("/mark", async (req, res) => {
//   try {
//     const {
//       supervisorid,
//       supervisorname,
//       employeeid,
//       employeename,
//       projectid,
//       projectname,
//       siteid,
//       sitename,
//       attendanceDate,
//       status
//     } = req.body;

//     // Check if already marked for same date
//     const existing = await Attendance.findOne({
//       employeeid,
//       attendanceDate: new Date(attendanceDate)
//     });

//     if (existing) {
//       return res.status(400).json({
//         status: false,
//         message: "Attendance already marked for this employee"
//       });
//     }

//     const attendance = new Attendance({
//       supervisorid,
//       supervisorname,
//       employeeid,
//       employeename,
//       projectid,
//       projectname,
//       siteid,
//       sitename,
//       attendanceDate,
//       status,
//     });

//     const savedData = await attendance.save();

//     res.json({
//       status: true,
//       message: "Attendance marked successfully",
//       data: savedData
//     });

//   } catch (err) {
//     res.status(500).json({
//       status: false,
//       message: "Server Error",
//       error: err.message
//     });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");

// CREATE ATTENDANCE ENTRY
router.post("/mark", async (req, res) => {
  try {
    const {
      supervisorid,
      supervisorname,
      employee,
      projectid,
      projectname,
      siteid,
      sitename,
      fromDate,
      toDate,
      status,
      createdby
    } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        status: false,
        message: "fromDate and toDate are required"
      });
    }

    const attendance = new Attendance({
      supervisorid,
      supervisorname,
      employee,   // ← ARRAY of employees
      projectid,
      projectname,
      siteid,
      sitename,
      fromDate,
      toDate,
      status,
      createdby,
    });

    const saved = await attendance.save();

    res.json({
      status: true,
      message: "Attendance saved successfully",
      data: saved
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server Error",
      error: err.message
    });
  }
});

module.exports = router;
