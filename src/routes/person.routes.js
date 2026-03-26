const express = require("express");
const router = express.Router();
const personController = require("../controllers/person.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/", personController.create);
router.get("/:id", personController.getById);
router.put("/:id", personController.update);
router.patch("/:id/position", personController.updatePosition);
router.patch("/positions/batch", personController.updateManyPositions);
router.delete("/:id", personController.delete);

module.exports = router;
