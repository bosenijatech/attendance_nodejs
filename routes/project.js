


const express = require("express");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const Counter = require("../models/Counter");


module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // -------------------------------
  // JWT verification middleware
  // -------------------------------
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Token missing" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // -------------------------------
  // Add Project
  // -------------------------------
router.post("/addProject", verifyToken, async (req, res) => {
  try {
    const project = new Project({ ...req.body });
    await project.save();

     

    res.json({
      status: true,
      message: "Project added successfully"
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});



  // -------------------------------
  // Edit Project
  // -------------------------------
router.put("/editProject", verifyToken, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ status: false, message: "Project ID required" });

    // Use a different variable name to avoid shadowing
    const updatedProject = await Project.findOneAndUpdate(
      { id: id.toString() },
      updateData,
      { new: true }
    );

    if (!updatedProject)
      return res
        .status(404)
        .json({ status: false, message: "Project not found" });

    // Optional: regenerate projectid
    updatedProject.projectid = `P${updatedProject.id.toString().padStart(3, "0")}`;
    await updatedProject.save();

    


    res.json({
      status: true,
      message: "Project updated successfully",
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

  // -------------------------------
  // Get all Project
  // -------------------------------
  router.get("/getallProject", verifyToken, async (req, res) => {
    try {
      const project = await Project.find();
      res.json({ status: true, message: "success", data: project });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // -------------------------------
  // Reset project & Counter
  // -------------------------------
  router.post("/resetProject", verifyToken, async (req, res) => {
    try {
      await Project.deleteMany({});
      await Counter.findOneAndUpdate(
        { name: "project" },
        { seq: 0 },
        { upsert: true }
      );
      res.json({ status: true, message: "Project and IDs reset successfully" });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

//delete

router.delete("/deleteProject", async (req, res) => {
  try {
    const { id } = req.body;
   

    const project = await Project.findOneAndDelete({ id: id }); // 👈 use custom field

    if (!project) {
      return res
        .status(404)
        .json({ status: false, message: "Project not found" });
    }

    res.json({ status: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});
  return router;
};
