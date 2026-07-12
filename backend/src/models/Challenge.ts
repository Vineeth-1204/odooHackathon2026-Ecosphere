export type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Challenge {
  id: number;
  title: string;
  description?: string | null;
  categoryId: number;
  xpValue: number;
  difficulty: Difficulty;
  evidenceRequired: boolean;
  deadline?: Date | null;
  status: ChallengeStatus;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeWithMeta extends Challenge {
  category?: { id: number; name: string };
  _count?: { participations: number };
  myParticipation?: {
    id: number;
    progress: number;
    status: string;
    proofUrl?: string | null;
  } | null;
}
