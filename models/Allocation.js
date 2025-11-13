// const mongoose = require("mongoose");
// const Counter = require("./Counter");

// const AllocationSchema = new mongoose.Schema({
//   id: { type: String },
//   allocationid: { type: String },

//   supervisorid: { type: String },
//   supervisorname: { type: String, required: true },

//   // Multiple employees (array of objects)
//   employee: [
//     {
//        _id: false,
//       id: { type: String },
//       employeeid: { type: String },
//       employeename: { type: String },
//       attendancestatus : {type: String, default: ''}
//     },
//   ],

//   projectid: { type: String },
//   projectname: { type: String, required: true },

//   siteid: { type: String },
//   sitename: { type: String, required: true },

//   fromDate: { type: Date, required: true },
//   toDate: { type: Date, required: true },

//   status: { type: String, default: "Active" },
//   syncstaus: {type: Number, default: 0},

//   // Automatically store the current date
//   currentDate: { type: Date, default: Date.now },

//   createdAt: { type: Date, default: Date.now },
// });


// // Auto-increment id and allocationid
// AllocationSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const counter = await Counter.findOneAndUpdate(
//       { name: "allocation" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     this.id = String(counter.seq);
//     this.allocationid = `ALLO${String(counter.seq).padStart(3, "0")}`;
//   }
//   next();
// });

// // Hide _id and __v
// AllocationSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     delete ret._id;
//     delete ret.__v;
//     return ret;
//   },
// });



// module.exports = mongoose.model("Allocation", AllocationSchema);


const mongoose = require("mongoose");
const Counter = require("./Counter");

const AllocationSchema = new mongoose.Schema({
  id: { type: String },
  allocationid: { type: String },

  supervisorid: { type: String },
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

  status: { type: String, default: "Active" },
  syncstatus: { type: Number, default: 0 },

  currentDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  createdby: {type: String, }
});


// 🔢 Auto-increment id and allocationid for each allocation
AllocationSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "allocation" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.allocationid = `ALLO${String(counter.seq).padStart(3, "0")}`;
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
AllocationSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Allocation", AllocationSchema);
