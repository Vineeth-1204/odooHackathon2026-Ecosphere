export type CSRStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface CSRActivity {
  id: number;
  title: string;
  description?: string | null;
  categoryId: number;
  departmentId?: number | null;
  date: Date;
  maxParticipants?: number | null;
  pointsReward: number;
  status: CSRStatus;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSRActivityWithMeta extends CSRActivity {
  category?: { id: number; name: string };
  _count?: { participations: number };
}
