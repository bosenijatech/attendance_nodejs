// const mongoose = require("mongoose");
// const Counter = require("./Counter");

// const SupervisorSchema = new mongoose.Schema({
//   id: String,
//   supervisorid: String,
//   supervisorname: { type: String, required: true },
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   supervisorfingerprint: String,
  
//   type: { type: String, default: "Supervisor" },
//   status: { type: String, default: "Active" },
// });

// // ✅ Auto-increment supervisor IDs (SUP001, SUP002, ...)
// SupervisorSchema.pre("save", async function (next) {
//   // ❌ Skip Admin creation
//   if (this.type === "Admin") return next();

//   if (this.isNew) {
//     const counter = await Counter.findOneAndUpdate(
//       { name: "supervisor" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     this.id = String(counter.seq);
//     this.supervisorid = `SUP${String(counter.seq).padStart(3, "0")}`;
//   }
//   next();
// });

// // Hide internal fields
// SupervisorSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     delete ret._id;
//     delete ret.__v;
//     return ret;
//   },
// });

// module.exports = mongoose.model("Supervisor", SupervisorSchema);



const mongoose = require("mongoose");
const Counter = require("./Counter");

const SupervisorSchema = new mongoose.Schema({
  id: String,
  supervisorid: String,

  supervisorname: { type: String },

  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  supervisorfingerprint: {
    type: String,
    required: true,
    unique: true
  },

  type: {
    type: String,
    enum: ["Admin", "Supervisor"],
    default: "Supervisor"
  },

  status: {
    type: String,
    default: "Active"
  }
}, { timestamps: true });


// ✅ Auto-increment ONLY for Supervisor
SupervisorSchema.pre("save", async function (next) {

  // 🔐 Skip Admin
  if (this.type === "Admin") {
    return next();
  }

  // 🔁 Only on new document
  if (!this.isNew) {
    return next();
  }

  const counter = await Counter.findOneAndUpdate(
    { name: "supervisor" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.id = String(counter.seq);
  this.supervisorid = `SUP${String(counter.seq).padStart(3, "0")}`;

  next();
});


// 🔒 Hide sensitive fields
SupervisorSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.supervisorfingerprint;
    return ret;
  }
});

module.exports = mongoose.model("Supervisor", SupervisorSchema);
