// const express = require("express");
// const jwt = require("jsonwebtoken");
// const Attendance = require("../models/Attendance");
// const Allocation = require("../models/Allocation");

// module.exports = (JWT_SECRET) => {
//   const router = express.Router();

//   // 🔐 JWT verification middleware
//   const verifyToken = (req, res, next) => {
//     const auth = req.headers.authorization;
//     if (!auth)
//       return res.status(403).json({ status: false, message: "No token provided" });

//     jwt.verify(auth.split(" ")[1], JWT_SECRET, (err, decoded) => {
//       if (err)
//         return res.status(401).json({ status: false, message: "Invalid token" });
//       req.user = decoded;
//       next();
//     });
//   };

//   // ✅ MARK ATTENDANCE
//   router.post("/mark", verifyToken, async (req, res) => {
//     try {
//       const { allocationid, attendancedate, createdby, employee } = req.body;

//       if (!allocationid || !attendancedate) {
//         return res.status(400).json({
//           status: false,
//           message: "allocationid & attendancedate are required",
//         });
//       }

//       // 🔹 Fetch Allocation
//       const allocation = await Allocation.findOne({ allocationid });
//       if (!allocation) {
//         return res.status(404).json({ status: false, message: "Allocation not found" });
//       }

//       // 🔹 Check required fields
//       if (!allocation.projectid || !allocation.siteid) {
//         return res.status(400).json({
//           status: false,
//           message: "Allocation is missing required fields: projectid or siteid",
//         });
//       }

//       // 🔹 Check if attendance already exists
//       const existing = await Attendance.findOne({ allocationid, attendancedate });
//       if (existing) {
//         return res.status(400).json({
//           status: false,
//           message: "Attendance already marked for this date",
//         });
//       }

//       // 🔹 Prepare employee array with status
//       const attendanceEmployees = allocation.employee.map((emp) => {
//         const empStatus = employee?.find((e) => e.employeeid === emp.employeeid);
//         return {
//           id: emp.id,
//           employeeid: emp.employeeid,
//           employeename: emp.employeename,
//           attendancestatus: empStatus?.attendancestatus || "Absent",
//         };
//       });

//       // 🔹 Create Attendance
//       const attendance = new Attendance({
//         allocationid,
//         attendancedate,
//         createdby: createdby || "System",
//         supervisorid: allocation.supervisorid,
//         supervisorname: allocation.supervisorname,
//         projectid: allocation.projectid,
//         projectname: allocation.projectname,
//         siteid: allocation.siteid,
//         sitename: allocation.sitename,
//         employee: attendanceEmployees,
//       });

//       await attendance.save();

//       res.json({
//         status: true,
//         message: "Attendance marked successfully",
//         data: attendance,
//       });
//     } catch (err) {
//       console.error("❌ Error marking attendance:", err);
//       res.status(500).json({
//         status: false,
//         message: "Server error",
//         error: err.message,
//       });
//     }
//   });

//   // ✅ GET ALL ATTENDANCE
//   router.post("/getAll", verifyToken, async (req, res) => {
//     try {
//       const { id, type } = req.body;

//       let filter = {};

//       if (type === "Supervisor") {
//         if (!id) {
//           return res.status(400).json({ status: false, message: "Supervisor id required" });
//         }
//         filter = { supervisorid: id };
//       }

//       const data = await Attendance.find(filter).sort({ id: 1 });

//       res.json({ status: true, data });
//     } catch (err) {
//       console.error("❌ Error fetching Attendance:", err);
//       res.status(500).json({
//         status: false,
//         message: "Error fetching Attendance",
//         error: err.message,
//       });
//     }
//   });

//   return router;
// };


const express = require("express");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const Allocation = require("../models/Allocation");

