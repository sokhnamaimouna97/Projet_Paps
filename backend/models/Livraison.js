const mongoose = require("mongoose");

const LivraisonSchema = new mongoose.Schema({
  produit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Produit" },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  status: { type: String },
  livreur_id: { type: mongoose.Schema.Types.ObjectId, ref: "Livreur" }
});

module.exports = mongoose.model("Livraison", LivraisonSchema);
