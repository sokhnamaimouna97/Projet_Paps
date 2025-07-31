const mongoose = require("mongoose");

const CommandeSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  produit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Produit" },
  status: { type: String, default: "en attente" }
});

module.exports = mongoose.model("Commande", CommandeSchema);
