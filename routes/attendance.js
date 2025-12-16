



// const express = require("express");
// const router = express.Router();
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

//     const attendance = new Attendance({
//       supervisorid,
//       supervisorname,
//       employee,   // ← ARRAY of employees
//       projectid,
//       projectname,
//       siteid,
//       sitename,
//       fromDate,
//       toDate,
//       status,
//       createdby,
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
//       message: "Server Error",
//       error: err.message
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();   // 👈 THIS LINE IS MANDATORY

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

    // 📅 today range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    
    const alreadyMarked = await Attendance.findOne({
      supervisorid,
      projectid,
      siteid,
      currentDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (alreadyMarked) {
      return res.status(409).json({
        status: false,
        message: "Attendance already marked for today"
      });
    }

    const attendance = new Attendance({
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
      message: err.message
    });
  }
});

module.exports = router;   // 👈 THIS ALSO REQUIRED
