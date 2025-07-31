const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  livreur_id: { type: mongoose.Schema.Types.ObjectId, ref: "Livreur" },
  commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" },
  message: String
});

module.exports = mongoose.model("Notification", NotificationSchema);
