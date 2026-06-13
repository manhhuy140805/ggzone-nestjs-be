# GGZone Backend - Tài liệu chuyển đổi sang NestJS và PostgreSQL

Tài liệu này mô tả cách chuyển backend hiện tại từ ASP.NET Core 8 + Entity Framework Core + SQL Server sang NestJS + PostgreSQL, trong khi giữ nguyên contract còn lại: route, payload, response shape, JWT claim, Cloudinary upload, phân quyền, pagination và business behavior đang được frontend sử dụng.

Nguồn rà soát hiện tại:

- `Program.cs`: cấu hình DB, JWT, CORS, Swagger, DI.
- `Controllers/*`: toàn bộ endpoint đang public.
- `Models/*`, `Data/AppDbContext.cs`: entity, quan hệ, unique index, composite key.
- `Services/*`: Cloudinary, Email, Cache, Notification, Logger, User auth.
- `obj/Debug/net8.0/EndpointInfo/ggzone-be.json`: OpenAPI snapshot hiện tại.

## 1. Mục tiêu giữ nguyên

Khi chuyển sang NestJS, cần giữ các điểm sau để frontend chạy tiếp nhanh nhất:

- Giữ nguyên path API, bao gồm casing hiện tại như `/api/User`, `/api/Admin`, `/api/Notification`, `/api/posts`, `/api/groups`, `/api/games`, `/api/auth`.
- Giữ nguyên HTTP method, path params, query params và default query values.
- Giữ nguyên JWT Bearer auth với claim: `id`, `username`, `email`, `role`.
- Giữ token hết hạn sau 7 ngày.
- Giữ bcrypt password hash hiện tại để user cũ vẫn login được.
- Giữ response camelCase. Một số endpoint trả `ApiResponse`, một số trả object/list trực tiếp; không tự chuẩn hóa đồng loạt nếu frontend đang phụ thuộc response cũ.
- Giữ behavior hiện tại: tạo user stats sau register, tăng view count video khi xem detail, tạo notification khi comment/message, cập nhật comment count, like/unlike post.
- Giữ Cloudinary cho upload ảnh/video.
- Chuyển database sang PostgreSQL, nhưng giữ entity, quan hệ và dữ liệu tương đương.

## 2. Stack NestJS đề xuất

Khuyến nghị dùng NestJS + Prisma vì migration schema, type safety và PostgreSQL làm nhanh hơn. Nếu muốn gần EF Repository hơn có thể dùng TypeORM, nhưng Prisma thường ít lỗi hơn khi dựng schema lớn.

Package chính:

- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- `@nestjs/config`
- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- `bcrypt`
- `class-validator`, `class-transformer`
- `@nestjs/swagger`
- `prisma`, `@prisma/client`
- `cloudinary`, `multer`
- `cache-manager`, `@nestjs/cache-manager` nếu muốn thay `IMemoryCache`
- `nodemailer` nếu bật lại email service

Cấu trúc module đề xuất:

```text
src/
  app.module.ts
  main.ts
  prisma/
    prisma.module.ts
    prisma.service.ts
  common/
    decorators/current-user.decorator.ts
    filters/http-exception.filter.ts
    guards/jwt-auth.guard.ts
    guards/roles.guard.ts
    interceptors/response.interceptor.ts
    types/jwt-user.type.ts
  auth/
  users/
  posts/
  comments/
  uploads/
  games/
  groups/
  friendships/
  messages/
  notifications/
  photos/
  videos/
  tournaments/
  store/
  orders/
  shopping-cart/
  search/
  trending/
  statistics/
  badges/
  activity/
  admin/
```

Lưu ý route: có thể dùng `app.setGlobalPrefix('api')`, sau đó khai báo controller như `@Controller('User')`, `@Controller('Admin')`, `@Controller('posts')`, `@Controller('groups')`. Nếu dùng Fastify, cần kiểm tra case sensitivity của route. Để tương thích nhất, dùng Express adapter mặc định của NestJS trong giai đoạn đầu.

## 3. Biến môi trường và dịch vụ ngoài

Không hard-code secret trong repo. Tạo `.env` cho NestJS:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/ggzone?schema=public

JWT_SECRET=...
JWT_ISSUER=GGZone
JWT_AUDIENCE=GGZoneUsers
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ggzone.com

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Cloudinary

Đang dùng thật qua `CloudinaryService` và `UploadController`.

- Config hiện tại: `Cloudinary:CloudName`, `Cloudinary:ApiKey`, `Cloudinary:ApiSecret`.
- Upload ảnh: folder mặc định `ggzone`, quality `auto`.
- Upload video: folder mặc định `ggzone/videos`, quality `auto`, fetch format `mp4`.
- Thumbnail video: lấy frame khoảng giây thứ 2, kích thước `320x180`, crop `fill`, quality `auto`.
- API cần giữ:
  - `POST /api/upload/image`, multipart field `file`, query `folder=ggzone`, auth required.
  - `POST /api/upload/video`, multipart field `file`, query `folder=ggzone/videos`, auth required.
  - `POST /api/upload/test`, multipart field `file`, không auth.

Validation upload hiện tại:

- Image extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`.
- Image max size: `5MB`.
- Video extensions: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`.
- Video max size: `500MB`.

### Email SMTP

`EmailService` đã có nhưng hiện chưa được register trong `Program.cs` và chưa thấy endpoint gọi trực tiếp. Khi chuyển sang NestJS, vẫn nên port thành `EmailModule` nhưng để optional.

