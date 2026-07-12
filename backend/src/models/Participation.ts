export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Participation {
  id: number;
  userId: number;
  csrActivityId: number;
  proofUrl?: string | null;
  status: ApprovalStatus;
  pointsAwarded: number;
  rejectionNote?: string | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipation {
  id: number;
  userId: number;
  challengeId: number;
  progress: number; // 0–100
  proofUrl?: string | null;
  status: ApprovalStatus;
  xpAwarded: number;
  rejectionNote?: string | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
