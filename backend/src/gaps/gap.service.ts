import type { PrismaClient } from '@prisma/client';
import {
  AlignmentService,
} from '../alignment/alignment.service.js';

export class GapService {
  private readonly alignmentService: AlignmentService;

  constructor(
    private readonly prisma: PrismaClient,
  ) {
    this.alignmentService =
      new AlignmentService({
        prisma,
      });
  }

  async getRoleGaps(
    studentId: string,
    roleId: string,
  ) {
    return this.alignmentService.analyzeGaps(
      studentId,
      roleId,
    );
  }
}