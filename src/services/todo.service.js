const prisma = require("../utils/prisma");

const todoService = {
  async getTodosByUser(userId) {
    return await prisma.todo.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    });
  },

  async createTodo(userId, data) {
    return await prisma.todo.create({
      data: {
        title: data.title,
        userId: userId,
      },
    });
  },

  async updateTodo(todoId, userId, data) {
    const todo = await prisma.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      throw new Error("Todo not found or unauthorized");
    }

    return await prisma.todo.update({
      where: { id: todoId },
      data,
    });
  },

  async deleteTodo(todoId, userId) {
    const todo = await prisma.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      throw new Error("Todo not found or unauthorized");
    }

    return await prisma.todo.delete({
      where: { id: todoId },
    });
  },
};

module.exports = todoService;
