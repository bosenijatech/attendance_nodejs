const mongoose = require("mongoose");
const Counter = require("./Counter");

const SiteSchema = new mongoose.Schema({
  id: String,                 // numeric string ID
  siteid: String,       // S001, S002...
   sitename: { type: String, required: true },
   siteaddress: { type: String, required: true },
   sitecity: { type: String, required: true },
 
  status: { type: String, default: "Active" },
});

// Auto-increment numeric id and siteid
SiteSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "site" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = String(counter.seq);
    this.siteid = `S${String(counter.seq).padStart(3, "0")}`;
  }
  next();
});

// Hide _id and __v in JSON
SiteSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Site", SiteSchema);
