



const express = require("express");
const jwt = require("jsonwebtoken");
const Site = require("../models/Site");
const Counter = require("../models/Counter");

module.exports = (JWT_SECRET) => {
  const router = express.Router();
  
  router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
  // -------------------------------
  // JWT verification middleware
  // -------------------------------
  const verifyToken = (req, res, next) => {
    // ⚡ Allow OPTIONS preflight requests to pass
    if (req.method === "OPTIONS") return next();

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
  // Add Site
  // -------------------------------
  router.post("/addSite", verifyToken, async (req, res) => {
    try {
      const site = new Site({ ...req.body });
      await site.save();
      res.status(200).json({ status: true, message: "Site added successfully" });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // -------------------------------
  // Edit Site
  // -------------------------------
  router.put("/editSite", verifyToken, async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      if (!id) return res.status(400).json({ status: false, message: "Site ID required" });

      const site = await Site.findOneAndUpdate({ id: id.toString() }, updateData, { new: true });
      if (!site) return res.status(404).json({ status: false, message: "Site not found" });

      site.siteid = `S${site.id.padStart(3, "0")}`;
      await site.save();

      res.json({ status: true, message: "Site updated successfully" });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // -------------------------------
  // Get all Sites
  // -------------------------------
  router.get("/getallSite", verifyToken, async (req, res) => {
    try {
      const sites = await Site.find();
      res.json({ status: true, message: "success", data: sites });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // -------------------------------
  // Reset Sites & Counter
  // -------------------------------
  router.post("/resetSite", verifyToken, async (req, res) => {
    try {
      await Site.deleteMany({});
      await Counter.findOneAndUpdate(
        { name: "site" },
        { seq: 0 },
        { upsert: true }
      );
      res.json({ status: true, message: "Sites and IDs reset successfully" });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  // -------------------------------
  // Delete Site
  // -------------------------------
  router.delete("/deleteSite", verifyToken, async (req, res) => {
    try {
      const { id } = req.body;
      const site = await Site.findOneAndDelete({ id: id });
      if (!site) return res.status(404).json({ status: false, message: "Site not found" });
      res.json({ status: true, message: "Site deleted successfully" });
    } catch (error) {
      res.status(500).json({ status: false, message: "Server error" });
    }
  });

  return router;
};
