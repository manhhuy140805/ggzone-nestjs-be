export const userSummarySelect = {
  avatarUrl: true,
  email: true,
  fullName: true,
  id: true,
  isVerified: true,
  role: true,
  status: true,
  username: true,
};

export const postInclude = {
  group: true,
  likes: {
    select: {
      userId: true,
    },
  },
  media: {
    orderBy: {
      orderIndex: 'asc' as const,
    },
  },
  user: {
    select: userSummarySelect,
  },
};

export function withPostFlags<
  T extends { likes?: { userId: string }[]; likesCount?: number | null },
>(posts: T[], userId?: string) {
  return posts.map((post) => ({
    ...post,
    isLiked: userId
      ? Boolean(post.likes?.some((like) => like.userId === userId))
      : false,
    likeCount: post.likesCount ?? post.likes?.length ?? 0,
  }));
}
