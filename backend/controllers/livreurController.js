const Livreur = require("../models/Livreur");
const User = require("../models/User");
const bcrypt = require("bcrypt");
exports.createLivreur = async (req, res) => {
  try {
    const { prenom, nom, password,email, telephone, commercant_id } = req.body;

    // 1. Créer le livreur
    const livreur = new Livreur({ commercant_id });
    await livreur.save();
 const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    // 2. Créer l'utilisateur associé
    const user = new User({
      prenom,
      nom,
      telephone,
      role: "livreur",
      livreur_id: livreur._id,
      password: hashedPassword,
        email
    });

    await user.save();

    res.status(201).json({
      message: "Livreur et utilisateur créés avec succès",
      livreur,
      user
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création du livreur", details: err });
  }
};
exports.getLivreurById = async (req, res) => {
  try {
    const livreur = await Livreur.findById(req.params.id).populate("commercant_id");

    if (!livreur) {
      return res.status(404).json({ error: "Livreur non trouvé" });
    }
    const user = await User.findOne({ livreur_id: livreur._id }).select("prenom nom telephone email");

    res.json({
      ...livreur.toObject(), 
      user 
    });

  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du livreur", details: err });
  }
};
exports.updateLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, telephone, commercant_id } = req.body;

    // Vérifie qu'il s'agit bien d'un livreur
    const livreur = await User.findOneAndUpdate(
      { _id: id, role: "livreur" },
      { prenom, nom, telephone, commercant_id },
      { new: true }
    ).populate("commercant_id");

    if (!livreur) {
      return res.status(404).json({ error: "Livreur non trouvé ou incorrect." });
    }

    res.status(200).json({
      message: "Livreur mis à jour avec succès.",
      livreur
    });

  } catch (err) {
    console.error("Erreur update livreur :", err);
    res.status(500).json({ error: "Erreur serveur", details: err });
  }
};
exports.deleteLivreur = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer le user ayant ce rôle
    const livreur = await User.findOneAndDelete({
      _id: id,
      role: "livreur"
    });

    if (!livreur) {
      return res.status(404).json({ error: "Livreur non trouvé" });
    }

    res.json({ message: "Livreur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression du livreur", details: err });
  }
};                                                                   
exports.getAllLivreurs = async (req, res) => {
  try {
    const livreurs = await Livreur.find().populate("commercant_id");
    res.json(livreurs);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des livreurs", details: err });
  }
};

exports.getAllLivreursByCommercants = async (req, res) => {
  try {
    const commercantId = req.user._id; // tu dois être connecté en tant que commerçant

    const livreurs = await User.find({
      role: "livreur",
      commercant_id: commercantId
    }).select("prenom nom telephone email commercant_id");

    res.json(livreurs);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des livreurs", details: err });
  }
};
