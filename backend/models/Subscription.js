const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" },
  start: { type: Date, default: Date.now },
  end: { type: Date },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  price:{ type: Number, default: 5000 } 
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
