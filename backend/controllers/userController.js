const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Commercant = require("../models/Commercant");

const secretKey = process.env.JWT_KEY;

// Fonction pour créer un token
const createToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, secretKey, { expiresIn: "7d" });
};

// 🔐 Création d'un commerçant + utilisateur associé
const signUpCommercant = async (req, res) => {
    try {
        const { prenom, nom, telephone, email, password, nom_boutique, adress } = req.body;

        // Vérifie si un utilisateur avec cet email existe déjà
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }

        // Hash du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création du commerçant
        const commercant = new Commercant({ nom_boutique, adress });
        await commercant.save();

        // Création de l'utilisateur associé
        const user = new User({
            prenom,
            nom,
            telephone,
            role: "commercant",
            email,
            password: hashedPassword,
            commercant_id: commercant._id
        });

        await user.save();

        // Générer un token
        const token = createToken(user._id, user.email, user.role);

        res.status(201).json({
            message: "Commerçant et compte utilisateur créés avec succès.",
            user,
        });

    } catch (err) {
        console.error("Erreur lors de l'inscription du commerçant :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Rechercher l'utilisateur par email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
if (user.role !== "commercant" && user.role !== "livreur") {
            return res.status(403).json({ message: "Accès réservé aux commerçants." });
        }
        // 3. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // 4. Générer un token JWT
        const token= createToken(user._id, user.email, user.role);
    

        res.status(200).json({
            message: "Connexion réussie.",
            token,
            user
        });
    } catch (error) {
        console.error("Erreur de connexion commerçant :", error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
};




const checkAndGetUserByToken = async (req, res) => {
    try {
        const { token } = req.params;
        let userData;
        if (!token) {
            return res.status(403).send({ message: req.t('auth.token.accessDenied') });
        }

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                console.log("Error+++++++++++++++++++++++++++ :" , err);
                return res.status(403).send({ message: req.t('auth.token.invalidToken') });
            }

            userData = decoded.data;
        });
        
        // Recherchez l'utilisateur par ID en ne récupérant que certains champs
        const user = await User.findById(userData.id).select("firstName lastName email phone role imgUser subOrganizer.parentOrganizer ");

        if (!user) {
            return res.status(404).json({ message: req.t('auth.user.notFound') });
        }

        
        if(user.role === ' Admin BT_Events ' ){
            user.role = "Admin"
        }

        return res.status(200).json({ message: req.t('auth.user.retrieved'), user });
    } catch (error) {
        console.log("Err Connection : " , error);
        
        return res.status(500).json({ message: req.t('server.error'), error: error.message });
    }
};


module.exports = { signUpCommercant, checkAndGetUserByToken, signIn };