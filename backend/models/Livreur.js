const mongoose = require("mongoose");

const LivreurSchema = new mongoose.Schema({
  commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" }
});

module.exports = mongoose.model("Livreur", LivreurSchema);
