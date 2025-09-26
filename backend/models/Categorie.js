const mongoose = require("mongoose");

const CategorieSchema = new mongoose.Schema({
  nom: String,
 // commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" }
});

module.exports = mongoose.model("Categorie", CategorieSchema);
