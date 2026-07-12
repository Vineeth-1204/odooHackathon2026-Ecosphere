import prisma from '../lib/prisma';
import { checkAndAwardBadges } from './badge.service';

/**
 * Awards XP points to a user.
 * Also triggers badge auto-award check.
 */
export async function awardXP(userId: number, amount: number): Promise<number> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { xpPoints: { increment: amount } },
    select: { xpPoints: true },
  });

  // Trigger badge check after every XP award
  await checkAndAwardBadges(userId);

  return updated.xpPoints;
}

/**
 * Awards reward points (from CSR activity completions).
 * Reward points are separate from XP — they can be spent on rewards.
 */
export async function awardRewardPoints(userId: number, amount: number): Promise<number> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { rewardPoints: { increment: amount } },
    select: { rewardPoints: true },
  });

  // Also trigger badge check (some badges may be based on CSR completions)
  await checkAndAwardBadges(userId);

  return updated.rewardPoints;
}

/**
 * Atomically deducts reward points and decrements reward stock.
 * Throws if insufficient points or stock.
 */
export async function redeemReward(userId: number, rewardId: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Lock and fetch reward
    const reward = await tx.reward.findUnique({ where: { id: rewardId } });
    if (!reward || reward.status !== 'ACTIVE') {
      throw new Error('Reward not found or unavailable');
    }
    if (reward.stock <= 0) {
      throw new Error('Reward is out of stock');
    }

    // 2. Lock and fetch user
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.rewardPoints < reward.pointsCost) {
      throw new Error(`Insufficient points. You need ${reward.pointsCost} but have ${user.rewardPoints}`);
    }

    // 3. Deduct points from user
    await tx.user.update({
      where: { id: userId },
      data: { rewardPoints: { decrement: reward.pointsCost } },
    });

    // 4. Decrement stock
    await tx.reward.update({
      where: { id: rewardId },
      data: { stock: { decrement: 1 } },
    });

    // 5. Create redemption record
    await tx.rewardRedemption.create({
      data: { userId, rewardId, pointsDeducted: reward.pointsCost },
    });
  });
}

/**
 * Returns a user's current XP and reward point balances.
 */
export async function getUserBalance(userId: number): Promise<{ xpPoints: number; rewardPoints: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpPoints: true, rewardPoints: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}
