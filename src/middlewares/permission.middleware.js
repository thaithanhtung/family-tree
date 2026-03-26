const prisma = require("../utils/prisma");

const checkTreePermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const familyTreeId =
        parseInt(req.params.id) ||
        parseInt(req.params.familyTreeId) ||
        parseInt(req.body.familyTreeId);

      if (!familyTreeId) {
        return res.status(400).json({ message: "Family tree ID is required" });
      }

      const familyTree = await prisma.familyTree.findUnique({
        where: { id: familyTreeId },
        include: {
          members: {
            where: { userId },
          },
        },
      });

      if (!familyTree) {
        return res.status(404).json({ message: "Family tree not found" });
      }

      if (familyTree.ownerId === userId) {
        req.treePermission = "OWNER";
        return next();
      }

      const membership = familyTree.members[0];
      if (!membership) {
        return res
          .status(403)
          .json({ message: "You don't have access to this family tree" });
      }

      if (!requiredPermissions.includes(membership.permission)) {
        return res.status(403).json({
          message: `You need ${requiredPermissions.join(" or ")} permission`,
        });
      }

      req.treePermission = membership.permission;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const isTreeOwner = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const familyTreeId =
      parseInt(req.params.id) || parseInt(req.params.familyTreeId);

    if (!familyTreeId) {
      return res.status(400).json({ message: "Family tree ID is required" });
    }

    const familyTree = await prisma.familyTree.findUnique({
      where: { id: familyTreeId },
    });

    if (!familyTree) {
      return res.status(404).json({ message: "Family tree not found" });
    }

    if (familyTree.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Only the owner can perform this action" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const canView = checkTreePermission(["VIEW", "EDIT", "ADMIN"]);
const canEdit = checkTreePermission(["EDIT", "ADMIN"]);
const canAdmin = checkTreePermission(["ADMIN"]);

module.exports = {
  checkTreePermission,
  isTreeOwner,
  canView,
  canEdit,
  canAdmin,
};
