const mongoose = require("mongoose");
const Counter = require("./Counter"); // Auto-increment counter schema

const AttendanceSchema = new mongoose.Schema({
  id: { type: String },
  attendanceid: { type: String }, // e.g. ATT001, ATT002

  allocationid: { type: String, required: true }, // Link to Allocation
  projectid: { type: String },
  siteid: { type: String },

  attendancedate: { type: String, required: true }, // YYYY-MM-DD

  supervisorid: { type: String, required: true },
  supervisorname: { type: String, required: true },

  employee: [
    {
      _id: false,
      id: { type: String }, // internal id
      employeeid: { type: String, required: true },
      employeename: { type: String, required: true },
      attendancestatus: {
        type: String,
        enum: ["Present", "Absent", "Leave"],
        default: "Absent",
      },
    },
  ],

  status: { type: String, default: "Active" },
  syncstatus: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  createdby: { type: String },
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
    this.attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;
  }

  // Assign auto id for employee array
  if (this.employee && this.employee.length > 0) {
    this.employee = this.employee.map((emp, index) => ({
      ...emp,
      id: String(index + 1),
    }));
  }

  next();
});

// Hide _id and __v from JSON
AttendanceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
