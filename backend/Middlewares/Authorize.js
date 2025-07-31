const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secretKey = process.env.JWT_KEY;

const authenticate = async (req, res, next) => {
  try {
    // Récupération du token d'autorisation
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Pour extraire le token après "Bearer "
    console.log("Token reçu:", token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Aucun token fourni."
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, secretKey);
    console.log("Token décodé:", decoded);

    console.log("Tentative de vérification du token");
    
    // CORRECTION: Récupérer l'ID utilisateur du token au lieu du rôle
    const userId = decoded.data?.id || decoded.id || decoded.userId;
    const userEmail = decoded.data?.email || decoded.email;
    
    if (!userId && !userEmail) {
      return res.status(401).json({
        success: false,
        message: "Token invalide. ID ou email utilisateur non trouvé."
      });
    }
    
    // CORRECTION: Chercher l'utilisateur par ID ou email, pas par rôle
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (userEmail) {
      user = await User.findOne({ email: userEmail });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé."
      });
    }
    
    // Vérifier si l'utilisateur est actif (optionnel)
    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(401).json({
        success: false,
        message: "Compte utilisateur désactivé."
      });
    }
    
    // Ajout des informations utilisateur à la requête
    req.user = {
      id: user._id,
      role: user.role,
      telephone: user.telephone,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };
    
    console.log("Utilisateur authentifié:", {
      id: user._id,
      telephone: user.telephone,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`
    });
    
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(401).json({
      success: false,
      message: "Token invalide",
      error: error.message
    });
  }
};
const requireCommercant = (req, res, next) => {
    if (req.user.role !== "commercant") {
        return res.status(403).json({ 
            message: "Accès réservé aux commerçants uniquement" 
        });
    }
    next();
};
const authenticateTokenAndUserData = (req, res, next) => {
    const token = req.headers.authorization
    
    if (!token) {
        return res.status(403).send({ message: 'Accès interdit' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Token invalide' });
        }

        req.user = decoded.data;
        next();
    });
};
const authenticateCommercant = [authenticate, requireCommercant];

module.exports = {authenticate,authenticateCommercant,authenticateTokenAndUserData};