const express = require("express");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Counter = require("../models/Counter");


module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // 🧩 JWT verification middleware
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(403).json({ status: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(403).json({ status: false, message: "Token missing" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ status: false, message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // ➕ Add Employee
  router.post("/addEmployee", verifyToken, async (req, res) => {
    try {
      let counter = await Counter.findOne({ name: "employee" });
      if (!counter) {
        counter = new Counter({ name: "employee", seq: 0 });
        await counter.save();
      }

      const nextId = (counter.seq + 1).toString();
      const employee = new Employee({
        id: nextId,
        employeeid: `EMP${nextId.padStart(3, "0")}`,
        employeename: req.body.employeename,
        employeefingerprint: req.body.employeefingerprint,
        type: req.body.type,
        status: req.body.status,
      });

      await employee.save();

      // Increment counter after successful save
      counter.seq += 1;
      await counter.save();

   

     res.status(200)({
        status: true,
        message: "Employee added successfully",
      });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // ✏️ Edit Employee
  router.put("/editEmployee", verifyToken, async (req, res) => {
    try {
      const { id, ...updateData } = req.body;

      if (!id)
        return res
          .status(400)
          .json({ status: false, message: "Employee ID required" });

      const employee = await Employee.findOneAndUpdate(
        { id: id.toString() },
        updateData,
        { new: true }
      );

      if (!employee)
        return res
          .status(404)
          .json({ status: false, message: "Employee not found" });

      employee.employeeid = `EMP${employee.id.padStart(3, "0")}`;
      await employee.save();

  

      res.json({
        status: true,
        message: "Employee updated successfully",
      });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // 📋 Get All Employees
  router.get("/getallEmployee", verifyToken, async (req, res) => {
    try {
      const employees = await Employee.find();
      res.status(200)({ status: true, message: "success", data: employees });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // 🔄 Reset All Employees
  router.post("/resetEmployee", verifyToken, async (req, res) => {
    try {
      await Employee.deleteMany({});
      await Counter.findOneAndUpdate(
        { name: "employee" },
        { seq: 0 },
        { upsert: true }
      );
      res.status(200)({
        status: true,
        message: "Employee and IDs reset successfully",
      });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  
//delete

router.delete("/deleteEmployee", async (req, res) => {
  try {
    const { id } = req.body;
   

    const employee = await Employee.findOneAndDelete({ id: id }); // 👈 use custom field

    if (!employee) {
      return res
        .status(404)
        .json({ status: false, message: "Employee not found" });
    }

    res.json({ status: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

  return router;
};