- SMTP host default: `smtp.gmail.com`.
- SMTP port default: `587`.
- SSL enabled.
- Các hàm đang có: send raw email, welcome email, password reset email, notification email.

### Cache

`CacheService` dùng `IMemoryCache`, default expiration 30 phút, nhưng hiện chưa được register trong `Program.cs`. NestJS có thể dùng `CacheModule` in-memory trước, Redis sau nếu cần scale.

### Logging

Hiện dùng console logging và `LoggerService`. NestJS có thể dùng `Logger` mặc định, sau đó nâng cấp Winston/Pino nếu cần.

### Swagger

Hiện Swagger chỉ bật trong development. NestJS cần bật `SwaggerModule` trong `NODE_ENV=development` và giữ Bearer security scheme.

### CORS

Hiện ASP.NET cho mọi origin nhưng `AllowCredentials`. Khi chuyển NestJS:

- Giai đoạn tương thích nhanh: `origin: true`, `credentials: true`.
- Giai đoạn production: đọc allowlist từ `CORS_ORIGINS`.

## 4. Auth và phân quyền

### Register

`POST /api/auth/register`

Input:

```json
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "secret",
  "fullName": "Player One",
  "role": "user"
}
```

Behavior cần giữ:

- Check email tồn tại.
- Check username tồn tại.
- Password không rỗng và tối đa 72 ký tự vì BCrypt.
- Hash bằng BCrypt.
- Role mặc định `user`, cho phép nhận role từ request như code hiện tại.
- Tạo thêm `UserStats` mặc định sau khi tạo user.
- Response hiện tại chỉ trả `id`, `username`, `email`.

### Login

`POST /api/auth/login`

Input:

```json
{
  "email": "player1@example.com",
  "password": "secret"
}
```

Behavior cần giữ:

- Tìm user bằng email.
- Verify bằng BCrypt.
- Trả `401` với message `Email hoặc mật khẩu không đúng!` nếu sai.
- Response thành công:

```json
{
  "token": "JWT"
}
```

JWT payload cần giữ:

```json
{
  "id": "uuid",
  "username": "player1",
  "email": "player1@example.com",
  "role": "user"
}
```

Token options:

- issuer: env `JWT_ISSUER`
- audience: env `JWT_AUDIENCE`
- secret: env `JWT_SECRET`
- expiresIn: `7d`

### Guards

- `JwtAuthGuard`: dùng cho endpoint có `[Authorize]`.
- `RolesGuard`: dùng cho `[Authorize(Roles = "admin")]`.
- Role claim hiện tại nằm ở claim `"role"`; đừng đổi sang `"roles"` nếu muốn giữ frontend/admin logic.

## 5. PostgreSQL schema

### Mapping type

| C# / SQL Server | PostgreSQL | Ghi chú |
|---|---|---|
| `Guid` | `uuid` | default `gen_random_uuid()` |
| `DateTime` | `timestamptz` | ưu tiên UTC, response ISO string |
| `string` short | `varchar(n)` | dùng theo `[MaxLength]` nếu có |
| `string` long | `text` | content, bio, html body, JSON string |
| `int` | `integer` | counters, score, rank |
| `long` | `bigint` | install size |
| `decimal` | `numeric(18,2)` hoặc `numeric(10,2)` | tiền, rating, score |
| `bool` | `boolean` | default theo model |

Cần bật extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Table/entity cần tạo

Giữ tên bảng tương thích với model hiện tại. Với Prisma nên dùng `@@map("Users")`, `@@map("PostMedia")`, v.v. nếu muốn DB giữ tên PascalCase như hiện tại.

