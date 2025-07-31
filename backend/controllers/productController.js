const Produit = require("../models/Product");

// Récupérer UNIQUEMENT les produits du commerçant connecté
const getProductsByCommercant = async (req, res) => {
    try {
        // Utilise commercant_id depuis req.user (basé sur ton modèle User)
        const produits = await Produit.find({ commercant_id: req.user.commercant_id })
            .populate("categorie_id", "nom");

        res.status(200).json({
            message: "Vos produits récupérés avec succès",
            produits,
            total: produits.length
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération de vos produits", 
            error: error.message 
        });
    }
};

// Récupérer UN produit spécifique du commerçant
const getOneProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const produit = await Produit.findOne({ 
            _id: id, 
            commercant_id: req.user.commercant_id 
        }).populate("categorie_id", "nom");

        if (!produit) {
            return res.status(404).json({ 
                message: "Produit non trouvé ou vous n'y avez pas accès" 
            });
        }

        res.status(200).json({
            message: "Produit récupéré avec succès",
            produit
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du produit:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération du produit", 
            error: error.message 
        });
    }
};

// Créer un produit (automatiquement lié au commerçant connecté)
const createProduct = async (req, res) => {
    try {
        const { nom, prix, image, stock, categorie_id } = req.body;

        // Validations
        if (!nom || nom.trim() === '') {
            return res.status(400).json({ 
                message: "Le nom du produit est requis" 
            });
        }

        if (prix === undefined || prix === null || prix < 0) {
            return res.status(400).json({ 
                message: "Le prix du produit est requis et doit être positif" 
            });
        }

        if (stock === undefined || stock === null || stock < 0) {
            return res.status(400).json({ 
                message: "Le stock doit être défini et positif" 
            });
        }

        // Créer le produit avec l'ID du commerçant connecté
        const nouveauProduit = new Produit({
            nom: nom.trim(),
            prix,
            image,
            stock,
            categorie_id,
            commercant_id: req.user.commercant_id // Lié automatiquement au commerçant
        });

        const produitSauvegarde = await nouveauProduit.save();
        await produitSauvegarde.populate("categorie_id", "nom");

        res.status(201).json({
            message: "Votre produit a été créé avec succès",
            produit: produitSauvegarde
        });
    } catch (error) {
        console.error("Erreur lors de la création du produit:", error);
        res.status(500).json({ 
            message: "Erreur lors de la création du produit", 
            error: error.message 
        });
    }
};

// Mettre à jour UNIQUEMENT ses propres produits
const updateProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prix, image, stock, categorie_id } = req.body;

        // Vérifier que le produit appartient au commerçant
        const produit = await Produit.findOne({ 
            _id: id, 
            commercant_id: req.user.commercant_id 
        });

        if (!produit) {
            return res.status(404).json({ 
                message: "Produit non trouvé ou vous n'avez pas l'autorisation de le modifier" 
            });
        }

        // Préparer les données à mettre à jour
        const updateData = {};
        
        if (nom !== undefined) {
            if (nom.trim() === '') {
                return res.status(400).json({ 
                    message: "Le nom du produit ne peut pas être vide" 
                });
            }
            updateData.nom = nom.trim();
        }

        if (prix !== undefined) {
            if (prix < 0) {
                return res.status(400).json({ 
                    message: "Le prix doit être positif" 
                });
            }
            updateData.prix = prix;
        }

        if (image !== undefined) updateData.image = image;

        if (stock !== undefined) {
            if (stock < 0) {
                return res.status(400).json({ 
                    message: "Le stock doit être positif" 
                });
            }
            updateData.stock = stock;
        }

        if (categorie_id !== undefined) updateData.categorie_id = categorie_id;

        // Effectuer la mise à jour
        const produitModifie = await Produit.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate("categorie_id", "nom");

        res.status(200).json({
            message: "Votre produit a été mis à jour avec succès",
            produit: produitModifie
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit:", error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du produit", 
            error: error.message 
        });
    }
};

// Mettre à jour uniquement le stock
const updateStockProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock === null || stock < 0) {
            return res.status(400).json({ 
                message: "Le stock doit être défini et positif" 
            });
        }

        // Vérifier que le produit appartient au commerçant et mettre à jour
        const produitModifie = await Produit.findOneAndUpdate(
            { _id: id, commercant_id: req.user.commercant_id },
            { stock },
            { new: true, runValidators: true }
        ).populate("categorie_id", "nom");

        if (!produitModifie) {
            return res.status(404).json({ 
                message: "Produit non trouvé ou vous n'avez pas l'autorisation de le modifier" 
            });
        }

        res.status(200).json({
            message: "Stock mis à jour avec succès",
            produit: produitModifie
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du stock:", error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du stock", 
            error: error.message 
        });
    }
};

// Supprimer UNIQUEMENT ses propres produits
const deleteProducts = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que le produit appartient au commerçant et le supprimer
        const produitSupprime = await Produit.findOneAndDelete({ 
            _id: id, 
            commercant_id: req.user.commercant_id 
        });

        if (!produitSupprime) {
            return res.status(404).json({ 
                message: "Produit non trouvé ou vous n'avez pas l'autorisation de le supprimer" 
            });
        }

        res.status(200).json({
            message: "Votre produit a été supprimé avec succès",
            produit: produitSupprime
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression du produit", 
            error: error.message 
        });
    }
};

// Rechercher dans ses propres produits

module.exports = {
    getProductsByCommercant,
    getOneProduct,
    createProduct,
    updateProducts,
    updateStockProducts,
    deleteProducts
};