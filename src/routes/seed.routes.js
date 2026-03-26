const express = require("express");
const router = express.Router();
const seedController = require("../controllers/seed.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/family-tree", seedController.createSampleFamilyTree);

module.exports = router;
