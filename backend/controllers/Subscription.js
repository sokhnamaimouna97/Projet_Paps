const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Commercant = require('../models/Commercant'); // si tu en as besoin

module.exports.PaySubscription = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        if (user.role !== 'commercant') {
            return res.status(403).json({ message: "Seuls les commerçants peuvent souscrire à un abonnement." });
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 mois plus tard

        const subscription = new Subscription({
            commercant_id: user.commercant_id,
            start: startDate,
            end: endDate,
            status: 'active',
            price,// Tu peux aussi le mettre par défaut dans le modèle
        });
        await subscription.save();
        res.status(201).json({
            message: "Abonnement payé avec succès.",
            subscription
        });
    } catch (error) {
        console.error("Erreur lors du paiement de l'abonnement :", error);
        res.status(500).json({ message: "Erreur serveur lors du paiement de l'abonnement." });
    }
};
