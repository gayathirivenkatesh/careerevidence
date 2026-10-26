import type {
  AcademicEventType,
  AcademicWorkload,
} from '@prisma/client';

export interface CreateAcademicEventInput {
  type: AcademicEventType;
  title: string;
  description: string;
  workload: AcademicWorkload;
  startDate: Date;
  endDate: Date;
}

export interface UpdateAcademicEventInput {
  type?: AcademicEventType;
  title?: string;
  description?: string;
  workload?: AcademicWorkload;
  startDate?: Date;
  endDate?: Date;
}

export interface AcademicEventSummary {
  id: string;
  type: AcademicEventType;
  title: string;
  description: string;
  workload: AcademicWorkload;
  startDate: Date;
  endDate: Date;
}