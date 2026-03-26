const express = require("express");
const router = express.Router();
const marriageController = require("../controllers/marriage.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/", marriageController.create);
router.get("/:id", marriageController.getById);
router.get("/family-tree/:familyTreeId", marriageController.getByFamilyTreeId);
router.get("/person/:personId", marriageController.getByPersonId);
router.put("/:id", marriageController.update);
router.patch("/:id/status", marriageController.updateStatus);
router.delete("/:id", marriageController.delete);

module.exports = router;
