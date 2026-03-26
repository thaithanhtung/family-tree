const prisma = require("../utils/prisma");
const cache = require("./cache.service");

const toDateTime = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (dateStr.includes("T")) return new Date(dateStr);
  return new Date(dateStr + "T00:00:00.000Z");
};

const personService = {
  async create(userId, data) {
    const { birthDate, deathDate, ...rest } = data;
    const person = await prisma.person.create({
      data: {
        ...rest,
        birthDate: toDateTime(birthDate),
        deathDate: toDateTime(deathDate),
        createdById: userId,
      },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreePersons(data.familyTreeId));

    return person;
  },

  async getById(id) {
    return await prisma.person.findUnique({
      where: { id },
      include: {
        createdBy: true,
        father: true,
        mother: true,
        childrenAsFather: true,
        childrenAsMother: true,
        marriagesAsSpouse1: true,
        marriagesAsSpouse2: true,
        familyTree: true,
      },
    });
  },

  async update(id, data) {
    const {
      id: _id,
      createdById,
      createdAt,
      familyTreeId,
      birthDate,
      deathDate,
      ...updateData
    } = data;

    const person = await prisma.person.update({
      where: { id },
      data: {
        ...updateData,
        birthDate: toDateTime(birthDate),
        deathDate: toDateTime(deathDate),
      },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreePersons(person.familyTreeId));

    return person;
  },

  async updatePosition(id, positionX, positionY) {
    return await prisma.person.update({
      where: { id },
      data: { positionX, positionY },
    });
    // Không cần invalidate cache cho position update
  },

  async delete(id) {
    const person = await prisma.person.delete({
      where: { id },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreePersons(person.familyTreeId));

    return person;
  },

  // ⭐ Có cache
  async getByFamilyTreeId(familyTreeId) {
    const cacheKey = cache.keys.familyTreePersons(familyTreeId);

    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query DB
    const persons = await prisma.person.findMany({
      where: { familyTreeId },
      orderBy: { createdAt: "asc" },
    });

    // Save to cache (5 phút)
    await cache.set(cacheKey, persons, 300);

    return persons;
  },

  async updateManyPositions(positions) {
    const updates = positions.map((p) =>
      prisma.person.update({
        where: { id: p.id },
        data: { positionX: p.positionX, positionY: p.positionY },
      })
    );
    return await prisma.$transaction(updates);
  },
};

module.exports = personService;
