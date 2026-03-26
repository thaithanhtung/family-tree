const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

const authService = {
  register: async (name, email, password) => {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  },

  login: async (email, password) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Wrong password");
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  },

  refresh: async (token) => {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error("Refresh token expired");
    }

    try {
      const decoded = jwt.verify(token, REFRESH_SECRET);

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, email: storedToken.user.email },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      return newAccessToken;
    } catch (err) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error("Invalid refresh token");
    }
  },

  logout: async (token) => {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  },

  logoutAll: async (userId) => {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  verifyToken: (token) => {
    return jwt.verify(token, ACCESS_SECRET);
  },

  getUserById: async (userId) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  },
};

module.exports = authService;
