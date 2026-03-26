const familyTreeService = require("../services/familyTree.service");

const familyTreeController = {
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const data = {
        ...req.body,
        ownerId: userId,
      };
      const familyTree = await familyTreeService.createFamilyTree(data);
      res.status(201).json(familyTree);
    } catch (error) {
      next(error);
    }
  },

  async getMyTrees(req, res, next) {
    try {
      const userId = req.user.id;
      const trees = await familyTreeService.getByUserId(userId);
      res.json(trees);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const tree = await familyTreeService.getById(id);
      if (!tree) {
        return res.status(404).json({ message: "Family tree not found" });
      }
      res.json(tree);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const tree = await familyTreeService.update(id, req.body);
      res.json(tree);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      await familyTreeService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async addMember(req, res, next) {
    try {
      const familyTreeId = parseInt(req.params.id);
      const { userId, permission } = req.body;
      const member = await familyTreeService.addMember(familyTreeId, userId, permission);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req, res, next) {
    try {
      const familyTreeId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      await familyTreeService.removeMember(familyTreeId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = familyTreeController;
