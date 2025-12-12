// attendance.js
const mongoose = require("mongoose");
const Counter = require("./Counter"); // for auto-increment

const AttendanceSchema = new mongoose.Schema({
  id: { type: String },
  attendanceid: { type: String },

  supervisorid: { type: String, required: true },
  supervisorname: { type: String, required: true },

  employeeid: { type: String, required: true },
  employeename: { type: String, required: true },

  projectid: { type: String, required: true },
  projectname: { type: String, required: true },

  siteid: { type: String, required: true },
  sitename: { type: String, required: true },

  attendanceDate: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Leave"], default: "Absent" },

  syncstatus: { type: Number, default: 0 }, // for offline/online sync

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔢 Auto-increment id and attendanceid
AttendanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "attendance" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.attendanceid = `ATT${String(counter.seq).padStart(4, "0")}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Hide _id and __v from JSON response
AttendanceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
