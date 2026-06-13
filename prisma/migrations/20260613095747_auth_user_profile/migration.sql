/*
  Warnings:

  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "role" VARCHAR(20) NOT NULL DEFAULT 'user',
ALTER COLUMN "username" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'offline';

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "user_stats" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "friends_count" INTEGER NOT NULL DEFAULT 0,
    "winning_count" INTEGER NOT NULL DEFAULT 0,
    "tournaments_count" INTEGER NOT NULL DEFAULT 0,
    "posts_count" INTEGER NOT NULL DEFAULT 0,
    "photos_count" INTEGER NOT NULL DEFAULT 0,
    "videos_count" INTEGER NOT NULL DEFAULT 0,
    "groups_count" INTEGER NOT NULL DEFAULT 0,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_user_id_key" ON "user_stats"("user_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
