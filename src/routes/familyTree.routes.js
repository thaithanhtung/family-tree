const express = require("express");
const router = express.Router();
const familyTreeController = require("../controllers/family.controller");
const personController = require("../controllers/person.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/", familyTreeController.create);
router.get("/", familyTreeController.getMyTrees);
router.get("/:id", familyTreeController.getById);
router.put("/:id", familyTreeController.update);
router.delete("/:id", familyTreeController.delete);

router.post("/:id/members", familyTreeController.addMember);
router.delete("/:id/members/:userId", familyTreeController.removeMember);

router.get("/:familyTreeId/persons", personController.getByFamilyTreeId);

module.exports = router;
