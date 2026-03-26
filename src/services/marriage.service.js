const prisma = require("../utils/prisma");
const cache = require("./cache.service");

const toDateTime = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (dateStr.includes("T")) return new Date(dateStr);
  return new Date(dateStr + "T00:00:00.000Z");
};

const marriageService = {
  async create(data) {
    const marriage = await prisma.marriage.create({
      data: {
        familyTreeId: data.familyTreeId,
        spouse1Id: data.spouse1Id,
        spouse2Id: data.spouse2Id,
        marriageDate: toDateTime(data.marriageDate),
        marriagePlace: data.marriagePlace,
        status: data.status || "MARRIED",
        orderForSpouse1: data.orderForSpouse1 || 1,
        orderForSpouse2: data.orderForSpouse2 || 1,
      },
      include: {
        spouse1: true,
        spouse2: true,
      },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreeMarriages(data.familyTreeId));

    return marriage;
  },

  async getById(id) {
    return await prisma.marriage.findUnique({
      where: { id },
      include: {
        spouse1: true,
        spouse2: true,
        familyTree: true,
      },
    });
  },

  // ⭐ Có cache
  async getByFamilyTreeId(familyTreeId) {
    const cacheKey = cache.keys.familyTreeMarriages(familyTreeId);

    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query DB
    const marriages = await prisma.marriage.findMany({
      where: { familyTreeId },
      orderBy: { marriageDate: "asc" },
    });

    // Save to cache (5 phút)
    await cache.set(cacheKey, marriages, 300);

    return marriages;
  },

  async getByPersonId(personId) {
    return await prisma.marriage.findMany({
      where: {
        OR: [{ spouse1Id: personId }, { spouse2Id: personId }],
      },
      include: {
        spouse1: true,
        spouse2: true,
      },
      orderBy: { marriageDate: "asc" },
    });
  },

  async update(id, data) {
    const {
      id: _id,
      familyTreeId,
      spouse1Id,
      spouse2Id,
      createdAt,
      marriageDate,
      divorceDate,
      ...updateData
    } = data;

    const marriage = await prisma.marriage.update({
      where: { id },
      data: {
        ...updateData,
        marriageDate: toDateTime(marriageDate),
        divorceDate: toDateTime(divorceDate),
      },
      include: {
        spouse1: true,
        spouse2: true,
      },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreeMarriages(marriage.familyTreeId));

    return marriage;
  },

  async updateStatus(id, status, divorceDate = null, divorceReason = null) {
    const marriage = await prisma.marriage.update({
      where: { id },
      data: {
        status,
        divorceDate: toDateTime(divorceDate),
        divorceReason,
      },
      include: {
        spouse1: true,
        spouse2: true,
      },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreeMarriages(marriage.familyTreeId));

    return marriage;
  },

  async delete(id) {
    const marriage = await prisma.marriage.delete({
      where: { id },
    });

    // Invalidate cache
    await cache.del(cache.keys.familyTreeMarriages(marriage.familyTreeId));

    return marriage;
  },
};

module.exports = marriageService;
