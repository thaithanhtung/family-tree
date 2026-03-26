const supabase = require("../utils/supabase");

const BUCKET_NAME = "avatars";

const uploadService = {
  async uploadAvatar(file, personId) {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const fileExt = file.originalname.split(".").pop();
    const fileName = `person-${personId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  async deleteAvatar(avatarUrl) {
    if (!supabase || !avatarUrl) return;

    try {
      const urlParts = avatarUrl.split(`/${BUCKET_NAME}/`);
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    } catch (error) {
      console.error("Failed to delete avatar:", error);
    }
  },

  async uploadAndUpdatePerson(file, personId, prisma) {
    const avatarUrl = await this.uploadAvatar(file, personId);

    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: { avatar: avatarUrl },
    });

    return updatedPerson;
  },
};

module.exports = uploadService;
