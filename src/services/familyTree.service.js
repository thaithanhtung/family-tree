const prisma = require("../utils/prisma");

const familyTreeService = {
  async createFamilyTree(data) {
    return await prisma.familyTree.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
      },
    });
  },

  async getByUserId(userId) {
    return await prisma.familyTree.findMany({
      where: {
        // User is owner of the family tree or a member of the family tree
        OR: [
          // User is owner of the family tree
          { ownerId: userId },
          // User is a member of the family tree
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            persons: true,
          },
        },
      },
    });
  },

  async getById(id) {
    return await prisma.familyTree.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            persons: true,
            marriages: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  },

  async update(id, data) {
    return await prisma.familyTree.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  },

  async delete(id) {
    return await prisma.familyTree.delete({
      where: { id },
    });
  },

  async addMember(familyTreeId, userId, permission) {
    return await prisma.familyTreeMember.create({
      data: {
        familyTreeId,
        userId,
        permission,
      },
    });
  },
  async removeMember(familyTreeId, userId) {
    return await prisma.familyTreeMember.delete({
      where: { userId_familyTreeId: { userId, familyTreeId } },
    });
  },
};

module.exports = familyTreeService;
