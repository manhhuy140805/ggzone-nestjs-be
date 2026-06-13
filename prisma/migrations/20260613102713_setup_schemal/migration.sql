/*
  Warnings:

  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_stats" DROP CONSTRAINT "user_stats_user_id_fkey";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "user_roles";

-- DropTable
DROP TABLE "user_stats";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "AdminAuditLogs" (
    "Id" UUID NOT NULL,
    "AdminUserId" UUID NOT NULL,
    "Action" VARCHAR(100) NOT NULL,
    "TargetType" VARCHAR(50),
    "TargetId" UUID,
    "OldValue" TEXT,
    "NewValue" TEXT,
    "IpAddress" VARCHAR(50),
    "UserAgent" VARCHAR(500),
    "Reason" TEXT,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLogs_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Announcements" (
    "Id" UUID NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Content" TEXT NOT NULL,
    "Type" VARCHAR(20),
    "Priority" VARCHAR(20) DEFAULT 'normal',
    "TargetAudience" VARCHAR(20) DEFAULT 'all',
    "IsActive" BOOLEAN DEFAULT true,
    "StartDate" TIMESTAMPTZ(6),
    "EndDate" TIMESTAMPTZ(6),
    "CreatedBy" UUID,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcements_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "Id" UUID NOT NULL,
    "PostId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "ParentCommentId" UUID,
    "Content" TEXT NOT NULL,
    "LikesCount" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "DailyStatistics" (
    "Id" UUID NOT NULL,
    "StatDate" DATE NOT NULL,
    "NewUsers" INTEGER DEFAULT 0,
    "ActiveUsers" INTEGER DEFAULT 0,
    "TotalPosts" INTEGER DEFAULT 0,
    "TotalComments" INTEGER DEFAULT 0,
    "TotalVideos" INTEGER DEFAULT 0,
    "TotalGameLaunches" INTEGER DEFAULT 0,
    "TotalRevenue" DECIMAL(10,2) DEFAULT 0,
    "TotalOrders" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStatistics_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EmailTemplates" (
    "Id" UUID NOT NULL,
    "TemplateName" VARCHAR(100) NOT NULL,
    "Subject" VARCHAR(200) NOT NULL,
    "HtmlBody" TEXT NOT NULL,
    "TextBody" TEXT,
    "Category" VARCHAR(50),
    "Variables" TEXT,
    "IsActive" BOOLEAN DEFAULT true,
    "UpdatedBy" UUID,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTemplates_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "FeaturedContent" (
    "Id" UUID NOT NULL,
    "ContentType" VARCHAR(50) NOT NULL,
    "ContentId" UUID NOT NULL,
    "Title" VARCHAR(200),
    "Description" TEXT,
    "ImageUrl" VARCHAR(500),
    "DisplayOrder" INTEGER DEFAULT 0,
    "StartDate" TIMESTAMPTZ(6),
    "EndDate" TIMESTAMPTZ(6),
    "IsActive" BOOLEAN DEFAULT true,
    "CreatedBy" UUID,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedContent_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Friendships" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "FriendId" UUID NOT NULL,
    "Status" VARCHAR(20) DEFAULT 'pending',
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendships_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "FriendSuggestions" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "SuggestedUserId" UUID NOT NULL,
    "Reason" VARCHAR(100),
    "Score" DECIMAL(5,2) DEFAULT 0,
    "IsShown" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendSuggestions_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "GameLaunchLogs" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "GameId" UUID NOT NULL,
    "LaunchMethod" VARCHAR(50),
    "LaunchedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "SessionDuration" INTEGER,
    "EndedAt" TIMESTAMPTZ(6),

    CONSTRAINT "GameLaunchLogs_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "GameReviews" (
    "Id" UUID NOT NULL,
    "GameId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Rating" INTEGER NOT NULL,
    "Title" VARCHAR(200),
    "Content" TEXT,
    "HoursPlayed" INTEGER DEFAULT 0,
    "IsRecommended" BOOLEAN DEFAULT true,
    "HelpfulCount" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameReviews_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Games" (
    "Id" UUID NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Slug" VARCHAR(100) NOT NULL,
    "Description" TEXT,
    "CoverImageUrl" VARCHAR(500),
    "IconUrl" VARCHAR(500),
    "Genre" VARCHAR(50),
    "Platform" VARCHAR(50),
    "ReleaseDate" DATE,
    "Publisher" VARCHAR(100),
    "IsActive" BOOLEAN DEFAULT true,
    "GameType" VARCHAR(20) DEFAULT 'desktop',
    "LaunchUrl" VARCHAR(500),
    "DownloadUrl" VARCHAR(500),
    "WebPlayUrl" VARCHAR(500),
    "InstallSize" BIGINT,
    "MinimumRequirements" TEXT,
    "RecommendedRequirements" TEXT,
    "LauncherType" VARCHAR(50),
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "GroupMembers" (
    "Id" UUID NOT NULL,
    "GroupId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Role" VARCHAR(20) DEFAULT 'member',
    "JoinedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembers_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "Id" UUID NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" TEXT,
    "CoverImageUrl" VARCHAR(500),
    "IconUrl" VARCHAR(500),
    "Visibility" VARCHAR(20) DEFAULT 'public',
    "MembersCount" INTEGER DEFAULT 0,
    "CreatedBy" UUID,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "Id" UUID NOT NULL,
    "SenderId" UUID NOT NULL,
    "ReceiverId" UUID NOT NULL,
    "Content" TEXT NOT NULL,
    "IsRead" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ModerationQueue" (
    "Id" UUID NOT NULL,
    "ContentType" VARCHAR(50) NOT NULL,
    "ContentId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Status" VARCHAR(20) DEFAULT 'pending',
    "Priority" VARCHAR(20) DEFAULT 'normal',
    "AutoFlagged" BOOLEAN DEFAULT false,
    "FlagReason" TEXT,
    "ReviewedBy" UUID,
    "ReviewedAt" TIMESTAMPTZ(6),
    "ReviewNotes" TEXT,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationQueue_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Title" VARCHAR(200),
    "Content" TEXT,
    "RelatedId" UUID,
    "RelatedType" VARCHAR(50),
    "IsRead" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "Id" UUID NOT NULL,
    "OrderId" UUID NOT NULL,
    "ProductId" UUID,
    "ProductName" VARCHAR(200),
    "Quantity" INTEGER DEFAULT 1,
    "UnitPrice" DECIMAL(10,2) NOT NULL,
    "TotalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Photos" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "ImageUrl" VARCHAR(500) NOT NULL,
    "Caption" TEXT,
    "GameId" UUID,
    "LikesCount" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photos_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "PostLikes" (
    "Id" UUID NOT NULL,
    "PostId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLikes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "PostMedia" (
    "Id" UUID NOT NULL,
    "PostId" UUID NOT NULL,
    "MediaUrl" VARCHAR(500) NOT NULL,
    "MediaType" VARCHAR(20),
    "OrderIndex" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "GroupId" UUID,
    "Content" TEXT,
    "PostType" VARCHAR(20) DEFAULT 'text',
    "VideoUrl" VARCHAR(500),
    "LikesCount" INTEGER DEFAULT 0,
    "CommentsCount" INTEGER DEFAULT 0,
    "SharesCount" INTEGER DEFAULT 0,
    "IsPinned" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ShoppingCart" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "ProductId" UUID NOT NULL,
    "Quantity" INTEGER DEFAULT 1,
    "AddedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingCart_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "StoreOrders" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "ProductId" UUID,
    "Quantity" INTEGER DEFAULT 1,
    "TotalAmount" DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(20) DEFAULT 'pending',
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreOrders_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "StoreProducts" (
    "Id" UUID NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "CoverImageUrl" VARCHAR(500),
    "Price" DECIMAL(10,2) NOT NULL,
    "Category" VARCHAR(50),
    "GameId" UUID,
    "Rating" DECIMAL(3,2) DEFAULT 0,
    "ReviewsCount" INTEGER DEFAULT 0,
    "Status" VARCHAR(20) DEFAULT 'online',
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreProducts_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserActivityLog" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "ActivityType" VARCHAR(50) NOT NULL,
    "RelatedId" UUID,
    "RelatedType" VARCHAR(50),
    "Metadata" TEXT,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityLog_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserBadges" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "BadgeName" VARCHAR(50) NOT NULL,
    "BadgeType" VARCHAR(20),
    "IconUrl" VARCHAR(500),
    "AwardedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadges_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserBans" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "BannedBy" UUID NOT NULL,
    "BanType" VARCHAR(20),
    "Reason" TEXT NOT NULL,
    "StartDate" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "EndDate" TIMESTAMPTZ(6),
    "IsActive" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBans_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserGameLibrary" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "GameId" UUID NOT NULL,
    "IsInstalled" BOOLEAN DEFAULT false,
    "InstallPath" VARCHAR(500),
    "LastPlayed" TIMESTAMPTZ(6),
    "TotalPlayTime" INTEGER DEFAULT 0,
    "IsFavorite" BOOLEAN DEFAULT false,
    "AddedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGameLibrary_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Theme" VARCHAR(20) DEFAULT 'light',
    "Language" VARCHAR(10) DEFAULT 'en',
    "EmailNotifications" BOOLEAN DEFAULT true,
    "PushNotifications" BOOLEAN DEFAULT true,
    "PrivacyLevel" VARCHAR(20) DEFAULT 'public',
    "ShowOnlineStatus" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Users" (
    "Id" UUID NOT NULL,
    "Username" VARCHAR(50) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "FullName" VARCHAR(100),
    "AvatarUrl" VARCHAR(500),
    "CoverImageUrl" VARCHAR(500),
    "Bio" TEXT,
    "Location" VARCHAR(100),
    "Status" VARCHAR(20) DEFAULT 'offline',
    "Role" VARCHAR(20) DEFAULT 'user',
    "IsVerified" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "FriendsCount" INTEGER DEFAULT 0,
    "WinningCount" INTEGER DEFAULT 0,
    "TournamentsCount" INTEGER DEFAULT 0,
    "PostsCount" INTEGER DEFAULT 0,
    "PhotosCount" INTEGER DEFAULT 0,
    "VideosCount" INTEGER DEFAULT 0,
    "GroupsCount" INTEGER DEFAULT 0,
    "TotalPoints" INTEGER DEFAULT 0,
    "Level" INTEGER DEFAULT 1,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "VideoComments" (
    "Id" UUID NOT NULL,
    "VideoId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Content" TEXT NOT NULL,
    "LikesCount" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoComments_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "VideoLikes" (
    "Id" UUID NOT NULL,
    "VideoId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoLikes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Videos" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "GameId" UUID,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "VideoUrl" VARCHAR(500) NOT NULL,
    "ThumbnailUrl" VARCHAR(500),
    "Duration" INTEGER,
    "ViewsCount" INTEGER DEFAULT 0,
    "LikesCount" INTEGER DEFAULT 0,
    "CommentsCount" INTEGER DEFAULT 0,
    "Category" VARCHAR(50),
    "IsPublic" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Videos_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLogs_Action_idx" ON "AdminAuditLogs"("Action");

-- CreateIndex
CREATE INDEX "AdminAuditLogs_AdminUserId_idx" ON "AdminAuditLogs"("AdminUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLogs_CreatedAt_idx" ON "AdminAuditLogs"("CreatedAt");

-- CreateIndex
CREATE INDEX "AdminAuditLogs_TargetType_idx" ON "AdminAuditLogs"("TargetType");

-- CreateIndex
CREATE INDEX "Announcements_IsActive_idx" ON "Announcements"("IsActive");

-- CreateIndex
CREATE INDEX "Announcements_StartDate_idx" ON "Announcements"("StartDate");

-- CreateIndex
CREATE INDEX "Announcements_Type_idx" ON "Announcements"("Type");

-- CreateIndex
CREATE INDEX "Comments_PostId_idx" ON "Comments"("PostId");

-- CreateIndex
CREATE INDEX "Comments_UserId_idx" ON "Comments"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStatistics_StatDate_key" ON "DailyStatistics"("StatDate");

-- CreateIndex
CREATE INDEX "DailyStatistics_StatDate_idx" ON "DailyStatistics"("StatDate");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplates_TemplateName_key" ON "EmailTemplates"("TemplateName");

-- CreateIndex
CREATE INDEX "EmailTemplates_Category_idx" ON "EmailTemplates"("Category");

-- CreateIndex
CREATE INDEX "EmailTemplates_IsActive_idx" ON "EmailTemplates"("IsActive");

-- CreateIndex
CREATE INDEX "FeaturedContent_ContentType_idx" ON "FeaturedContent"("ContentType");

-- CreateIndex
CREATE INDEX "FeaturedContent_DisplayOrder_idx" ON "FeaturedContent"("DisplayOrder");

-- CreateIndex
CREATE INDEX "FeaturedContent_IsActive_idx" ON "FeaturedContent"("IsActive");

-- CreateIndex
CREATE INDEX "Friendships_FriendId_idx" ON "Friendships"("FriendId");

-- CreateIndex
CREATE INDEX "Friendships_Status_idx" ON "Friendships"("Status");

-- CreateIndex
CREATE INDEX "Friendships_UserId_idx" ON "Friendships"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendships_UserId_FriendId_key" ON "Friendships"("UserId", "FriendId");

-- CreateIndex
CREATE INDEX "FriendSuggestions_Score_idx" ON "FriendSuggestions"("Score");

-- CreateIndex
CREATE INDEX "FriendSuggestions_UserId_idx" ON "FriendSuggestions"("UserId");

-- CreateIndex
CREATE INDEX "GameLaunchLogs_GameId_idx" ON "GameLaunchLogs"("GameId");

-- CreateIndex
CREATE INDEX "GameLaunchLogs_LaunchedAt_idx" ON "GameLaunchLogs"("LaunchedAt");

-- CreateIndex
CREATE INDEX "GameLaunchLogs_UserId_idx" ON "GameLaunchLogs"("UserId");

-- CreateIndex
CREATE INDEX "GameReviews_GameId_idx" ON "GameReviews"("GameId");

-- CreateIndex
CREATE INDEX "GameReviews_UserId_idx" ON "GameReviews"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "GameReviews_GameId_UserId_key" ON "GameReviews"("GameId", "UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Games_Slug_key" ON "Games"("Slug");

-- CreateIndex
CREATE INDEX "GroupMembers_GroupId_idx" ON "GroupMembers"("GroupId");

-- CreateIndex
CREATE INDEX "GroupMembers_UserId_idx" ON "GroupMembers"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembers_GroupId_UserId_key" ON "GroupMembers"("GroupId", "UserId");

-- CreateIndex
CREATE INDEX "Messages_ReceiverId_IsRead_idx" ON "Messages"("ReceiverId", "IsRead");

-- CreateIndex
CREATE INDEX "Messages_SenderId_idx" ON "Messages"("SenderId");

-- CreateIndex
CREATE INDEX "ModerationQueue_CreatedAt_idx" ON "ModerationQueue"("CreatedAt");

-- CreateIndex
CREATE INDEX "ModerationQueue_Priority_idx" ON "ModerationQueue"("Priority");

-- CreateIndex
CREATE INDEX "ModerationQueue_Status_idx" ON "ModerationQueue"("Status");

-- CreateIndex
CREATE INDEX "Notifications_CreatedAt_idx" ON "Notifications"("CreatedAt");

-- CreateIndex
CREATE INDEX "Notifications_UserId_IsRead_idx" ON "Notifications"("UserId", "IsRead");

-- CreateIndex
CREATE UNIQUE INDEX "PostLikes_PostId_UserId_key" ON "PostLikes"("PostId", "UserId");

-- CreateIndex
CREATE INDEX "Posts_CreatedAt_idx" ON "Posts"("CreatedAt");

-- CreateIndex
CREATE INDEX "Posts_GroupId_idx" ON "Posts"("GroupId");

-- CreateIndex
CREATE INDEX "Posts_PostType_idx" ON "Posts"("PostType");

-- CreateIndex
CREATE INDEX "Posts_UserId_idx" ON "Posts"("UserId");

-- CreateIndex
CREATE INDEX "ShoppingCart_ProductId_idx" ON "ShoppingCart"("ProductId");

-- CreateIndex
CREATE INDEX "ShoppingCart_UserId_idx" ON "ShoppingCart"("UserId");

-- CreateIndex
CREATE INDEX "UserActivityLog_ActivityType_idx" ON "UserActivityLog"("ActivityType");

-- CreateIndex
CREATE INDEX "UserActivityLog_CreatedAt_idx" ON "UserActivityLog"("CreatedAt");

-- CreateIndex
CREATE INDEX "UserActivityLog_UserId_idx" ON "UserActivityLog"("UserId");

-- CreateIndex
CREATE INDEX "UserBans_EndDate_idx" ON "UserBans"("EndDate");

-- CreateIndex
CREATE INDEX "UserBans_IsActive_idx" ON "UserBans"("IsActive");

-- CreateIndex
CREATE INDEX "UserBans_UserId_idx" ON "UserBans"("UserId");

-- CreateIndex
CREATE INDEX "UserGameLibrary_GameId_idx" ON "UserGameLibrary"("GameId");

-- CreateIndex
CREATE INDEX "UserGameLibrary_LastPlayed_idx" ON "UserGameLibrary"("LastPlayed");

-- CreateIndex
CREATE INDEX "UserGameLibrary_UserId_idx" ON "UserGameLibrary"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameLibrary_UserId_GameId_key" ON "UserGameLibrary"("UserId", "GameId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_UserId_key" ON "UserPreferences"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Username_key" ON "Users"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE INDEX "Users_Email_idx" ON "Users"("Email");

-- CreateIndex
CREATE INDEX "Users_Status_idx" ON "Users"("Status");

-- CreateIndex
CREATE INDEX "Users_Username_idx" ON "Users"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_UserId_key" ON "UserStats"("UserId");

-- CreateIndex
CREATE INDEX "VideoComments_VideoId_idx" ON "VideoComments"("VideoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoLikes_VideoId_UserId_key" ON "VideoLikes"("VideoId", "UserId");

-- CreateIndex
CREATE INDEX "Videos_Category_idx" ON "Videos"("Category");

-- CreateIndex
CREATE INDEX "Videos_CreatedAt_idx" ON "Videos"("CreatedAt");

-- CreateIndex
CREATE INDEX "Videos_GameId_idx" ON "Videos"("GameId");

-- CreateIndex
CREATE INDEX "Videos_UserId_idx" ON "Videos"("UserId");

-- AddForeignKey
ALTER TABLE "AdminAuditLogs" ADD CONSTRAINT "AdminAuditLogs_AdminUserId_fkey" FOREIGN KEY ("AdminUserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_ParentCommentId_fkey" FOREIGN KEY ("ParentCommentId") REFERENCES "Comments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "Posts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplates" ADD CONSTRAINT "EmailTemplates_UpdatedBy_fkey" FOREIGN KEY ("UpdatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedContent" ADD CONSTRAINT "FeaturedContent_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendships" ADD CONSTRAINT "Friendships_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendships" ADD CONSTRAINT "Friendships_FriendId_fkey" FOREIGN KEY ("FriendId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendSuggestions" ADD CONSTRAINT "FriendSuggestions_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendSuggestions" ADD CONSTRAINT "FriendSuggestions_SuggestedUserId_fkey" FOREIGN KEY ("SuggestedUserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLaunchLogs" ADD CONSTRAINT "GameLaunchLogs_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES "Games"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLaunchLogs" ADD CONSTRAINT "GameLaunchLogs_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameReviews" ADD CONSTRAINT "GameReviews_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES "Games"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameReviews" ADD CONSTRAINT "GameReviews_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Groups"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_SenderId_fkey" FOREIGN KEY ("SenderId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_ReceiverId_fkey" FOREIGN KEY ("ReceiverId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationQueue" ADD CONSTRAINT "ModerationQueue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationQueue" ADD CONSTRAINT "ModerationQueue_ReviewedBy_fkey" FOREIGN KEY ("ReviewedBy") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "StoreOrders"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "StoreProducts"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES "Games"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "Posts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "Posts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Groups"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "StoreProducts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreOrders" ADD CONSTRAINT "StoreOrders_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "StoreProducts"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreOrders" ADD CONSTRAINT "StoreOrders_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProducts" ADD CONSTRAINT "StoreProducts_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES "Games"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityLog" ADD CONSTRAINT "UserActivityLog_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadges" ADD CONSTRAINT "UserBadges_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBans" ADD CONSTRAINT "UserBans_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBans" ADD CONSTRAINT "UserBans_BannedBy_fkey" FOREIGN KEY ("BannedBy") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameLibrary" ADD CONSTRAINT "UserGameLibrary_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES "Games"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameLibrary" ADD CONSTRAINT "UserGameLibrary_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoComments" ADD CONSTRAINT "VideoComments_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoComments" ADD CONSTRAINT "VideoComments_VideoId_fkey" FOREIGN KEY ("VideoId") REFERENCES "Videos"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLikes" ADD CONSTRAINT "VideoLikes_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLikes" ADD CONSTRAINT "VideoLikes_VideoId_fkey" FOREIGN KEY ("VideoId") REFERENCES "Videos"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Videos" ADD CONSTRAINT "Videos_GameId_fkey" FOREIGN KEY ("GameId") REFERENCES "Games"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Videos" ADD CONSTRAINT "Videos_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
