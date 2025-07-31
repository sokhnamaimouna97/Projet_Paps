const Categorie = require("../models/Categorie");
const Produit = require("../models/Product");

// Récupérer UNIQUEMENT les catégories du commerçant connecté
const getCategoriesByCommercant = async (req, res) => {
    try {
        // Note: Il faut ajouter le champ client_id au modèle Categorie
        const categories = await Categorie.find({ client_id: req.user.commercant_id });

        res.status(200).json({
            message: "Vos catégories récupérées avec succès",
            categories,
            total: categories.length
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération de vos catégories", 
            error: error.message 
        });
    }
};

// Récupérer UNE catégorie spécifique du commerçant
const getOneCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        
        const categorie = await Categorie.findOne({ 
            _id: id, 
            commercant_id: req.user.commercant_id 
        });

        if (!categorie) {
            return res.status(404).json({ 
                message: "Catégorie non trouvée ou vous n'y avez pas accès" 
            });
        }

        // Compter les produits dans cette catégorie
        const nombreProduits = await Produit.countDocuments({
            categorie_id: id,
            commercant_id: req.user.commercant_id
        });

        res.status(200).json({
            message: "Catégorie récupérée avec succès",
            categorie: {
                ...categorie.toObject(),
                nombreProduits
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération de la catégorie", 
            error: error.message 
        });
    }
};

// Créer une catégorie (automatiquement liée au commerçant connecté)
const createCategorie = async (req, res) => {
    try {
        const { nom } = req.body;
        
        if (!nom || nom.trim() === '') {
            return res.status(400).json({ 
                message: "Le nom de la catégorie est requis" 
            });
        }

        // Vérifier si une catégorie avec ce nom existe déjà pour ce commerçant
        const categorieExistante = await Categorie.findOne({
            nom: nom.trim(),
            commercant_id: req.user.commercant_id
        });

        if (categorieExistante) {
            return res.status(409).json({ 
                message: "Vous avez déjà une catégorie avec ce nom" 
            });
        }

        // Créer la catégorie avec l'ID du commerçant connecté
        const nouvelleCategorie = new Categorie({ 
            nom: nom.trim(),
            commercant_id: req.user.commercant_id // Liée automatiquement au commerçant
        });
        
        const categorieSauvegardee = await nouvelleCategorie.save();

        res.status(201).json({
            message: "Votre catégorie a été créée avec succès",
            categorie: categorieSauvegardee
        });
    } catch (error) {
        console.error("Erreur lors de la création de la catégorie:", error);
        res.status(500).json({ 
            message: "Erreur lors de la création de la catégorie", 
            error: error.message 
        });
    }
};

// Mettre à jour UNIQUEMENT ses propres catégories
const updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom } = req.body;

        if (!nom || nom.trim() === '') {
            return res.status(400).json({ 
                message: "Le nom de la catégorie est requis" 
            });
        }

        // Vérifier si une autre catégorie avec ce nom existe déjà pour ce commerçant
        const categorieExistante = await Categorie.findOne({
            nom: nom.trim(),
            commercant_id: req.user.commercant_id,
            _id: { $ne: id } // Exclure la catégorie actuelle
        });

        if (categorieExistante) {
            return res.status(409).json({ 
                message: "Vous avez déjà une catégorie avec ce nom" 
            });
        }

        // Vérifier que la catégorie appartient au commerçant et la mettre à jour
        const categorieModifiee = await Categorie.findOneAndUpdate(
            { _id: id, commercant_id: req.user.commercant_id },
            { nom: nom.trim() },
            { new: true, runValidators: true }
        );

        if (!categorieModifiee) {
            return res.status(404).json({ 
                message: "Catégorie non trouvée ou vous n'avez pas l'autorisation de la modifier" 
            });
        }

        res.status(200).json({
            message: "Votre catégorie a été mise à jour avec succès",
            categorie: categorieModifiee
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie:", error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour de la catégorie", 
            error: error.message 
        });
    }
};

// Supprimer UNIQUEMENT ses propres catégories
const deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier s'il y a des produits liés à cette catégorie pour ce commerçant
        const produitsLies = await Produit.find({ 
            categorie_id: id, 
            commercant_id: req.user.commercant_id 
        });

        if (produitsLies.length > 0) {
            return res.status(400).json({ 
                message: `Impossible de supprimer la catégorie car elle contient ${produitsLies.length} produit(s). Veuillez d'abord supprimer ou déplacer ces produits.`
            });
        }

        // Supprimer la catégorie si elle appartient au commerçant
        const categorieSupprimee = await Categorie.findOneAndDelete({ 
            _id: id, 
            client_id: req.user.commercant_id 
        });

        if (!categorieSupprimee) {
            return res.status(404).json({ 
                message: "Catégorie non trouvée ou vous n'avez pas l'autorisation de la supprimer" 
            });
        }

        res.status(200).json({
            message: "Votre catégorie a été supprimée avec succès",
            categorie: categorieSupprimee
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression de la catégorie", 
            error: error.message 
        });
    }
};

// Récupérer les produits d'une catégorie spécifique du commerçant
const getProductsByCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la catégorie appartient au commerçant
        const categorie = await Categorie.findOne({
            _id: id,
            commercant_id: req.user.commercant_id
        });

        if (!categorie) {
            return res.status(404).json({ 
                message: "Catégorie non trouvée ou vous n'y avez pas accès" 
            });
        }

        // Récupérer les produits de cette catégorie pour ce commerçant
        const produits = await Produit.find({
            categorie_id: id,
            commercant_id: req.user.commercant_id
        }).populate("categorie_id", "nom");

        res.status(200).json({
            message: "Produits de la catégorie récupérés avec succès",
            categorie: categorie.nom,
            produits,
            total: produits.length
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des produits de la catégorie", 
            error: error.message 
        });
    }
};

module.exports = {
    getCategoriesByCommercant,
    getOneCategorie,
    createCategorie,
    updateCategorie,
    deleteCategorie,
    getProductsByCategorie
};