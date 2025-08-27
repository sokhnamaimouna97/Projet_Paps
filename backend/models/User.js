const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  prenom: String,
  nom: String,
  role: { type: String, enum: ["client", "commercant", "livreur"], required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  telephone: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" },
  livreur_id: { type: mongoose.Schema.Types.ObjectId, ref: "Livreur" },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" }
});

module.exports = mongoose.model("User", UserSchema);
