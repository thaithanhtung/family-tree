const marriageService = require("../services/marriage.service");

const marriageController = {
  async create(req, res, next) {
    try {
      const marriage = await marriageService.create(req.body);
      res.status(201).json(marriage);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const marriage = await marriageService.getById(id);
      if (!marriage) {
        return res.status(404).json({ message: "Marriage not found" });
      }
      res.json(marriage);
    } catch (error) {
      next(error);
    }
  },

  async getByFamilyTreeId(req, res, next) {
    try {
      const familyTreeId = parseInt(req.params.familyTreeId);
      const marriages = await marriageService.getByFamilyTreeId(familyTreeId);
      res.json(marriages);
    } catch (error) {
      next(error);
    }
  },

  async getByPersonId(req, res, next) {
    try {
      const personId = parseInt(req.params.personId);
      const marriages = await marriageService.getByPersonId(personId);
      res.json(marriages);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const marriage = await marriageService.update(id, req.body);
      res.json(marriage);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { status, divorceDate, divorceReason } = req.body;
      const marriage = await marriageService.updateStatus(
        id,
        status,
        divorceDate,
        divorceReason
      );
      res.json(marriage);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      await marriageService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = marriageController;
