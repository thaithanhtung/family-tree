const personService = require("../services/person.service");

const personController = {
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const person = await personService.create(userId, req.body);
      res.status(201).json(person);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const person = await personService.getById(id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      next(error);
    }
  },

  async getByFamilyTreeId(req, res, next) {
    try {
      const familyTreeId = parseInt(req.params.familyTreeId);
      const persons = await personService.getByFamilyTreeId(familyTreeId);
      res.json(persons);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const person = await personService.update(id, req.body);
      res.json(person);
    } catch (error) {
      next(error);
    }
  },

  async updatePosition(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { positionX, positionY } = req.body;
      const person = await personService.updatePosition(id, positionX, positionY);
      res.json(person);
    } catch (error) {
      next(error);
    }
  },

  async updateManyPositions(req, res, next) {
    try {
      const { positions } = req.body;
      const result = await personService.updateManyPositions(positions);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      await personService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = personController;
