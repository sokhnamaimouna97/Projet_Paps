const mongoose = require("mongoose");

const ProduitSchema = new mongoose.Schema({
  nom: String,
  prix: Number,
  image: String,
  stock: Number,
  categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: "Categorie" },
  commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" }
});

module.exports = mongoose.model("Produit", ProduitSchema);
