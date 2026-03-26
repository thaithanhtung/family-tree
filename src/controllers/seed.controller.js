const seedService = require("../services/seed.service");

const seedController = {
  async createSampleFamilyTree(req, res, next) {
    try {
      const userId = req.user.id;
      const memberCount = Math.min(parseInt(req.query.count) || 50, 10000);

      const result = await seedService.createSampleFamilyTree(userId, memberCount);

      res.status(201).json({
        message: `Đã tạo cây gia phả mẫu với ${result.memberCount} thành viên`,
        familyTree: result.familyTree,
        memberCount: result.memberCount,
        marriageCount: result.marriageCount,
        elapsedSeconds: result.elapsedSeconds,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = seedController;
