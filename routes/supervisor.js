

const express = require("express");
const jwt = require("jsonwebtoken");
const Supervisor = require("../models/Supervisor");
const Admin = require("../models/Admin");
const Counter = require("../models/Counter");

module.exports = (JWT_SECRET = "mydefaultsecret") => {
  const router = express.Router();

  // ---------------- JWT Middleware ----------------
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(403).json({ status: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
      req.user = decoded;
      next();
    });
  };

  // ---------------- Auto-create default Admin ----------------
  const ensureAdminExists = async () => {
    const adminExists = await Admin.findOne({ username: "admin" });
    if (!adminExists) {
      let counter = await Counter.findOne({ name: "admin" });
      if (!counter) {
        counter = new Counter({ name: "admin", seq: 0 });
        await counter.save();
      }

      await Admin.create({
        id: "0",
        adminid: "ADM-000",
        adminname: "Admin",
        username: "admin",
        password: "123",
        status: "Active",
      });

      console.log("✅ Default admin created (username: admin, password: 123)");
    }
  };
ensureAdminExists();


  // ---------------- LOGIN (Admin or Supervisor) ----------------
  // router.post("/login", async (req, res) => {
  //   try {
  //     const { username, password } = req.body;
  //     if (!username || !password)
  //       return res.status(400).json({ status: false, message: "Username and password required" });

  //     let user = await Admin.findOne({ username });
  //     let role = "Admin";

  //     if (!user) {
  //       user = await Supervisor.findOne({ username });
  //       role = "Supervisor";
  //     }

  //     if (!user) return res.status(404).json({ status: false, message: "User not found" });
  //     if (password !== user.password)
  //       return res.status(401).json({ status: false, message: "Invalid password" });

  //     const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: "7d" });

  //     res.json({ status: true, message: "Login successful", token, role, data: user.toJSON() });
  //   } catch (err) {
  //     console.error("Login error:", err);
  //     res.status(500).json({ status: false, message: err.message });
  //   }
  // });



  router.post("/login", async (req, res) => {
  try {
    const { username, password, supervisorfingerprint } = req.body;

    let user = null;
    let role = null;

    // 🔐 1️⃣ FINGERPRINT LOGIN (Supervisor ONLY)
    if (supervisorfingerprint) {

      user = await Supervisor.findOne({
        supervisorfingerprint,
        status: "Active"
      });

      if (!user) {
        return res.json({
          status: false,
          message: "Fingerprint not matched"
        });
      }

      role = "Supervisor";
    }

    // 🔐 2️⃣ USERNAME + PASSWORD LOGIN
    else {

      if (!username || !password) {
        return res.status(400).json({
          status: false,
          message: "Username and password required"
        });
      }

      // 👉 Check Admin
      user = await Admin.findOne({ username });
      role = "Admin";

      // 👉 If not admin, check Supervisor
      if (!user) {
        user = await Supervisor.findOne({
          username,
          status: "Active"
        });
        role = "Supervisor";
      }

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found"
        });
      }

      if (password !== user.password) {
        return res.status(401).json({
          status: false,
          message: "Invalid password"
        });
      }
    }

    // 🔐 JWT TOKEN (COMMON)
    const token = jwt.sign(
      { id: user.id, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: true,
      message: "Login successful",
      role,
      token,
      data: user.toJSON()
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
});



  // ---------------- ADD SUPERVISOR or ADMIN ----------------
  router.post("/addSupervisor", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "Admin")
        return res.status(403).json({ status: false, message: "Only Admin can add users" });

      const { supervisorname, username, password, type } = req.body;
      if (!supervisorname || !username || !password || !type)
        return res.status(400).json({ status: false, message: "All fields are required" });

      if (type === "Admin") {
        const existing = await Admin.findOne({ username });
        if (existing)
          return res.status(400).json({ status: false, message: "Username already exists" });

        const admin = new Admin({ adminname: supervisorname, username, password });
        await admin.save();
        return res.json({ status: true, message: "Admin added successfully", data: admin });
      } else if (type === "Supervisor") {
        const existing = await Supervisor.findOne({ username });
        if (existing)
          return res.status(400).json({ status: false, message: "Username already exists" });

        const supervisor = new Supervisor({ supervisorname, username, password, createdBy: req.user.id });
        await supervisor.save();
        return res.json({ status: true, message: "Supervisor added successfully", data: supervisor });
      } else {
        return res.status(400).json({ status: false, message: "Invalid type" });
      }
    } catch (err) {
      console.error("Add supervisor error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // ---------------- EDIT SUPERVISOR or ADMIN ----------------
  router.put("/editSupervisor", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "Admin")
        return res.status(403).json({ status: false, message: "Only Admin can edit users" });

      const { id, supervisorname, username, password, type, status } = req.body;
      if (!id) return res.status(400).json({ status: false, message: "ID required" });

      if (type === "Admin") {
        const admin = await Admin.findOne({ id });
        if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });

        if (supervisorname) admin.adminname = supervisorname;
        if (username) admin.username = username;
        if (password) admin.password = password;
        if (status) admin.status = status;

        await admin.save();
        return res.json({ status: true, message: "Admin updated successfully", data: admin });
      } else if (type === "Supervisor") {
        const supervisor = await Supervisor.findOne({ id });
        if (!supervisor)
          return res.status(404).json({ status: false, message: "Supervisor not found" });

        if (supervisorname) supervisor.supervisorname = supervisorname;
        if (username) supervisor.username = username;
        if (password) supervisor.password = password;
        if (status) supervisor.status = status;

        await supervisor.save();
        return res.json({ status: true, message: "Supervisor updated successfully", data: supervisor });
      } else {
        return res.status(400).json({ status: false, message: "Invalid type" });
      }
    } catch (err) {
      console.error("Edit supervisor error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // ---------------- GET ALL SUPERVISORS ----------------


router.get("/getAllSupervisors", verifyToken, async (req, res) => {
  try {
    const Role = req.user?.role; 
    const Id = req.user?.id;     

    let supervisors;

    if (Role === "Admin") {
      // Admin → get all supervisors
      supervisors = await Supervisor.find().lean();
    } else if (Role === "Supervisor") {
      // Supervisor → only themselves
      supervisors = await Supervisor.find({ id: Id }).lean();
    } else {
      return res.status(403).json({ status: false, message: "Unauthorized user type" });
    }

    res.json({ status: true, message: "Supervisors fetched successfully", data: supervisors });
  } catch (err) {
    console.error("Get supervisors error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});




  // ---------------- DELETE SUPERVISOR or ADMIN ----------------
  router.delete("/deleteSupervisor", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "Admin")
        return res.status(403).json({ status: false, message: "Only Admin can delete users" });

      let { id, type } = req.body;

      if (!id) return res.status(400).json({ status: false, message: "ID required" });
      if (!type) type = "Supervisor"; // Default to Supervisor if not provided

      if (type === "Admin") {
        const admin = await Admin.findOne({ id });
        if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });
        if (admin.username === "admin")
          return res.status(400).json({ status: false, message: "Default admin cannot be deleted" });

        await Admin.deleteOne({ id });
        return res.json({ status: true, message: "Admin deleted successfully" });
      } else if (type === "Supervisor") {
        const supervisor = await Supervisor.findOne({ id });
        if (!supervisor)
          return res.status(404).json({ status: false, message: "Supervisor not found" });

        await Supervisor.deleteOne({ id });
        return res.json({ status: true, message: "Supervisor deleted successfully" });
      } else {
        return res.status(400).json({ status: false, message: "Invalid type" });
      }
    } catch (err) {
      console.error("Delete supervisor error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  });

  return router;
};