| Entity | Scalar fields chính |
|---|---|
| `User` | `id`, `username`, `email`, `passwordHash`, `fullName`, `avatarUrl`, `coverImageUrl`, `bio`, `location`, `status`, `role`, `isVerified`, `createdAt`, `updatedAt` |
| `UserStats` | `id`, `userId`, `friendsCount`, `winningCount`, `tournamentsCount`, `postsCount`, `photosCount`, `videosCount`, `groupsCount`, `totalPoints`, `level` |
| `Friendship` | `id`, `userId`, `friendId`, `status`, `createdAt` |
| `Group` | `id`, `name`, `description`, `coverImageUrl`, `iconUrl`, `visibility`, `membersCount`, `createdBy`, `createdAt`, `updatedAt` |
| `GroupMember` | `id`, `groupId`, `userId`, `role`, `joinedAt` |
| `Post` | `id`, `userId`, `groupId`, `content`, `postType`, `videoUrl`, `likesCount`, `commentsCount`, `sharesCount`, `isPinned`, `createdAt`, `updatedAt` |
| `PostMedia` | `id`, `postId`, `mediaUrl`, `mediaType`, `orderIndex`, `createdAt` |
| `PostLike` | `id`, `postId`, `userId`, `createdAt` |
| `Comment` | `id`, `postId`, `userId`, `parentCommentId`, `content`, `likesCount`, `createdAt`, `updatedAt` |
| `Photo` | `id`, `userId`, `imageUrl`, `caption`, `gameId`, `likesCount`, `createdAt` |
| `Game` | `id`, `name`, `slug`, `description`, `coverImageUrl`, `iconUrl`, `genre`, `platform`, `releaseDate`, `publisher`, `isActive`, `gameType`, `launchUrl`, `downloadUrl`, `webPlayUrl`, `installSize`, `minimumRequirements`, `recommendedRequirements`, `launcherType`, `createdAt` |
| `Tournament` | `id`, `gameId`, `name`, `description`, `coverImageUrl`, `startDate`, `endDate`, `maxParticipants`, `currentParticipants`, `prizePool`, `status`, `createdBy`, `createdAt` |
| `TournamentParticipant` | `id`, `tournamentId`, `userId`, `rank`, `score`, `joinedAt` |
| `StoreProduct` | `id`, `name`, `description`, `coverImageUrl`, `price`, `category`, `gameId`, `rating`, `reviewsCount`, `status`, `createdAt` |
| `StoreOrder` | `id`, `userId`, `productId`, `quantity`, `totalAmount`, `status`, `createdAt` |
| `OrderItem` | `id`, `orderId`, `productId`, `productName`, `quantity`, `unitPrice`, `totalPrice` |
| `ShoppingCart` | `id`, `userId`, `productId`, `quantity`, `addedAt` |
| `Message` | `id`, `senderId`, `receiverId`, `content`, `isRead`, `createdAt` |
| `Notification` | `id`, `userId`, `type`, `title`, `content`, `relatedId`, `relatedEntityId`, `relatedType`, `relatedEntityType`, `isRead`, `createdAt` |
| `Video` | `id`, `userId`, `gameId`, `title`, `description`, `videoUrl`, `thumbnailUrl`, `duration`, `viewsCount`, `likesCount`, `commentsCount`, `category`, `isPublic`, `createdAt`, `updatedAt` |
| `VideoComment` | `id`, `videoId`, `userId`, `content`, `likesCount`, `createdAt` |
| `VideoLike` | `id`, `videoId`, `userId`, `createdAt` |
| `GameReview` | `id`, `gameId`, `userId`, `rating`, `title`, `content`, `hoursPlayed`, `isRecommended`, `helpfulCount`, `createdAt`, `updatedAt` |
| `UserGameLibrary` | `id`, `userId`, `gameId`, `isInstalled`, `installPath`, `lastPlayed`, `totalPlayTime`, `isFavorite`, `addedAt` |
| `GameLaunchLog` | `id`, `userId`, `gameId`, `launchMethod`, `launchedAt`, `sessionDuration`, `endedAt` |
| `TrendingItem` | `id`, `contentType`, `contentId`, `gameId`, `viewsCount`, `engagementScore`, `trendingDate`, `createdAt` |
| `TrendingPlayer` | `id`, `userId`, `gameId`, `rank`, `score`, `winRate`, `totalMatches`, `trendingDate`, `createdAt` |
| `UserPreference` | `id`, `userId`, `theme`, `language`, `emailNotifications`, `pushNotifications`, `privacyLevel`, `showOnlineStatus`, `createdAt`, `updatedAt` |
| `UserBadge` | `id`, `userId`, `badgeName`, `badgeType`, `iconUrl`, `awardedAt` |
| `FriendSuggestion` | `id`, `userId`, `suggestedUserId`, `reason`, `score`, `isShown`, `createdAt` |
| `UserActivityLog` | `id`, `userId`, `activityType`, `relatedId`, `relatedType`, `metadata`, `createdAt` |
| `UserBan` | `id`, `userId`, `bannedBy`, `banType`, `reason`, `startDate`, `endDate`, `isActive`, `createdAt` |
| `ModerationQueue` | `id`, `contentType`, `contentId`, `userId`, `status`, `priority`, `autoFlagged`, `flagReason`, `reviewedBy`, `reviewedAt`, `reviewNotes`, `createdAt` |
| `DailyStatistic` | `id`, `statDate`, `newUsers`, `activeUsers`, `totalPosts`, `totalComments`, `totalVideos`, `totalGameLaunches`, `totalRevenue`, `totalOrders`, `createdAt` |
| `FeaturedContent` | `id`, `contentType`, `contentId`, `title`, `description`, `imageUrl`, `displayOrder`, `startDate`, `endDate`, `isActive`, `createdBy`, `createdAt` |
| `Announcement` | `id`, `title`, `content`, `type`, `priority`, `targetAudience`, `isActive`, `startDate`, `endDate`, `createdBy`, `createdAt` |
| `EmailTemplate` | `id`, `templateName`, `subject`, `htmlBody`, `textBody`, `category`, `variables`, `isActive`, `updatedBy`, `updatedAt`, `createdAt` |
| `AdminAuditLog` | `id`, `adminUserId`, `action`, `targetType`, `targetId`, `oldValue`, `newValue`, `ipAddress`, `userAgent`, `reason`, `createdAt` |

### Quan hệ và constraints quan trọng

- `User` 1-1 `UserStats` qua `UserStats.userId`.
- `User` 1-1 `UserPreference` qua `UserPreference.userId`.
- `Friendship.userId` và `Friendship.friendId` đều FK tới `User`.
- `Message.senderId` và `Message.receiverId` đều FK tới `User`.
- `Group.createdBy` FK tới `User`.
- `GroupMember` nhiều-nhiều giữa `Group` và `User`.
- `TournamentParticipant` nhiều-nhiều giữa `Tournament` và `User`.
- `Post.userId` FK `User`, `Post.groupId` nullable FK `Group`.
- `PostMedia`, `PostLike`, `Comment` FK tới `Post`.
- `Photo.userId` FK `User`, `Photo.gameId` nullable FK `Game`.
- `StoreProduct.gameId` nullable FK `Game`.
- `StoreOrder.userId` FK `User`; `OrderItem.orderId` FK `StoreOrder`.
- `ShoppingCart.userId` FK `User`, `ShoppingCart.productId` FK `StoreProduct`.
- `Video.userId` FK `User`, `Video.gameId` nullable FK `Game`; `VideoComment` và `VideoLike` FK tới `Video`.
- `DailyStatistic.statDate` unique.
- `EmailTemplate.templateName` unique.
- `UserPreference.userId` unique.
- Nên thêm unique DB-level cho `User.email` và `User.username` dù code hiện chỉ check ở service.
- Nên thêm unique cho `PostLike(postId, userId)` và `VideoLike(videoId, userId)` để chống double-like race condition.
- Nên thêm unique cho `Friendship(userId, friendId)` hoặc normalize cặp bạn bè để tránh duplicate đảo chiều.

