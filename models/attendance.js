const mongoose = require("mongoose");
const Counter = require("./Counter");

const AttendanceSchema = new mongoose.Schema({
  attendanceid: { type: String },          // unique per attendance marking
  attendancedate: { type: Date, default: Date.now },
  createdby: { type: String, required: true },

  allocationid: { type: String, required: true },
  supervisorid: { type: String, required: true },
  supervisorname: { type: String, required: true },

  projectid: { type: String },
  projectname: { type: String, required: true },

  siteid: { type: String },
  sitename: { type: String, required: true },

  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },

  employee: [
    {
      _id: false,
      id: { type: String },
      employeeid: { type: String, required: true },
      employeename: { type: String, required: true },
      attendancestatus: { type: String, enum: ["Present", "Absent", "Leave"], default: "" }
    }
  ],

  status: { type: String, default: "Active" },
  syncstatus: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

// Auto-generate attendanceid
AttendanceSchema.pre("save", async function(next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "attendance" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.attendanceid = `ATT${String(counter.seq).padStart(4, "0")}`;
  }

  // Assign employee id if missing
  if (this.employee && this.employee.length > 0) {
    this.employee = this.employee.map((emp, index) => ({
      ...emp,
      id: String(index + 1),
      attendancestatus: emp.attendancestatus || ""
    }));
  }

  next();
});

// Hide _id and __v
AttendanceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
