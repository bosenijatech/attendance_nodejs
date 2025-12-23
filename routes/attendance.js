const express = require("express");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const Allocation = require("../models/Allocation");

module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // 🔐 JWT Verification Middleware
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res
        .status(403)
        .json({ status: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(401)
          .json({ status: false, message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // 🟢 MARK ATTENDANCE
  router.post("/mark", verifyToken, async (req, res) => {
    try {
      const { allocationid, createdby, employee } = req.body;

      if (!allocationid || !createdby || !employee || !Array.isArray(employee)) {
        return res.status(400).json({ status: false, message: "Required fields missing" });
      }

      // Get allocation details
      const allocation = await Allocation.findOne({ allocationid });
      if (!allocation) return res.status(404).json({ status: false, message: "Allocation not found" });

      // Generate a unique attendance ID (timestamp + random)
      const attendanceid = `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const attendance = new Attendance({
        attendanceid,
        allocationid: allocation.allocationid,
        supervisorid: allocation.supervisorid,
        supervisorname: allocation.supervisorname,
        projectid: allocation.projectid,
        projectname: allocation.projectname,
        siteid: allocation.siteid,
        sitename: allocation.sitename,
        fromDate: allocation.fromDate,
        toDate: allocation.toDate,
        attendancedate: new Date(), // current date/time
        createdby,
        employee: allocation.employee.map(emp => {
          const updated = employee.find(e => e.employeeid === emp.employeeid);
          return {
            id: emp.id,
            employeeid: emp.employeeid,
            employeename: emp.employeename,
            attendancestatus: updated && ["Present", "Absent", "Leave"].includes(updated.attendancestatus)
              ? updated.attendancestatus
              : ""
          };
        })
      });

      const saved = await attendance.save();

      res.status(200).json({
        status: true,
        message: "Attendance marked successfully",
        data: saved
      });

    } catch (err) {
      console.error("❌ Error marking attendance:", err);
      res.status(500).json({ status: false, message: "Internal Server Error", error: err.message });
    }
  });

  // 📝 GET ALL ATTENDANCE
  router.post("/getAll", verifyToken, async (req, res) => {
    try {
      const { id, type } = req.body;
      let filter = {};

      if (type === "Supervisor") {
        if (!id) return res.status(400).json({ status: false, message: "Supervisor id required" });
        filter = { supervisorid: id };
      }
      // Admin → empty filter → all attendance

      const data = await Attendance.find(filter).sort({ attendancedate: -1 });
      res.status(200).json({ status: true, data });

    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
      res.status(500).json({ status: false, message: "Error fetching attendance", error: err.message });
    }
  });

  return router;
};
