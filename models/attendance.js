const mongoose = require("mongoose");
const Counter = require("./Counter");

const AttendanceSchema = new mongoose.Schema({
  attendanceid: String,

  // ❗ SAME NAME EVERYWHERE
  attendancedate: { type: String, required: true }, // YYYY-MM-DD

  createdby: { type: String, required: true },

  allocationid: { type: String, required: true },

  supervisorid: String,
  supervisorname: String,

  projectid: String,
  projectname: String,

  siteid: String,
  sitename: String,

  fromDate: Date,
  toDate: Date,

  employee: [
    {
      _id: false,
      id: String,
      employeeid: String,
      employeename: String,
      attendancestatus: {
        type: String,
        enum: ["Present", "Absent", "Leave"],
        default: "Absent",
      },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

// ✅ Prevent duplicate attendance for same employee on same date
AttendanceSchema.index(
  {
    allocationid: 1,
    "employee.employeeid": 1,
    attendancedate: 1,
  },
  { unique: true }
);

// Auto attendanceid
AttendanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "attendance" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.attendanceid = `ATT${String(counter.seq).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
