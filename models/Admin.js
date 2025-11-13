const mongoose = require("mongoose");
const Counter = require("./Counter");

const AdminSchema = new mongoose.Schema({
  id: String,
  adminid: String,
  adminname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: "Active" },
});

// Auto increment admin IDs (ADM001, ADM002, ...)
AdminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "admin" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.adminid = `ADM${String(counter.seq).padStart(3, "0")}`;
  }
  next();
});

AdminSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
