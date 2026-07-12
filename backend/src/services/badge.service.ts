import prisma from "../lib/prisma";

interface UnlockRule {
  type: "xp_gte" | "challenges_gte" | "csr_gte";
  value: number;
}

/**
 * Evaluates all badge unlock rules for a user and awards any newly qualifying badges.
 * This runs after every XP or reward point change.
 */
export async function checkAndAwardBadges(userId: string): Promise<void> {
  const [user, badges, alreadyUnlocked, completedChallenges, completedCSR] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { xpPoints: true } }),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    prisma.challengeParticipation.count({ where: { userId, status: "APPROVED" } }),
    prisma.participation.count({ where: { userId, status: "APPROVED" } }),
  ]);

  if (!user) return;

  const unlockedIds = new Set(alreadyUnlocked.map((ub) => ub.badgeId));

  for (const badge of badges) {
    if (unlockedIds.has(badge.id)) continue; // Already earned

    const rule = badge.unlockRule as unknown as UnlockRule;
    let qualifies = false;

    switch (rule.type) {
      case "xp_gte":
        qualifies = user.xpPoints >= rule.value;
        break;
      case "challenges_gte":
        qualifies = completedChallenges >= rule.value;
        break;
      case "csr_gte":
        qualifies = completedCSR >= rule.value;
        break;
    }

    if (qualifies) {
      await awardBadge(userId, badge.id);
    }
  }
}

/**
 * Idempotently awards a badge to a user.
 * Uses upsert to prevent duplicates even under race conditions.
 */
export async function awardBadge(userId: string, badgeId: number): Promise<void> {
  try {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      update: {},
      create: { userId, badgeId },
    });
    console.log(`[Badge] Awarded badge ${badgeId} to user ${userId}`);
  } catch (err) {
    console.error(`[Badge] Failed to award badge ${badgeId} to user ${userId}:`, err);
  }
}

/**
 * Returns all badges for display, annotated with whether the user has unlocked them.
 */
export async function getBadgesForUser(userId: string) {
  const [badges, userBadges, user, completedChallenges, completedCSR] = await Promise.all([
    prisma.badge.findMany({ orderBy: { id: "asc" } }),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { xpPoints: true } }),
    prisma.challengeParticipation.count({ where: { userId, status: "APPROVED" } }),
    prisma.participation.count({ where: { userId, status: "APPROVED" } }),
  ]);

  const unlockedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.awardedAt]));

  return badges.map((badge) => {
    const rule = badge.unlockRule as unknown as UnlockRule;
    const unlocked = unlockedMap.has(badge.id);

    let currentProgress = 0;
    if (!unlocked && user) {
      switch (rule.type) {
        case "xp_gte": currentProgress = user.xpPoints; break;
        case "challenges_gte": currentProgress = completedChallenges; break;
        case "csr_gte": currentProgress = completedCSR; break;
      }
    }

    return {
      ...badge,
      unlocked,
      awardedAt: unlocked ? unlockedMap.get(badge.id) : null,
      progress: unlocked ? rule.value : currentProgress,
      target: rule.value,
    };
  });
}