Composite key đặc biệt:

- EF hiện đặt primary key của `GroupMember` là `(groupId, userId)` nhưng model vẫn có `id`. Trong PostgreSQL nên giữ `id uuid default gen_random_uuid()` và đặt unique cho `id`, còn primary key là `(group_id, user_id)` hoặc dùng `@@id([groupId, userId])` trong Prisma.
- EF hiện đặt primary key của `TournamentParticipant` là `(tournamentId, userId)` nhưng model vẫn có `id`. Làm tương tự `GroupMember`.

### Trigger/counter

Code hiện có comment về SQL Server triggers:

- Trigger cập nhật `Groups.membersCount` khi insert/delete `GroupMember`.
- Trigger cập nhật `Posts.likesCount` khi insert/delete `PostLike`.
- Có workaround `UseSqlOutputClause(false)` cho `Post`, `PostLike`, `PostMedia`, `Comment`, `GroupMember`.

Khi sang PostgreSQL có 2 lựa chọn:

1. Giữ trigger trong PostgreSQL để behavior giống DB cũ.
2. Bỏ trigger, cập nhật counter trong transaction ở service.

Khuyến nghị để migration nhanh: cập nhật counter trong NestJS transaction, vì Prisma transaction dễ kiểm soát và ít phụ thuộc DB trigger. Tuy nhiên cần giữ behavior endpoint:

- `POST /api/posts/{id}/like`: tạo `PostLike`, tăng hoặc đọc lại `likesCount`.
- `DELETE /api/posts/{id}/like`: xóa `PostLike`, giảm hoặc đọc lại `likesCount`.
- `POST /api/Comment`: tạo comment, tăng `Posts.commentsCount`, tạo notification cho chủ post.
- `DELETE /api/Comment/{id}`: xóa comment, giảm `Posts.commentsCount` nếu lớn hơn 0.
- `POST /api/groups/{id}/join`: tạo member, tăng `Groups.membersCount`.
- `DELETE /api/groups/{id}/leave`: xóa member, giảm `Groups.membersCount`.

## 6. Response format cần giữ

