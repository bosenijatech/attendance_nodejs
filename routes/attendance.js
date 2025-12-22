
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
      return res.status(400).json({
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


router.post("/getAllAttendance", verifyToken, async (req, res) => {
  try {
    const { id, type } = req.body;

    let filter = {};

    if (type === "Supervisor") {
      if (!id) {
        return res.status(400).json({ status: false, message: "Supervisor id required" });
      }

      // 🔒 Only Attendance that have supervisorid and match
      filter = { supervisorid: id };
    }
    // Admin → empty filter → all Attendance

    const data = await Attendance.find(filter).sort({ id: 1 });

    res.json({ status: true, data });
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching attendance",
      error: err.message,
    });
  }
});


module.exports = router;   // 👈 THIS ALSO REQUIRED
