// // attendance.js
// const mongoose = require("mongoose");
// const Counter = require("./Counter"); // for auto-increment

// const AttendanceSchema = new mongoose.Schema({
//   id: { type: String },
//   attendanceid: { type: String },

//   supervisorid: { type: String, required: true },
//   supervisorname: { type: String, required: true },

//   employeeid: { type: String, required: true },
//   employeename: { type: String, required: true },

//   projectid: { type: String, required: true },
//   projectname: { type: String, required: true },

//   siteid: { type: String, required: true },
//   sitename: { type: String, required: true },

//   attendanceDate: { type: Date, required: true },
//   status: { type: String, enum: ["Present", "Absent", "Leave"], default: "Absent" },

//   syncstatus: { type: Number, default: 0 }, // for offline/online sync

//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// // 🔢 Auto-increment id and attendanceid
// AttendanceSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const counter = await Counter.findOneAndUpdate(
//       { name: "attendance" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     this.id = String(counter.seq);
//     this.attendanceid = `ATT${String(counter.seq).padStart(4, "0")}`;
//   }
//   this.updatedAt = Date.now();
//   next();
// });

// // Hide _id and __v from JSON response
// AttendanceSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     delete ret._id;
//     delete ret.__v;
//     return ret;
//   },
// });

// module.exports = mongoose.model("Attendance", AttendanceSchema);





const mongoose = require("mongoose");
const Counter = require("./Counter");

const AttendanceSchema = new mongoose.Schema({
  id: { type: String },
  attendanceid: { type: String },

  supervisorid: { type: String , required: true},
  supervisorname: { type: String, required: true },

  employee: [
    {
      _id: false, // prevent automatic MongoDB _id
      id: { type: String },
      employeeid: { type: String },
      employeename: { type: String },
      attendancestatus: { type: String, default: '' }
    },
  ],

  projectid: { type: String },
  projectname: { type: String, required: true },

  siteid: { type: String },
  sitename: { type: String, required: true },

  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },

  status: { type: String, enum: ["Present", "Absent", "Leave"], default: "" },
  syncstatus: { type: Number, default: 0 },

  currentDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  createdby: {type: String, }
});


// 🔢 Auto-increment id and Attendanceid for each Attendance
AttendanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "Attendance" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;
  }

  // 👇 Assign auto id (1,2,3...) for employee list
  if (this.employee && this.employee.length > 0) {
    this.employee = this.employee.map((emp, index) => ({
      ...emp,
      id: String(index + 1), // convert to string so it's consistent
    }));
  }

  next();
});


// Hide _id and __v from response
AttendanceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
