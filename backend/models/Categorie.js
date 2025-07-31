const mongoose = require("mongoose");

const CategorieSchema = new mongoose.Schema({
  nom: String
});

module.exports = mongoose.model("Categorie", CategorieSchema);
