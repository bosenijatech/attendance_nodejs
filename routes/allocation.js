const express = require("express");
const jwt = require("jsonwebtoken");
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

  // 🟢 ADD NEW ALLOCATION
  router.post("/addallocation", verifyToken, async (req, res) => {
    try {
      let allocationData = req.body;

      // 👇 Assign employee IDs sequentially (1,2,3,...)
      if (allocationData.employee && allocationData.employee.length > 0) {
        allocationData.employee = allocationData.employee.map((emp, index) => ({
          id: String(index + 1),
          employeeid: emp.employeeid || "",
          employeename: emp.employeename || "",
          attendancestatus: emp.attendancestatus || "",
        }));
      }

      const allocation = new Allocation(allocationData);
      const saved = await allocation.save();

      res.status(200).json({
        status: true,
        message: "Allocation added successfully",
        data: saved,
      });
    } catch (err) {
      console.error("❌ Error adding allocation:", err);
      res.status(500).json({
        status: false,
        message: "Error adding allocation",
        error: err.message,
      });
    }
  });

  // 🟡 GET ALL ALLOCATIONS
  // router.get("/getAllAllocations", verifyToken, async (req, res) => {
  //   try {
  //     const data = await Allocation.find().sort({ id: 1 });
  //     res.json({ status: true, data });
  //   } catch (err) {
  //     console.error("❌ Error fetching allocations:", err);
  //     res.status(500).json({
  //       status: false,
  //       message: "Error fetching data",
  //       error: err.message,
  //     });
  //   }
  // });
  
router.post("/getAllAllocations", verifyToken, async (req, res) => {
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
    console.error("❌ Error fetching allocations:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching allocations",
      error: err.message,
    });
  }
});







  // ✏️ EDIT ALLOCATION
 router.put("/editAllocation", verifyToken, async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    if (!id)
      return res.status(400).json({
        status: false,
        message: "ID is required for update",
      });

    // Ensure employee structure
    if (updateFields.employee && Array.isArray(updateFields.employee)) {
      updateFields.employee = updateFields.employee.map((emp, index) => ({
        id: String(index + 1),
        employeeid: emp.employeeid || "",
        employeename: emp.employeename || "",
        attendancestatus: emp.attendancestatus || "",
      }));
    }

    const updated = await Allocation.findOneAndUpdate(
      { id: id },
      updateFields,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({
        status: false,
        message: "Allocation not found",
      });

    return res.json({
      status: true,
      message: "Allocation updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Edit Allocation Error:", err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
});


  // 🗑️ DELETE ALLOCATION
  router.delete("/deleteAllocation", verifyToken, async (req, res) => {
    try {
      const { id } = req.body;

      if (!id)
        return res
          .status(400)
          .json({ status: false, message: "ID is required for delete" });

      const deleted = await Allocation.findOneAndDelete({ id: id });

      if (!deleted)
        return res.json({
          status: false,
          message: "Allocation not found",
        });

      res.json({
        status: true,
        message: "Allocation deleted successfully",
      });
    } catch (err) {
      console.error("❌ Error deleting allocation:", err);
      res.status(500).json({
        status: false,
        message: "Error deleting allocation",
        error: err.message,
      });
    }
  });

  return router;
};
