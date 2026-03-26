const prisma = require("../utils/prisma");

const userService = {
  // Tạo user mới
  async createUser(data) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
  },

  // Lấy tất cả users
  async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        todos: true, // Include todos của user
      },
    });
  },

  // Lấy user theo ID
  async getUserById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        todos: true,
      },
    });
  },

  // Cập nhật user
  async updateUser(id, data) {
    return await prisma.user.update({
      where: { id: parseInt(id) },
      data,
    });
  },

  // Xóa user
  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id: parseInt(id) },
    });
  },
};

module.exports = userService;
