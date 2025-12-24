// const mongoose = require("mongoose");
// const Counter = require("./Counter");

// const AttendanceSchema = new mongoose.Schema({
//   // Auto increment numeric id
//   id: { type: String },

//   // ATT001, ATT002
//   attendanceid: { type: String },

//   allocationid: { type: String, required: true },

//   supervisorid: { type: String },
//   supervisorname: { type: String },

//   projectid: { type: String },
//   projectname: { type: String },

//   siteid: { type: String },
//   sitename: { type: String },

//   attendancedate: { type: String, required: true }, // YYYY-MM-DD

//   employee: [
//     {
//       _id: false,
//       id: { type: String },
//       employeeid: { type: String, required: true },
//       employeename: { type: String, required: true },
//       attendancestatus: {
//         type: String,
//         required: true,
//         default: "Absent",
//         validate: {
//           validator: function(v) {
//             return ["present", "Present", "absent", "Absent", "leave", "Leave"].includes(v);
//           },
//           message: props => `${props.value} is not a valid attendance status!`
//         }
//       }
//     }
//   ],

//   fromDate: { type: Date, required: true },
//   toDate: { type: Date, required: true },

//   status: { type: String }, // will come from allocation
//   syncstatus: { type: Number, default: 0 },

//   createdby: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// // 🔢 Auto increment and normalize employees + populate from allocation
// AttendanceSchema.pre("save", async function(next) {
//   try {
//     const Allocation = require("./Allocation");
//     const allocation = await Allocation.findOne({ allocationid: this.allocationid });

//     if (!allocation) return next(new Error("Allocation not found"));

//     // Populate attendance fields from allocation
//     this.supervisorid = allocation.supervisorid;
//     this.supervisorname = allocation.supervisorname;
//     this.projectid = allocation.projectid;
//     this.projectname = allocation.projectname;
//     this.siteid = allocation.siteid;
//     this.sitename = allocation.sitename;
//     this.status = allocation.status;

//     // Auto increment id
//     if (this.isNew) {
//       const counter = await Counter.findOneAndUpdate(
//         { name: "attendance" },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       this.id = String(counter.seq);
//       this.attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;
//     }

//     // Normalize employee array
//     if (this.employee && this.employee.length > 0) {
//       this.employee = this.employee.map((emp, index) => {
//         let status = emp.attendancestatus || "Absent";
//         status = status.toLowerCase() === "present" ? "Present" :
//                  status.toLowerCase() === "absent" ? "Absent" :
//                  "Leave";
//         return {
//           ...emp,
//           id: String(index + 1),
//           attendancestatus: status
//         };
//       });
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// // Hide Mongo internal fields in JSON
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

  allocationid: { type: String, required: true },

  supervisorid: { type: String },
  supervisorname: { type: String },

  projectid: { type: String },
  projectname: { type: String },

  siteid: { type: String },
  sitename: { type: String },

  attendancedate: { type: String, required: true }, // YYYY-MM-DD

  employee: [
    {
      _id: false,
      id: { type: String },
      employeeid: { type: String, required: true },
      employeename: { type: String, required: true },
      attendancestatus: {
        type: String,
        required: true,
        default: "Absent",
        validate: {
          validator: function(v) {
            return ["present", "Present", "absent", "Absent", "leave", "Leave"].includes(v);
          },
          message: props => `${props.value} is not a valid attendance status!`
        }
      }
    }
  ],

  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },

  status: { type: String }, // comes from allocation
  syncstatus: { type: Number, default: 0 },

  createdby: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Populate fields from allocation & auto-increment on save
AttendanceSchema.pre("save", async function(next) {
  try {
    const Allocation = require("./Allocation");
    const allocation = await Allocation.findOne({ allocationid: this.allocationid });

    if (!allocation) return next(new Error("Allocation not found"));

    // Populate fields
    this.supervisorid = allocation.supervisorid;
    this.supervisorname = allocation.supervisorname;
    this.projectid = allocation.projectid;
    this.projectname = allocation.projectname;
    this.siteid = allocation.siteid;
    this.sitename = allocation.sitename;
    this.status = allocation.status;

    // Auto-increment id & attendanceid
    if (this.isNew) {
      const counter = await Counter.findOneAndUpdate(
        { name: "attendance" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = String(counter.seq);
      this.attendanceid = `ATT${String(counter.seq).padStart(3, "0")}`;
    }

    // Normalize employee array
    if (this.employee && this.employee.length > 0) {
      this.employee = this.employee.map((emp, index) => {
        let status = emp.attendancestatus || "Absent";
        status = status.toLowerCase() === "present" ? "Present" :
                 status.toLowerCase() === "absent" ? "Absent" :
                 "Leave";
        return {
          ...emp,
          id: String(index + 1),
          attendancestatus: status
        };
      });
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Hide Mongo internal fields
AttendanceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
