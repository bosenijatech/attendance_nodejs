const express = require("express");
const router = express.Router();
const Supervisor = require("../models/Supervisor");

// SUPERVISOR LOGIN CHECK API (Mobile)
router.post("/login-check", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        message: "Username & Password required"
      });
    }

    const user = await Supervisor.findOne({ username });

    if (!user) {
      return res.status(401).json({ status: false, message: "Invalid Username" });
    }

    if (user.password !== password) {
      return res.status(401).json({ status: false, message: "Invalid Password" });
    }

    return res.status(200).json({
      status: true,
      message: "Login Successful",
      data: {
        id: user.id,
        supervisorid: user.supervisorid,
        name: user.supervisorname,
        username: user.username
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
});

module.exports = router;
