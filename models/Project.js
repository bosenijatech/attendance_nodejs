const mongoose = require("mongoose");
const Counter = require("./Counter");

const ProjectSchema = new mongoose.Schema({
  id: String,                 // numeric string ID
  projectid: String,       // S001, S002...
  projectname: { type: String, required: true },
  projectaddress: { type: String, required: true },
  
 
  status: { type: String, default: "Active" },
});

// Auto-increment numeric id and projectid
ProjectSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "project" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.projectid = `P${String(counter.seq).padStart(3, "0")}`;
  }
  next();
});

// Hide _id and __v in JSON
ProjectSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Project", ProjectSchema);