module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // 🔐 JWT verification middleware
  const verifyToken = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(403).json({ status: false, message: "No token provided" });

    jwt.verify(auth.split(" ")[1], JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ status: false, message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // ✅ MARK ATTENDANCE
// router.post("/mark", verifyToken, async (req, res) => {
//   try {
//     const { allocationid, attendancedate, createdby, employee } = req.body;

//     if (!allocationid || !attendancedate) {
//       return res.status(400).json({
//         status: false,
//         message: "allocationid & attendancedate are required",
//       });
//     }

//     // 🔹 Fetch Allocation
//     const allocation = await Allocation.findOne({ allocationid });
//     if (!allocation) {
//       return res.status(404).json({ status: false, message: "Allocation not found" });
//     }

//     // 🔹 Use fromDate & toDate from Allocation
//     const { fromDate, toDate } = allocation;
//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         status: false,
//         message: "Allocation is missing fromDate or toDate",
//       });
//     }

//     // 🔹 Check if attendance already exists
//     const existing = await Attendance.findOne({ allocationid, attendancedate });
//     if (existing) {
//       return res.status(400).json({
//         status: false,
//         message: "Attendance already marked for this date",
//       });
//     }

//     // 🔹 Normalize enum values
//     const normalizeStatus = (status) => {
//       if (!status) return "Absent";
//       const s = status.toLowerCase();
//       if (s === "present") return "Present";
//       if (s === "leave") return "Leave";
//       return "Absent";
//     };

//     // 🔹 Prepare employee array with normalized status
//     const attendanceEmployees = allocation.employee.map((emp) => {
//       const empStatus = employee?.find((e) => e.employeeid === emp.employeeid);
//       return {
//         id: emp.id,
//         employeeid: emp.employeeid,
//         employeename: emp.employeename,
//         attendancestatus: normalizeStatus(empStatus?.attendancestatus),
//       };
//     });

//     // 🔹 Create Attendance
//     const attendance = new Attendance({
//       allocationid,
//       attendancedate,
//       createdby: createdby || "System",
//       supervisorid: allocation.supervisorid,
//       supervisorname: allocation.supervisorname,
//       projectid: allocation.projectid,
//       projectname: allocation.projectname,
//       siteid: allocation.siteid,
//       sitename: allocation.sitename,
//       fromDate,
//       toDate,
//       employee: attendanceEmployees,
//     });

//     await attendance.save();

//     res.json({
//       status: true,
//       message: "Attendance marked successfully",
//       data: attendance,
//     });
//   } catch (err) {
//     console.error("❌ Error marking attendance:", err);
//     res.status(500).json({
//       status: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });


router.post("/mark", verifyToken, async (req, res) => {
  try {
    const { allocationid, createdby, employee } = req.body;

    if (!allocationid) {
      return res.status(400).json({
        status: false,
        message: "allocationid is required",
      });
    }

    // 🕒 AUTO GENERATE attendance date (ISO format)
    const attendancedate = new Date().toISOString();
    // example: 2025-12-23T10:41:24.024Z

    // 🔹 Fetch Allocation
    const allocation = await Allocation.findOne({ allocationid });
    if (!allocation) {
      return res.status(404).json({
        status: false,
        message: "Allocation not found",
      });
    }

    const { fromDate, toDate } = allocation;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        status: false,
        message: "Allocation missing fromDate or toDate",
      });
    }

    // 🔹 Prevent duplicate attendance for SAME DAY
    const today = attendancedate.split("T")[0]; // YYYY-MM-DD

    const existing = await Attendance.findOne({
      allocationid,
      attendancedate: { $regex: `^${today}` },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Attendance already marked for today",
      });
    }

    // 🔹 Normalize enum values
    const normalizeStatus = (status) => {
      if (!status) return "Absent";
      const s = status.toLowerCase();
      if (s === "present") return "Present";
      if (s === "leave") return "Leave";
      return "Absent";
    };

    // 🔹 Prepare employee attendance
    const attendanceEmployees = allocation.employee.map((emp) => {
      const empStatus = employee?.find(
        (e) => e.employeeid === emp.employeeid
      );

      return {
        id: emp.id,
        employeeid: emp.employeeid,
        employeename: emp.employeename,
        attendancestatus: normalizeStatus(empStatus?.attendancestatus),
      };
    });

    // 🔹 Create Attendance
    const attendance = new Attendance({
      allocationid,
      attendancedate, // ✅ auto generated
      createdby: createdby || "System",

      supervisorid: allocation.supervisorid,
      supervisorname: allocation.supervisorname,

      projectid: allocation.projectid,
      projectname: allocation.projectname,

      siteid: allocation.siteid,
      sitename: allocation.sitename,

      fromDate,
      toDate,

      employee: attendanceEmployees,
    });

    await attendance.save();

    res.json({
      status: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    res.status(500).json({
      status: false,
      message: "Server error",
      error: err.message,
    });
  }
});



  // ✅ GET ALL ATTENDANCE
  router.post("/getAll", verifyToken, async (req, res) => {
    try {
      const { id, type } = req.body;

      let filter = {};

      if (type === "Supervisor") {
        if (!id) {
          return res
            .status(400)
            .json({ status: false, message: "Supervisor id required" });
        }
        filter = { supervisorid: id };
      }

      const data = await Attendance.find(filter).sort({ id: 1 });

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
