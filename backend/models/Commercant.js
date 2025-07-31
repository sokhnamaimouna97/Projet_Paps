const mongoose = require("mongoose");

const CommercantSchema = new mongoose.Schema({
  nom_boutique: String,
  adress: String
});

module.exports = mongoose.model("Commercant", CommercantSchema);
