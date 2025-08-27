const express = require("express");
const router = express.Router();
const { signIn, signUpCommercant, checkAndGetUserByToken } = require("../controllers/userController");
const { createLivreur, getLivreurById, updateLivreur, deleteLivreur, getAllLivreurs, getAllLivreursByCommercants } = require("../controllers/livreurController");
const authMiddleware = require("../Middlewares/Authorize");
const { getCategoriesByCommercant, createCategorie, getOneCategorie, getProductsByCategorie, updateCategorie, deleteCategorie } = require("../controllers/categorieController");
const { getOneProduct, getProductsByCommercant, createProduct, updateProducts, updateStockProducts, deleteProducts } = require("../controllers/productController");

router.post("/signup", signUpCommercant);
router.post("/signin", signIn);
router.get('/verify-token/:token', checkAndGetUserByToken);

//routes related to livreur
router.post("/createLivreur",createLivreur);
router.get("/getOnelivreur/:id", getLivreurById);
router.put("/updatelivreur/:id", updateLivreur);
router.delete("/deletelivreur/:id", deleteLivreur);
router.get("/getAlllivreurs", getAllLivreurs);
router.get("/getAlllivreursByCommercants",authMiddleware.authenticate, getAllLivreursByCommercants);

//relatives au categorie
// routes relatives au  produits
router.get("/getProductByCommercant",authMiddleware.authenticateCommercant,getProductsByCommercant);
router.get("/getOneProduct/:id",authMiddleware.authenticateCommercant, getOneProduct);
router.post("/createProduct",authMiddleware.authenticateCommercant, createProduct);
router.put("/UpdateProduct/:id",authMiddleware.authenticateCommercant, updateProducts);
router.patch("/updateStockProduct/:id/stock", authMiddleware.authenticateCommercant,updateStockProducts);
router.delete("/deleteProduct/:id", authMiddleware.authenticateCommercant,deleteProducts);

//routes relatives au categorie

router.get("/getcategoriesByCommercant", authMiddleware.authenticateCommercant, getCategoriesByCommercant);
router.post("/createCategories", authMiddleware.authenticateCommercant, createCategorie);
router.get("/getOnecategories/:id", authMiddleware.authenticateCommercant, getOneCategorie);
router.get("/getOneProductByCategories/:id/products", authMiddleware.authenticateCommercant, getProductsByCategorie);
router.put("/updateCategories/:id",authMiddleware.authenticateCommercant, updateCategorie);
router.delete("/deleteCategories/:id", authMiddleware.authenticateCommercant, deleteCategorie);
module.exports = router;