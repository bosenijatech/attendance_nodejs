// const express = require("express");
// const router = express.Router();
// const Supervisor = require("../models/Supervisor");

// // MOBILE SUPERVISOR LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password, fingerprint } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ status: false, message: "Username & Password required" });
//     }

//     const user = await Supervisor.findOne({ username });

//     if (!user) return res.status(401).json({ status: false, message: "Invalid Username" });
//     if (user.password !== password) return res.status(401).json({ status: false, message: "Invalid Password" });

//     // Save fingerprint if first time
//     if (fingerprint && !user.supervisorfingerprint) {
//       user.supervisorfingerprint = fingerprint;
//       await user.save();
//     }

//     res.json({
//       status: true,
//       message: "Login Successful",
//       supervisor: {
//         id: user.id,
//         supervisorid: user.supervisorid,
//         supervisorname: user.supervisorname,
//         username: user.username,
//         fingerprint: user.supervisorfingerprint
//       }
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const Supervisor = require("../models/Supervisor");

// ===============================
// ⭐ 1. MOBILE SUPERVISOR REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { supervisorname, username, password, fingerprint } = req.body;

    if (!supervisorname || !username || !password) {
      return res.status(400).json({
        status: false,
        message: "Supervisor name, username & password are required",
      });
    }

    // Check if username already exists
    const existing = await Supervisor.findOne({ username });
    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Username already exists",
      });
    }

    // Create new supervisor
    const supervisor = new Supervisor({
      supervisorname,
      username,
      password,
      supervisorfingerprint: fingerprint || "",
    });

    await supervisor.save();

    return res.status(201).json({
      status: true,
      message: "Supervisor registered successfully",
      supervisor: {
        id: supervisor.id,
        supervisorid: supervisor.supervisorid,
        supervisorname: supervisor.supervisorname,
        username: supervisor.username,
        fingerprint: supervisor.supervisorfingerprint,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

// ===============================
// ⭐ 2. MOBILE SUPERVISOR LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { username, password, fingerprint } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: false, message: "Username & Password required" });
    }

    const user = await Supervisor.findOne({ username });
    if (!user) return res.status(401).json({ status: false, message: "Invalid Username" });
    if (user.password !== password) return res.status(401).json({ status: false, message: "Invalid Password" });

    // Save fingerprint if first time
    if (fingerprint && !user.supervisorfingerprint) {
      user.supervisorfingerprint = fingerprint;
      await user.save();
    }

    res.json({
      status: true,
      message: "Login Successful",
      supervisor: {
        id: user.id,
        supervisorid: user.supervisorid,
        supervisorname: user.supervisorname,
        username: user.username,
        fingerprint: user.supervisorfingerprint
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

module.exports = router;
