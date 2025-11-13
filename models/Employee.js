const mongoose = require("mongoose");
const Counter = require("./Counter");

const EmployeeSchema = new mongoose.Schema({
  id: String, // numeric string ID
  employeeid: String, // EMP001, EMP002...
  employeename: { type: String },
  employeefingerprint: { type: String }, // fingerprint (base64 / hash)
  type: { type: String, default: "Permanent" },
  status: { type: String, default: "Active" },
});

// Auto-increment id and employeeid
EmployeeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "employee" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.employeeid = `EMP${String(counter.seq).padStart(3, "0")}`;
  }
  next();
});

// Hide _id and __v
EmployeeSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
