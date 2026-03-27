-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "TreePermission" AS ENUM ('VIEW', 'EDIT', 'ADMIN');

-- CreateEnum
CREATE TYPE "MarriageStatus" AS ENUM ('MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "todos" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_trees" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "owner_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_trees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_tree_members" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "family_tree_id" INTEGER NOT NULL,
    "permission" "TreePermission" NOT NULL DEFAULT 'VIEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_tree_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" SERIAL NOT NULL,
    "family_tree_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "gender" "Gender" NOT NULL,
    "birth_date" TIMESTAMP(3),
    "birth_place" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "is_deceased" BOOLEAN NOT NULL DEFAULT false,
    "death_date" TIMESTAMP(3),
    "death_place" VARCHAR(200),
    "burial_place" VARCHAR(200),
    "father_id" INTEGER,
    "mother_id" INTEGER,
    "position_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "branch_color" TEXT NOT NULL DEFAULT '#3b82f6',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marriages" (
    "id" SERIAL NOT NULL,
    "family_tree_id" INTEGER NOT NULL,
    "spouse1_id" INTEGER NOT NULL,
    "spouse2_id" INTEGER NOT NULL,
    "marriage_date" TIMESTAMP(3),
    "marriage_place" VARCHAR(200),
    "status" "MarriageStatus" NOT NULL DEFAULT 'MARRIED',
    "divorce_date" TIMESTAMP(3),
    "divorce_reason" VARCHAR(500),
    "order_for_spouse1" INTEGER NOT NULL DEFAULT 1,
    "order_for_spouse2" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marriages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "family_tree_members_user_id_family_tree_id_key" ON "family_tree_members"("user_id", "family_tree_id");

-- CreateIndex
CREATE UNIQUE INDEX "persons_user_id_key" ON "persons"("user_id");

-- CreateIndex
CREATE INDEX "persons_family_tree_id_idx" ON "persons"("family_tree_id");

-- CreateIndex
CREATE INDEX "persons_father_id_idx" ON "persons"("father_id");

-- CreateIndex
CREATE INDEX "persons_mother_id_idx" ON "persons"("mother_id");

-- CreateIndex
CREATE INDEX "persons_created_by_id_idx" ON "persons"("created_by_id");

-- CreateIndex
CREATE INDEX "marriages_family_tree_id_idx" ON "marriages"("family_tree_id");

-- CreateIndex
CREATE INDEX "marriages_spouse1_id_idx" ON "marriages"("spouse1_id");

-- CreateIndex
CREATE INDEX "marriages_spouse2_id_idx" ON "marriages"("spouse2_id");

-- CreateIndex
CREATE UNIQUE INDEX "marriages_spouse1_id_spouse2_id_key" ON "marriages"("spouse1_id", "spouse2_id");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_trees" ADD CONSTRAINT "family_trees_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_tree_members" ADD CONSTRAINT "family_tree_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_tree_members" ADD CONSTRAINT "family_tree_members_family_tree_id_fkey" FOREIGN KEY ("family_tree_id") REFERENCES "family_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_family_tree_id_fkey" FOREIGN KEY ("family_tree_id") REFERENCES "family_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marriages" ADD CONSTRAINT "marriages_family_tree_id_fkey" FOREIGN KEY ("family_tree_id") REFERENCES "family_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marriages" ADD CONSTRAINT "marriages_spouse1_id_fkey" FOREIGN KEY ("spouse1_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marriages" ADD CONSTRAINT "marriages_spouse2_id_fkey" FOREIGN KEY ("spouse2_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
