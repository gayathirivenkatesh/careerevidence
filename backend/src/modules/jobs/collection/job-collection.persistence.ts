import {
  JobEntryLevelStatus,
  JobProcessingStatus,
  JobStatus,
  PrismaClient,
} from '@prisma/client';

import type { NormalizedJob } from '../../../integrations/jobs/types';

import {
  filterEntryLevelJob,
} from '../entry-level';

import {
  classifyPrimaryRole,
} from '../role-classifier';

import {
  extractSkills,
} from '../skill-extraction';

const prisma = new PrismaClient();

interface PersistCollectionOptions {
  collectionRunId: string;
}

interface PersistCollectionResult {
  jobsNew: number;
  jobsUpdated: number;
  jobsDuplicate: number;
  jobsRejected: number;
  jobsReview: number;
  jobsAccepted: number;
  errors: number;
}

function getJobStatus (postedDate?: Date | null, ): JobStatus {
  if (!postedDate) {
    return JobStatus.ACTIVE;
  }

  const freshnessDays = 30;

  const ageMs =
    Date.now() - postedDate.getTime();

  const ageDays =
    ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > freshnessDays) {
    return JobStatus.STALE;
  }

  return JobStatus.ACTIVE;
}

export async function persistCollectedJobs(
  jobs: NormalizedJob[],
  options: PersistCollectionOptions,
): Promise<PersistCollectionResult> {
  const result: PersistCollectionResult = {
    jobsNew: 0,
    jobsUpdated: 0,
    jobsDuplicate: 0,
    jobsRejected: 0,
    jobsReview: 0,
    jobsAccepted: 0,
    errors: 0,
  };

  for (const job of jobs) {
    try {
      const existing =
        await prisma.jobPosting.findUnique({
          where: {
            provider_externalId: {
              provider: job.provider,
              externalId: job.externalId,
            },
          },
          select: {
            id: true,
          },
        });

      const entryLevel =
        filterEntryLevelJob(job);

      const classification =
        classifyPrimaryRole(job);

      const extracted =
        extractSkills(
          `${job.title}\n${job.description}`,
        );

      const role =
        classification.primaryRole
          ? await prisma.role.findUnique({
              where: {
                code: classification.primaryRole,
              },
              select: {
                id: true,
              },
            })
          : null;

      let processingStatus: JobProcessingStatus =
        JobProcessingStatus.PROCESSED;

      let processingError: string | null =
        null;

      if (
        entryLevel.status ===
        'REVIEW'
      ) {
        result.jobsReview += 1;
      }

      if (
        entryLevel.status ===
        'REJECTED'
      ) {
        result.jobsRejected += 1;
      }

      if (
        entryLevel.status ===
        'ACCEPTED'
      ) {
        if (
          classification.primaryRole
        ) {
          result.jobsAccepted += 1;
        } else {
          result.jobsReview += 1;
        }
      }

      if (
        entryLevel.status ===
          'ACCEPTED' &&
        !classification.primaryRole
      ) {
        processingStatus =
          JobProcessingStatus.ERROR;

        processingError =
          'Accepted job did not receive a supported primary role.';
      }

      const persisted =
        await prisma.jobPosting.upsert({
          where: {
            provider_externalId: {
              provider: job.provider,
              externalId: job.externalId,
            },
          },

          create: {
            externalId: job.externalId,
            provider: job.provider,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            sourceUrl: job.sourceUrl,
            postedDate: job.postedDate,
            updatedDate:
              job.updatedDate ?? null,

            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
            lastCheckedAt: new Date(),

            status:
              getJobStatus(job.postedDate),

            entryLevelStatus:
              entryLevel.status as JobEntryLevelStatus,

            entryLevelReason:
              entryLevel.reason,

            primaryRoleId:
              role?.id ?? null,

            classificationMethod:
              classification.method,

            classificationConfidence:
              classification.confidence,

            processingStatus,

            processingError,

            jobCollectionRunId:
              options.collectionRunId,

            rawData:
              (job.rawData ?? {}) as object,
          },

          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            sourceUrl: job.sourceUrl,
            postedDate: job.postedDate,
            updatedDate:
              job.updatedDate ?? null,

            lastSeenAt: new Date(),
            lastCheckedAt: new Date(),

            status:
              getJobStatus(job.postedDate),

            entryLevelStatus:
              entryLevel.status as JobEntryLevelStatus,

            entryLevelReason:
              entryLevel.reason,

            primaryRoleId:
              role?.id ?? null,

            classificationMethod:
              classification.method,

            classificationConfidence:
              classification.confidence,

            processingStatus,

            processingError,

            jobCollectionRunId:
              options.collectionRunId,

            rawData:
              (job.rawData ?? {}) as object,
          },
        });

      if (existing) {
        result.jobsUpdated += 1;
      } else {
        result.jobsNew += 1;
      }

      if (
        entryLevel.status !==
          'ACCEPTED' ||
        !role
      ) {
        continue;
      }

      await prisma.jobSkill.deleteMany({
        where: {
          jobId: persisted.id,
        },
      });

      for (const extractedSkill of extracted.skills) {
        const skill =
          await prisma.skill.findUnique({
            where: {
              code:
                extractedSkill.canonicalName,
            },
            select: {
              id: true,
            },
          });

        if (!skill) {
          continue;
        }

        await prisma.jobSkill.create({
          data: {
            jobId: persisted.id,
            skillId: skill.id,
            extractionMethod:
              extractedSkill.source,
            confidence: 1,
          },
        });
      }
    } catch {
      result.errors += 1;
    }
  }

  return result;
}

export async function disconnectPersistence(): Promise<void> {
  await prisma.$disconnect();
}