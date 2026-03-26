const prisma = require("../utils/prisma");
const { createChildLogger } = require("../utils/logger");

const log = createChildLogger("seed-service");

const firstNames = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng",
  "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Trương", "Cao", "Lương",
];

const middleNames = ["Văn", "Thị", "Hữu", "Minh", "Quốc", "Thanh", "Đức", "Công", "Xuân", "Thu"];

const lastNames = [
  "An", "Bình", "Cường", "Dũng", "Phúc", "Giang", "Hải", "Khang", "Linh",
  "Mai", "Nam", "Oanh", "Phong", "Quân", "Sơn", "Tâm", "Uyên", "Vinh", "Yến",
  "Anh", "Bảo", "Chi", "Đạt", "Hà", "Hùng", "Khánh", "Lan", "Long", "Nga",
  "Tuấn", "Hương", "Thảo", "Duy", "Hạnh", "Tú", "Quỳnh", "Trung", "Hiền", "Đông",
];

function randomName(gender) {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middle = gender === "MALE" ? middleNames[Math.floor(Math.random() * 9)] : "Thị";
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${middle} ${last}`;
}

function randomDate(startYear, endYear) {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear));
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(`${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
}

function randomColor() {
  const colors = [
    "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
    "#14b8a6", "#f43f5e", "#a855f7", "#0ea5e9", "#eab308",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const seedService = {
  async createSampleFamilyTree(userId, memberCount = 50) {
    log.info({ userId, memberCount }, "Starting family tree creation");
    const startTime = Date.now();

    const familyTree = await prisma.familyTree.create({
      data: {
        name: `Gia phả mẫu - ${memberCount} người`,
        description: `Cây gia phả mẫu với ${memberCount} thành viên để test hiệu năng`,
        ownerId: userId,
      },
    });

    const allPersons = [];
    const marriages = [];
    let currentId = 1;

    // Tính toán số thế hệ và số người mỗi thế hệ
    const generations = this.calculateGenerations(memberCount);
    log.debug({ generations }, "Generation distribution");

    let posY = 50;
    let prevGeneration = [];

    for (let genIndex = 0; genIndex < generations.length; genIndex++) {
      const genCount = generations[genIndex];
      const currentGeneration = [];
      const posXSpacing = Math.max(80, 1200 / Math.sqrt(genCount));

      log.debug({ generation: genIndex + 1, count: genCount }, "Creating generation");

      // Tạo người cho thế hệ này
      for (let i = 0; i < genCount; i++) {
        const gender = i % 2 === 0 ? "MALE" : "FEMALE";
        const birthYear = 1920 + genIndex * 25 + Math.floor(Math.random() * 10);
        const isDeceased = genIndex < 2 || (genIndex === 2 && Math.random() > 0.7);

        // Tìm cha mẹ từ thế hệ trước
        let fatherId = null;
        let motherId = null;
        let branchColor = randomColor();

        if (prevGeneration.length > 0 && genIndex > 0) {
          // Mỗi cặp cha mẹ có thể có nhiều con
          const parentPairIndex = Math.floor(i / 3) % Math.floor(prevGeneration.length / 2);
          const parentIndex = parentPairIndex * 2;

          if (parentIndex < prevGeneration.length) {
            const parent1 = prevGeneration[parentIndex];
            const parent2 = prevGeneration[parentIndex + 1];

            if (parent1 && parent2) {
              fatherId = parent1.gender === "MALE" ? parent1.id : parent2.id;
              motherId = parent1.gender === "FEMALE" ? parent1.id : parent2.id;
              branchColor = parent1.branchColor;
            }
          }
        }

        const person = {
          id: currentId++,
          familyTreeId: familyTree.id,
          name: randomName(gender),
          gender,
          birthDate: randomDate(birthYear, birthYear + 5),
          isDeceased,
          deathDate: isDeceased ? randomDate(birthYear + 50, Math.min(birthYear + 90, 2024)) : null,
          fatherId,
          motherId,
          positionX: (i % 50) * posXSpacing + Math.random() * 30,
          positionY: posY + Math.floor(i / 50) * 120,
          branchColor,
          createdById: userId,
        };

        allPersons.push(person);
        currentGeneration.push(person);
      }

      // Tạo marriages cho các cặp trong thế hệ
      for (let i = 0; i < currentGeneration.length - 1; i += 2) {
        const person1 = currentGeneration[i];
        const person2 = currentGeneration[i + 1];

        if (person1 && person2 && person1.gender !== person2.gender) {
          marriages.push({
            familyTreeId: familyTree.id,
            spouse1Id: person1.gender === "MALE" ? person1.id : person2.id,
            spouse2Id: person1.gender === "MALE" ? person2.id : person1.id,
            marriageDate: randomDate(
              Math.max(person1.birthDate.getFullYear(), person2.birthDate.getFullYear()) + 20,
              Math.max(person1.birthDate.getFullYear(), person2.birthDate.getFullYear()) + 30
            ),
            status: genIndex < 2 ? "WIDOWED" : "MARRIED",
          });
        }
      }

      prevGeneration = currentGeneration;
      posY += 150 + Math.floor(genCount / 50) * 120;
    }

    // Batch insert persons
    log.info({ count: allPersons.length }, "Saving persons to database");
    const batchSize = 500;

    for (let i = 0; i < allPersons.length; i += batchSize) {
      const batch = allPersons.slice(i, i + batchSize).map(({ id, ...rest }) => rest);
      await prisma.person.createMany({ data: batch });
      log.debug({ saved: Math.min(i + batchSize, allPersons.length), total: allPersons.length }, "Batch saved");
    }

    // Lấy lại ID thực từ database
    const createdPersons = await prisma.person.findMany({
      where: { familyTreeId: familyTree.id },
      orderBy: { id: "asc" },
    });

    // Map lại ID cho marriages
    const idMap = new Map();
    createdPersons.forEach((p, index) => {
      idMap.set(index + 1, p.id);
    });

    // Cập nhật fatherId, motherId với ID thực
    log.info("Updating parent relationships");
    for (const person of createdPersons) {
      const originalIndex = createdPersons.indexOf(person);
      const originalPerson = allPersons[originalIndex];

      if (originalPerson && (originalPerson.fatherId || originalPerson.motherId)) {
        await prisma.person.update({
          where: { id: person.id },
          data: {
            fatherId: originalPerson.fatherId ? idMap.get(originalPerson.fatherId) : null,
            motherId: originalPerson.motherId ? idMap.get(originalPerson.motherId) : null,
          },
        });
      }
    }

    // Batch insert marriages với ID thực
    log.info({ count: marriages.length }, "Saving marriages");
    const validMarriages = marriages
      .map((m) => ({
        ...m,
        spouse1Id: idMap.get(m.spouse1Id),
        spouse2Id: idMap.get(m.spouse2Id),
      }))
      .filter((m) => m.spouse1Id && m.spouse2Id);

    for (let i = 0; i < validMarriages.length; i += batchSize) {
      const batch = validMarriages.slice(i, i + batchSize);
      try {
        await prisma.marriage.createMany({ data: batch, skipDuplicates: true });
      } catch (err) {
        log.warn({ err }, "Skipped duplicate marriages");
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log.info(
      { 
        familyTreeId: familyTree.id, 
        memberCount: createdPersons.length, 
        marriageCount: validMarriages.length, 
        elapsedSeconds: parseFloat(elapsed) 
      }, 
      "Family tree creation completed"
    );

    return {
      familyTree,
      memberCount: createdPersons.length,
      marriageCount: validMarriages.length,
      elapsedSeconds: parseFloat(elapsed),
    };
  },

  calculateGenerations(totalCount) {
    if (totalCount <= 50) {
      return [4, 8, 16, Math.min(22, totalCount - 28)].filter((n) => n > 0);
    }

    if (totalCount <= 500) {
      const generations = [];
      let remaining = totalCount;
      let genSize = 4;

      while (remaining > 0) {
        const size = Math.min(genSize, remaining);
        generations.push(size);
        remaining -= size;
        genSize = Math.floor(genSize * 2.5);
      }
      return generations;
    }

    // Cho 1000+ người: nhiều thế hệ với tăng trưởng exponential
    const generations = [];
    let remaining = totalCount;
    let genSize = 10;
    const growthRate = 2.2;

    while (remaining > 0) {
      const size = Math.min(Math.floor(genSize), remaining);
      generations.push(size);
      remaining -= size;
      genSize *= growthRate;

      // Giới hạn kích thước thế hệ
      if (genSize > 3000) genSize = 3000;
    }

    return generations;
  },
};

module.exports = seedService;
