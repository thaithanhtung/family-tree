const uploadService = require("../services/upload.service");
const prisma = require("../utils/prisma");
const { createChildLogger } = require("../utils/logger");

const log = createChildLogger("upload-controller");

const uploadController = {
  async uploadPersonAvatar(req, res, next) {
    try {
      const personId = parseInt(req.params.personId);
      const file = req.file;

      log.info({ personId, fileName: file?.originalname }, "Upload avatar request");

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const person = await prisma.person.findUnique({
        where: { id: personId },
      });

      if (!person) {
        log.warn({ personId }, "Person not found for avatar upload");
        return res.status(404).json({ message: "Person not found" });
      }

      if (person.avatar) {
        log.debug({ personId, oldAvatar: person.avatar }, "Deleting old avatar");
        await uploadService.deleteAvatar(person.avatar);
      }

      const updatedPerson = await uploadService.uploadAndUpdatePerson(
        file,
        personId,
        prisma
      );

      log.info({ personId, newAvatar: updatedPerson.avatar }, "Avatar uploaded successfully");

      res.json({
        message: "Avatar uploaded successfully",
        person: updatedPerson,
      });
    } catch (error) {
      log.error({ err: error, personId: req.params.personId }, "Avatar upload failed");
      next(error);
    }
  },

  async deletePersonAvatar(req, res, next) {
    try {
      const personId = parseInt(req.params.personId);

      log.info({ personId }, "Delete avatar request");

      const person = await prisma.person.findUnique({
        where: { id: personId },
      });

      if (!person) {
        log.warn({ personId }, "Person not found for avatar deletion");
        return res.status(404).json({ message: "Person not found" });
      }

      if (person.avatar) {
        await uploadService.deleteAvatar(person.avatar);
      }

      const updatedPerson = await prisma.person.update({
        where: { id: personId },
        data: { avatar: null },
      });

      log.info({ personId }, "Avatar deleted successfully");

      res.json({
        message: "Avatar deleted successfully",
        person: updatedPerson,
      });
    } catch (error) {
      log.error({ err: error, personId: req.params.personId }, "Avatar deletion failed");
      next(error);
    }
  },
};

module.exports = uploadController;