`ApiResponse<T>` hiện có dạng:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "errors": []
}
```

Một số endpoint dùng wrapper này:

- `UserController`
- Nhiều endpoint trong `PostController`
- `UploadController`

Một số endpoint trả object/list trực tiếp:

- `GameController`
- `GroupController`
- `StoreController`
- `OrderController`
- `MessageController`
- `NotificationController`
- `AdminController`

Khi port sang NestJS, đừng thêm global response wrapper cho toàn bộ app nếu chưa chỉnh frontend. Chỉ wrapper đúng endpoint cũ đã wrapper.

## 7. Body DTO chính

### Auth DTO

`RegisterDto`:

```ts
{
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}
```

`LoginDto`:

```ts
{
  email: string;
  password: string;
}
```

### User DTO

`UpdateProfileDto`:

```ts
{
  fullName?: string;      // max 100
  bio?: string;
  location?: string;      // max 100
  avatarUrl?: string;     // max 500
  coverImageUrl?: string; // max 500
}
```

`ChangePasswordDto`:

```ts
{
  currentPassword: string;
  newPassword: string; // min 6, max 72 nên giữ vì BCrypt
}
```

`UpdateStatusDto`:

```ts
{
  status: "online" | "offline" | "away" | "busy";
}
```

### Post DTO

`CreatePostDto`:

```ts
{
  content: string;
  groupId?: string;
  mediaUrls?: Array<{
    url: string;
    type?: string; // default "image"
  }>;
}
```

`UpdatePostDto`:

```ts
{
  content: string;
}
```

### Group DTO

`CreateGroupDto`:

```ts
{
  name: string;
  description?: string;
  coverImageUrl?: string;
  iconUrl?: string;
  visibility?: string; // default "public"
}
```

### Order DTO

`CreateOrderRequest`:

```ts
{
  userId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
```

`UpdateOrderStatusRequest`:

```ts
{
  status: string;
}
```

### Admin DTO

`ReviewRequest`:

```ts
{
  status: string;
  reviewerId: string;
}
```

`UpdateUserRequest`:

```ts
{
  email?: string;
  fullName?: string;
  role?: "user" | "moderator" | "admin";
}
```

`BanRequest`:

```ts
{
  reason: string;
  bannedBy: string;
  banType?: "temporary" | "permanent" | string;
  endDate?: string;
}
```

## 8. Endpoint chi tiết

Ký hiệu auth:

- `Public`: không cần token.
- `Auth`: cần Bearer JWT.
- `Admin`: cần Bearer JWT với role `admin`.
- `Body`: schema JSON hoặc multipart/form-data.

### Auth

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public | - | `RegisterDto` | Tạo user, hash password bằng BCrypt, tạo `UserStats`, trả user cơ bản. |
| POST | `/api/auth/login` | Public | - | `LoginDto` | Login bằng email/password, trả JWT `{ token }`. |

### User

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/User/me` | Auth | - | - | Lấy profile user hiện tại từ JWT claim `id`. |
| GET | `/api/User/{id}` | Public | `id` path | - | Lấy profile user theo id. |
| GET | `/api/User/username/{username}` | Public | `username` path | - | Lấy profile theo username. |
| GET | `/api/User` | Public | `page=1`, `pageSize=20` | - | Danh sách user phân trang. |
| GET | `/api/User/search` | Public | `q`, `page=1`, `pageSize=20` | - | Tìm user theo keyword, `q` bắt buộc. |
| PUT | `/api/User/profile` | Auth | - | `UpdateProfileDto` | Cập nhật profile của user trong JWT. |
| PUT | `/api/User/password` | Auth | - | `ChangePasswordDto` | Verify mật khẩu cũ, cập nhật BCrypt hash mới. |
| PUT | `/api/User/status` | Auth | - | `UpdateStatusDto` | Cập nhật status online/offline/away/busy. |
| DELETE | `/api/User` | Auth | - | - | Xóa tài khoản user hiện tại. |

### Upload

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| POST | `/api/upload/image` | Auth | `folder=ggzone` | `multipart/form-data file` | Upload ảnh lên Cloudinary, trả `{ url }` trong `ApiResponse`. |
| POST | `/api/upload/video` | Auth | `folder=ggzone/videos` | `multipart/form-data file` | Upload video lên Cloudinary, trả `videoUrl`, `thumbnailUrl`, `duration`. |
| POST | `/api/upload/test` | Public | - | `multipart/form-data file` | Upload test vào folder `ggzone-test`. |

### Post

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/posts/debug-user` | Auth | - | - | Debug JWT claims. |
| GET | `/api/posts/feed` | Auth | `page=1`, `pageSize=10`, `sortBy=latest`, `groupId?` | - | Feed post, có `isLiked` theo current user. |
| GET | `/api/posts/filter` | Public | `page=1`, `pageSize=10`, `groupId?`, `userId?`, `sortBy=latest` | - | Lọc post theo group/user. |
| GET | `/api/posts/search` | Public | `q`, `page=1`, `pageSize=10` | - | Tìm post theo content. |
| GET | `/api/posts/{id}` | Public | `id` path | - | Lấy post detail. |
| POST | `/api/posts` | Auth | - | `CreatePostDto` | Tạo post, tạo `PostMedia` nếu có media. |
| PUT | `/api/posts/{id}` | Auth | `id` path | `UpdatePostDto` | Chỉ chủ post được sửa content. |
| DELETE | `/api/posts/{id}` | Auth | `id` path | - | Chỉ chủ post được xóa. |
| POST | `/api/posts/{id}/like` | Auth | `id` path | - | Like post nếu chưa like, trả `{ likeCount }`. |
| DELETE | `/api/posts/{id}/like` | Auth | `id` path | - | Unlike post nếu đã like, trả `{ likeCount }`. |

### Comment

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Comment/post/{postId}` | Public | `postId`, `page=1`, `pageSize=20` | - | Lấy comment của post. |
| GET | `/api/Comment/{id}` | Public | `id` path | - | Lấy comment detail. |
| POST | `/api/Comment` | Auth | - | `Comment` | Tạo comment, tăng `Posts.commentsCount`, tạo notification cho chủ post. |
| PUT | `/api/Comment/{id}` | Auth | `id` path | `Comment` | Cập nhật content comment. |
| DELETE | `/api/Comment/{id}` | Auth | `id` path | - | Xóa comment, giảm `Posts.commentsCount`. |

### Game

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/games` | Public | - | - | Danh sách game active, sort theo name. |
| GET | `/api/games/{id}` | Public | `id` path | - | Lấy game theo id. |
| GET | `/api/games/slug/{slug}` | Public | `slug` path | - | Lấy game theo slug. |
| GET | `/api/games/trending` | Public | `limit=10` | - | Lấy game trending 7 ngày gần nhất từ `TrendingItems`. |
| GET | `/api/games/search` | Public | `q`, `page=1`, `pageSize=12` | - | Tìm game theo name/description/genre. |
| GET | `/api/games/filter` | Public | `genre?`, `platform?`, `page=1`, `pageSize=12` | - | Lọc game active. |
| GET | `/api/games/genres` | Public | - | - | Lấy danh sách genre distinct. |
| GET | `/api/games/platforms` | Public | - | - | Lấy danh sách platform distinct. |

### Group

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/groups` | Public | - | - | Danh sách group, sort theo membersCount. |
| GET | `/api/groups/{id}` | Public | `id` path | - | Detail group kèm members. |
| GET | `/api/groups/my-groups/{userId}` | Public | `userId` path | - | Group user đã tham gia. |
| GET | `/api/groups/{id}/posts` | Public | `id`, `page=1`, `pageSize=20` | - | Post trong group, pinned trước. |
| POST | `/api/groups` | Auth | - | `CreateGroupDto` | Tạo group và thêm creator làm admin. |
| POST | `/api/groups/{id}/join` | Auth | `id` path | - | Join group bằng current user. |
| DELETE | `/api/groups/{id}/leave` | Auth | `id` path | - | Leave group bằng current user. |
| POST | `/api/groups/fix-member-counts` | Admin | - | - | Recalculate `membersCount`. |

### Friendship

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Friendship/{userId}/friends` | Auth | `userId` path | - | Danh sách bạn bè accepted. |
| GET | `/api/Friendship/{userId}/requests` | Auth | `userId` path | - | Friend request nhận được. |
| GET | `/api/Friendship/{userId}/sent` | Auth | `userId` path | - | Friend request đã gửi. |
| POST | `/api/Friendship/send` | Auth | - | `Friendship` | Gửi friend request, status `pending`. |
| PUT | `/api/Friendship/{id}/accept` | Auth | `id` path | - | Accept request, status `accepted`. |
| PUT | `/api/Friendship/{id}/decline` | Auth | `id` path | - | Decline request, xóa record. |
| DELETE | `/api/Friendship/{id}` | Auth | `id` path | - | Remove friend. |
| GET | `/api/Friendship/{userId}/suggestions` | Auth | `userId` path | - | Suggestion chưa dismiss, top 10 theo score. |
| PUT | `/api/Friendship/suggestion/{id}/dismiss` | Auth | `id` path | - | Set `isShown=true`. |

### Message

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Message/{userId}/conversations` | Auth | `userId` path | - | Danh sách conversation, last message, unread count. |
| GET | `/api/Message/{userId}/with/{otherUserId}` | Auth | `userId`, `otherUserId`, `page=1`, `pageSize=50` | - | Lấy messages và mark unread từ `otherUserId` là read. |
| POST | `/api/Message` | Auth | - | `Message` | Gửi message, tạo notification cho receiver. |
| PUT | `/api/Message/{id}/read` | Auth | `id` path | - | Mark một message là read. |
| GET | `/api/Message/{userId}/unread-count` | Auth | `userId` path | - | Trả `{ count }`. |
| DELETE | `/api/Message/{id}` | Auth | `id` path | - | Xóa message. |

### Notification

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Notification/{userId}` | Auth | `userId`, `isRead?`, `page=1`, `pageSize=20` | - | Danh sách notification. |
| GET | `/api/Notification/{userId}/unread-count` | Auth | `userId` path | - | Trả `{ count }`. |
| PUT | `/api/Notification/{id}/read` | Auth | `id` path | - | Mark một notification là read. |
| PUT | `/api/Notification/{userId}/read-all` | Auth | `userId` path | - | Mark toàn bộ notification của user là read. |
| POST | `/api/Notification` | Auth | - | `Notification` | Tạo notification thủ công. |
| DELETE | `/api/Notification/{id}` | Auth | `id` path | - | Xóa notification. |
| DELETE | `/api/Notification/{userId}/clear` | Auth | `userId` path | - | Xóa toàn bộ notification của user. |

### Photo

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Photo/{userId}` | Auth | `userId`, `page=1`, `pageSize=20` | - | Danh sách ảnh của user. |
| GET | `/api/Photo/detail/{id}` | Auth | `id` path | - | Detail ảnh. |
| POST | `/api/Photo` | Auth | - | `Photo` | Tạo photo record sau khi đã upload ảnh. |
| PUT | `/api/Photo/{id}` | Auth | `id` path | `Photo` | Cập nhật caption. |
| DELETE | `/api/Photo/{id}` | Auth | `id` path | - | Xóa photo record. |

### Video

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Video` | Public | `page=1`, `pageSize=20`, `category?`, `gameId?` | - | Danh sách video public. |
| GET | `/api/Video/{id}` | Public | `id` path | - | Detail video và tăng `viewsCount`. |
| POST | `/api/Video` | Auth | - | `Video` | Tạo video record. |
| GET | `/api/Video/{id}/comments` | Public | `id` path | - | Comments của video. |
| POST | `/api/Video/{id}/comments` | Auth | `id` path | `VideoComment` | Thêm comment cho video. |
| POST | `/api/Video/{id}/like` | Auth | `id` path | `VideoLike` | Like video nếu chưa like. |
| DELETE | `/api/Video/{id}/like` | Auth | `id`, `userId` query | - | Unlike video. |

### Tournament

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Tournament` | Public | `status?`, `gameId?` | - | Danh sách tournament. |
| GET | `/api/Tournament/{id}` | Public | `id` path | - | Detail tournament. |
| POST | `/api/Tournament` | Auth | - | `Tournament` | Tạo tournament, `currentParticipants=0`. |
| PUT | `/api/Tournament/{id}` | Auth | `id` path | `Tournament` | Cập nhật thông tin tournament. |
| DELETE | `/api/Tournament/{id}` | Auth | `id` path | - | Xóa tournament. |
| GET | `/api/Tournament/{id}/participants` | Public | `id` path | - | Danh sách participant. |
| POST | `/api/Tournament/{id}/join` | Auth | `id` path | `TournamentParticipant` | Join nếu status `upcoming`, chưa full, chưa joined. |
| DELETE | `/api/Tournament/{id}/leave` | Auth | `id`, `userId` query | - | Leave nếu tournament chưa bắt đầu. |
| PUT | `/api/Tournament/{id}/status` | Auth | `id` path | raw string | Cập nhật status. |

### Store

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Store/products` | Public | `category?`, `search?`, `page=1`, `pageSize=20` | - | Danh sách product. |
| GET | `/api/Store/products/{id}` | Public | `id` path | - | Detail product. |
| POST | `/api/Store/products` | Auth | - | `StoreProduct` | Tạo product. |
| PUT | `/api/Store/products/{id}` | Auth | `id` path | `StoreProduct` | Cập nhật product. |
| DELETE | `/api/Store/products/{id}` | Auth | `id` path | - | Xóa product. |
| GET | `/api/Store/categories` | Public | - | - | Danh sách category distinct. |

### Shopping Cart

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/ShoppingCart/{userId}` | Auth | `userId` path | - | Giỏ hàng, total items, total amount. |
| POST | `/api/ShoppingCart` | Auth | - | `ShoppingCart` | Add to cart; nếu đã có product thì tăng quantity. |
| PUT | `/api/ShoppingCart/{id}` | Auth | `id` path | raw number | Cập nhật quantity. |
| DELETE | `/api/ShoppingCart/{id}` | Auth | `id` path | - | Xóa một item. |
| DELETE | `/api/ShoppingCart/user/{userId}` | Auth | `userId` path | - | Clear cart của user. |

### Order

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Order/{userId}` | Auth | `userId` path | - | Orders của user. |
| GET | `/api/Order/detail/{orderId}` | Auth | `orderId` path | - | Order detail kèm items. |
| POST | `/api/Order` | Auth | - | `CreateOrderRequest` | Tạo order pending và order items. |
| PUT | `/api/Order/{id}/status` | Auth | `id` path | raw string | Cập nhật status. |
| DELETE | `/api/Order/{id}` | Auth | `id` path | - | Cancel nếu status đang `pending`. |

### Badge

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Badge/{userId}` | Public | `userId` path | - | Badge của user. |
| GET | `/api/Badge/all` | Public | - | - | Badge distinct toàn hệ thống. |
| POST | `/api/Badge` | Auth | - | `UserBadge` | Award badge. |
| DELETE | `/api/Badge/{id}` | Auth | `id` path | - | Remove badge. |

### Activity

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Activity/{userId}` | Auth | `userId`, `page=1`, `pageSize=20` | - | Activity của user. |
| POST | `/api/Activity/log` | Auth | - | `UserActivityLog` | Ghi activity. |
| GET | `/api/Activity/{userId}/recent` | Auth | `userId`, `limit=10` | - | Activity gần đây. |
| GET | `/api/Activity/feed/{userId}` | Auth | `userId`, `page=1`, `pageSize=20` | - | Activity feed của user và friends. |

### Search

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Search` | Public | `q`, `type=all`, `limit=10` | - | Search users/games/groups/posts/videos. |

### Trending

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Trending/games` | Public | `limit=10` | - | Trending games 7 ngày gần nhất. |
| GET | `/api/Trending/players` | Public | `limit=10` | - | Trending players theo score. |
| GET | `/api/Trending/videos` | Public | `limit=10` | - | Trending videos 7 ngày gần nhất. |
| GET | `/api/Trending/posts` | Public | `limit=10` | - | Trending posts 7 ngày gần nhất. |

### Statistics

| Method | Endpoint | Auth | Params/Query | Body | Mô tả |
|---|---|---|---|---|---|
| GET | `/api/Statistics/dashboard` | Auth | - | - | Count users/games/groups/posts/videos/tournaments. |
| GET | `/api/Statistics/user/{userId}` | Auth | `userId` path | - | Count post/video/friend/group/tournament/badge/photo của user. |
| GET | `/api/Statistics/game/{gameId}` | Auth | `gameId` path | - | Count tournament/player/review và average rating. |
| GET | `/api/Statistics/daily` | Auth | `days=7` | - | Daily statistics từ `DailyStatistics`. |

### Admin

Tất cả endpoint dưới đây cần `Admin` guard.

| Method | Endpoint | Params/Query | Body | Mô tả |
|---|---|---|---|---|
| GET | `/api/Admin/statistics` | - | - | Tổng user/post/product/order, growth tháng, revenue, active users, pending moderation. |
| GET | `/api/Admin/daily-statistics` | `startDate?`, `endDate?` | - | Lấy tối đa 30 daily stats. |
| GET | `/api/Admin/monthly-revenue` | `year=0` | - | Revenue theo 12 tháng, đơn vị nghìn như code cũ. |
| GET | `/api/Admin/top-products` | `limit=4` | - | Top product theo revenue từ `OrderItems`. |
| GET | `/api/Admin/recent-activities` | `limit=5` | - | Recent orders dạng activity. |
| GET | `/api/Admin/quick-stats` | - | - | Page views/comment/conversion mock theo order/post tháng hiện tại. |
| GET | `/api/Admin/moderation-queue` | `status?` | - | Danh sách moderation queue. |
| PUT | `/api/Admin/moderation-queue/{id}/review` | `id` path | `ReviewRequest` | Cập nhật status, reviewer, reviewedAt. |
| GET | `/api/Admin/users` | `search?`, `page=1`, `pageSize=20` | - | Danh sách user admin, kèm `isBanned`. |
| PUT | `/api/Admin/users/{userId}` | `userId` path | `UpdateUserRequest` | Cập nhật email/fullName/role; role chỉ user/moderator/admin. |
| POST | `/api/Admin/users/{userId}/ban` | `userId` path | `BanRequest` | Tạo `UserBan`. |
| DELETE | `/api/Admin/users/{userId}/unban` | `userId` path | - | Xóa active ban. |
| GET | `/api/Admin/audit-logs` | `page=1`, `pageSize=50` | - | Audit logs. |
| POST | `/api/Admin/audit-log` | - | `AdminAuditLog` | Tạo audit log. |
| GET | `/api/Admin/announcements` | - | - | Danh sách announcement. |
| POST | `/api/Admin/announcements` | - | `Announcement` | Tạo announcement. |
| GET | `/api/Admin/featured-content` | - | - | Active featured content, sort display order. |
| POST | `/api/Admin/featured-content` | - | `FeaturedContent` | Tạo featured content. |
| DELETE | `/api/Admin/posts/{postId}` | `postId` path | - | Admin xóa post. |
| GET | `/api/Admin/orders` | `status?`, `page=1`, `pageSize=20` | - | Admin list orders. |
| GET | `/api/Admin/orders/{orderId}` | `orderId` path | - | Admin order detail kèm items. |
| PUT | `/api/Admin/orders/{orderId}/status` | `orderId` path | `UpdateOrderStatusRequest` | Cập nhật order status. |
| DELETE | `/api/Admin/groups/{groupId}` | `groupId` path | - | Admin xóa group. |

## 9. Thứ tự triển khai nhanh

1. Bootstrap NestJS project trong nhánh riêng.
2. Cấu hình `ConfigModule`, `PrismaModule`, Swagger, CORS, validation pipe.
3. Tạo Prisma schema từ model hiện tại, chạy migration lên PostgreSQL trống.
4. Port auth trước: register, login, JWT guard, roles guard.
5. Port users/profile để frontend login và `/api/User/me` chạy được.
6. Port Cloudinary upload để các URL media tạo mới chạy được.
7. Port posts/comments/groups vì feed thường là màn hình chính.
8. Port games/store/cart/order/tournament/video.
9. Port social modules: friendships, messages, notifications, activity, badges, photos.
10. Port admin/dashboard/statistics cuối cùng.
11. Chạy contract test bằng OpenAPI snapshot hoặc collection Postman.
12. Migrate data từ SQL Server sang PostgreSQL, kiểm tra count từng bảng.
13. Chạy frontend hiện tại trỏ sang NestJS API, sửa bug tương thích response nếu có.

## 10. Kiểm thử bắt buộc trước cutover

Checklist tối thiểu:

- Register user mới tạo đủ `Users` và `UserStats`.
- Login user cũ từ database migrate được bằng BCrypt hash hiện tại.
- JWT Bearer gọi được `/api/User/me`, `/api/posts/feed`.
- Role admin gọi được `/api/Admin/statistics`; user thường bị 403.
- Upload image/video trả URL Cloudinary hợp lệ.
- Tạo post có media, feed trả đúng media order.
- Like/unlike post không double-like và `likeCount` đúng.
- Comment post tăng/giảm `commentsCount`, tạo notification cho chủ post.
- Create group tự thêm creator làm admin member.
- Join/leave group cập nhật `membersCount`.
- Message gửi được và tạo notification.
- Video detail tăng `viewsCount`.
- Order tạo được `StoreOrder` và `OrderItems`.
- Admin users/orders/statistics trả đúng shape frontend đang dùng.

## 11. Rủi ro tương thích cần để ý

- Route casing lẫn lộn: `/api/User`, `/api/Admin`, `/api/Comment` nhưng `/api/auth`, `/api/posts`, `/api/groups`, `/api/games`, `/api/upload` là lowercase.
- Response không thống nhất wrapper. Không nên global wrap tất cả response.
- Một số endpoint truyền `userId` từ query/body thay vì lấy từ JWT, ví dụ tournament leave, video unlike, order create. Giữ trước, sau đó mới harden security nếu muốn.
- `StoreController` create/update/delete chỉ `[Authorize]`, chưa bắt role admin. Nếu giữ nguyên hoàn toàn thì không tự siết role.
- `PhotoController`, `ShoppingCartController`, `OrderController` có class-level auth nhưng vẫn nhận `userId` path/body. Cần giữ behavior trước.
- `GroupMember` đang trừ `membersCount - 1` ở response do trigger double-counting. Khi bỏ trigger hoặc sửa counter, phải kiểm tra lại frontend trước khi bỏ đoạn trừ này.
- `EmailService`, `CacheService`, `NotificationService` tồn tại nhưng chưa được register đầy đủ trong `Program.cs`; đừng coi là đang active toàn bộ.
- `PasswordHelper` PBKDF2 không dùng trong auth hiện tại; auth thật dùng BCrypt.
- `DateTime.Now` đang dùng local time trong nhiều controller. Khi sang PostgreSQL nên dùng UTC, nhưng nếu frontend hiển thị lệch ngày cần kiểm tra kỹ.

## 12. Gợi ý Prisma schema cho phần khó

Ví dụ composite key nhưng vẫn giữ `id`:

```prisma
model GroupMember {
  id       String   @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  groupId  String   @db.Uuid
  userId   String   @db.Uuid
  role     String   @default("member") @db.VarChar(20)
  joinedAt DateTime @default(now()) @db.Timestamptz

  group Group @relation(fields: [groupId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@id([groupId, userId])
  @@unique([id])
  @@map("GroupMembers")
}

model TournamentParticipant {
  id           String   @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tournamentId String  @db.Uuid
  userId       String  @db.Uuid
  rank         Int?
  score        Int     @default(0)
  joinedAt     DateTime @default(now()) @db.Timestamptz

  tournament Tournament @relation(fields: [tournamentId], references: [id])
  user       User       @relation(fields: [userId], references: [id])

  @@id([tournamentId, userId])
  @@unique([id])
  @@map("TournamentParticipants")
}
```

Ví dụ JWT user type:

```ts
export type JwtUser = {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | string;
};
```

Ví dụ response helper:

```ts
export const ok = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
  errors: [],
});

export const fail = (message: string, errors: string[] = []) => ({
  success: false,
  message,
  errors,
});
```

## 13. Definition of Done

Migration được coi là xong khi:

- Toàn bộ endpoint trong mục 8 trả được response với cùng method/path/body/query.
- Frontend hiện tại login, feed, profile, store, group, upload, admin dashboard chạy được mà không sửa contract lớn.
- PostgreSQL có đủ bảng, FK, unique index và counter behavior.
- User cũ login được bằng BCrypt hash đã migrate.
- Không có secret trong repo.
- Swagger NestJS có Bearer auth và route đầy đủ.
- Có ít nhất smoke test cho auth, user, upload, post, comment, group, store/order, admin.
