const express = require("express");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/attendance");
const Allocation = require("../models/Allocation");

module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // JWT middleware
  const verifyToken = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(403).json({ status: false });

    jwt.verify(auth.split(" ")[1], JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ status: false });
      req.user = decoded;
      next();
    });
  };

  // ✅ MARK ATTENDANCE
 router.post("/mark", verifyToken, async (req, res) => {
  try {
    const { allocationid, createdby, employee } = req.body;

    if (!allocationid)
      return res.status(400).json({
        status: false,
        message: "allocationid required",
      });

    const allocation = await Allocation.findOne({ allocationid });
    if (!allocation)
      return res.status(404).json({
        status: false,
        message: "Allocation not found",
      });

    const attendanceDate = new Date().toISOString().split("T")[0];

    const attendance = new Attendance({
      allocationid,
      supervisorid: allocation.supervisorid,
      supervisorname: allocation.supervisorname,
      projectid: allocation.projectid,
      projectname: allocation.projectname,
      siteid: allocation.siteid,
      sitename: allocation.sitename,
      fromDate: allocation.fromDate,
      toDate: allocation.toDate,
      attendanceDate,
      createdby,

      employee: allocation.employee.map((emp) => {
        const upd = employee.find(
          (e) => e.employeeid === emp.employeeid
        );
        return {
          id: emp.id,
          employeeid: emp.employeeid,
          employeename: emp.employeename,
          attendancestatus: upd ? upd.attendancestatus : "Absent",
        };
      }),
    });

    await attendance.save();

    res.json({
      status: true,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Attendance already marked for today",
      });
    }
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
});


  // GET ALL
  router.post("/getAll", verifyToken, async (req, res) => {
    try {
      const { id, type } = req.body;
  
      let filter = {};
  
      if (type === "Supervisor") {
        if (!id) {
          return res.status(400).json({ status: false, message: "Supervisor id required" });
        }
  
        // 🔒 Only allocations that have supervisorid and match
        filter = { supervisorid: id };
      }
      // Admin → empty filter → all allocations
  
      const data = await Allocation.find(filter).sort({ id: 1 });
  
      res.json({ status: true, data });
    } catch (err) {
      console.error("❌ Error fetching Attendance:", err);
      res.status(500).json({
        status: false,
        message: "Error fetching Attendance",
        error: err.message,
      });
    }
  });

  return router;
};
