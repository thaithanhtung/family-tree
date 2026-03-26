const todoService = require("../services/todo.service");

const todoController = {
  async getTodos(req, res, next) {
    try {
      const todos = await todoService.getTodosByUser(req.user.id);
      res.json(todos);
    } catch (error) {
      next(error);
    }
  },

  async createTodo(req, res, next) {
    try {
      const todo = await todoService.createTodo(req.user.id, req.body);
      res.status(201).json(todo);
    } catch (error) {
      next(error);
    }
  },

  async updateTodo(req, res, next) {
    try {
      const todo = await todoService.updateTodo(
        parseInt(req.params.id),
        req.user.id,
        req.body
      );
      res.json(todo);
    } catch (error) {
      next(error);
    }
  },

  async deleteTodo(req, res, next) {
    try {
      await todoService.deleteTodo(parseInt(req.params.id), req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = todoController;
