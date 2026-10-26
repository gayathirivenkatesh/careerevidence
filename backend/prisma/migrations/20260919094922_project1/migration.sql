-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "KnowledgeLevel" AS ENUM ('NONE', 'BASIC', 'WORKING', 'STRONG');

-- CreateEnum
CREATE TYPE "AbilityLevel" AS ENUM ('NONE', 'BASIC', 'WORKING', 'STRONG');

-- CreateEnum
CREATE TYPE "EvidenceLevel" AS ENUM ('MISSING', 'PARTIAL', 'GOOD', 'STRONG');

-- CreateEnum
CREATE TYPE "JobEntryLevelStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'REVIEW');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'STALE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'ERROR');

-- CreateEnum
CREATE TYPE "JobCollectionRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "AcademicEventType" AS ENUM ('EXAM', 'ASSIGNMENT', 'PROJECT_REVIEW', 'INTERNAL_ASSESSMENT', 'DEADLINE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AcademicWorkload" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "education" TEXT,
    "graduationYear" INTEGER,
    "targetRoleId" UUID,
    "careerHoursPerWeek" INTEGER NOT NULL DEFAULT 14,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAlias" (
    "id" UUID NOT NULL,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "skillId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleSkill" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "isCore" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "postedDate" TIMESTAMP(3),
    "updatedDate" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "status" "JobStatus" NOT NULL,
    "entryLevelStatus" "JobEntryLevelStatus" NOT NULL,
    "entryLevelReason" TEXT,
    "primaryRoleId" UUID,
    "classificationMethod" TEXT,
    "classificationConfidence" DOUBLE PRECISION,
    "processingStatus" "JobProcessingStatus" NOT NULL,
    "processingError" TEXT,
    "jobCollectionRunId" UUID,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "extractionMethod" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCollectionRun" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "JobCollectionRunStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "queriesExecuted" INTEGER NOT NULL,
    "jobsReceived" INTEGER NOT NULL,
    "jobsNew" INTEGER NOT NULL,
    "jobsUpdated" INTEGER NOT NULL,
    "jobsDuplicate" INTEGER NOT NULL,
    "jobsRejected" INTEGER NOT NULL,
    "jobsReview" INTEGER NOT NULL,
    "jobsAccepted" INTEGER NOT NULL,
    "errors" INTEGER NOT NULL,
    "errorSummary" TEXT,
    "queryDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobCollectionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "jobCount" INTEGER NOT NULL,
    "datasetSize" INTEGER NOT NULL,
    "demandPercentage" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "collectionStart" TIMESTAMP(3) NOT NULL,
    "collectionEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSkill" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "knowledgeLevel" "KnowledgeLevel" NOT NULL,
    "abilityLevel" "AbilityLevel" NOT NULL,
    "evidenceLevel" "EvidenceLevel" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "features" TEXT NOT NULL,
    "implementationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSkill" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "evidenceLevel" "EvidenceLevel" NOT NULL,
    "evidenceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicEvent" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "type" "AcademicEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workload" "AcademicWorkload" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "skillId" UUID,
    "status" "RecommendationStatus" NOT NULL,
    "priorityScore" INTEGER NOT NULL,
    "what" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "how" TEXT NOT NULL,
    "effortHours" INTEGER NOT NULL,
    "proof" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    "marketRelevance" INTEGER NOT NULL,
    "roleRelevance" INTEGER NOT NULL,
    "gapSeverity" INTEGER NOT NULL,
    "evidenceGap" INTEGER NOT NULL,
    "academicConstraint" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_code_key" ON "Skill"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "SkillAlias_normalizedAlias_idx" ON "SkillAlias"("normalizedAlias");

-- CreateIndex
CREATE INDEX "SkillAlias_skillId_idx" ON "SkillAlias"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAlias_skillId_normalizedAlias_key" ON "SkillAlias"("skillId", "normalizedAlias");

-- CreateIndex
CREATE INDEX "RoleSkill_roleId_idx" ON "RoleSkill"("roleId");

-- CreateIndex
CREATE INDEX "RoleSkill_skillId_idx" ON "RoleSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleSkill_roleId_skillId_key" ON "RoleSkill"("roleId", "skillId");

-- CreateIndex
CREATE INDEX "JobPosting_primaryRoleId_idx" ON "JobPosting"("primaryRoleId");

-- CreateIndex
CREATE INDEX "JobPosting_entryLevelStatus_idx" ON "JobPosting"("entryLevelStatus");

-- CreateIndex
CREATE INDEX "JobPosting_processingStatus_idx" ON "JobPosting"("processingStatus");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_postedDate_idx" ON "JobPosting"("postedDate");

-- CreateIndex
CREATE INDEX "JobPosting_lastCheckedAt_idx" ON "JobPosting"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "JobPosting_jobCollectionRunId_idx" ON "JobPosting"("jobCollectionRunId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_provider_externalId_key" ON "JobPosting"("provider", "externalId");

-- CreateIndex
CREATE INDEX "JobSkill_jobId_idx" ON "JobSkill"("jobId");

-- CreateIndex
CREATE INDEX "JobSkill_skillId_idx" ON "JobSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobId_skillId_key" ON "JobSkill"("jobId", "skillId");

-- CreateIndex
CREATE INDEX "JobCollectionRun_provider_idx" ON "JobCollectionRun"("provider");

-- CreateIndex
CREATE INDEX "JobCollectionRun_status_idx" ON "JobCollectionRun"("status");

-- CreateIndex
CREATE INDEX "JobCollectionRun_startedAt_idx" ON "JobCollectionRun"("startedAt");

-- CreateIndex
CREATE INDEX "MarketSnapshot_roleId_idx" ON "MarketSnapshot"("roleId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_skillId_idx" ON "MarketSnapshot"("skillId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_periodStart_idx" ON "MarketSnapshot"("periodStart");

-- CreateIndex
CREATE INDEX "MarketSnapshot_periodEnd_idx" ON "MarketSnapshot"("periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_roleId_skillId_periodStart_periodEnd_provide_key" ON "MarketSnapshot"("roleId", "skillId", "periodStart", "periodEnd", "provider", "geography");

-- CreateIndex
CREATE INDEX "StudentSkill_studentId_idx" ON "StudentSkill"("studentId");

-- CreateIndex
CREATE INDEX "StudentSkill_skillId_idx" ON "StudentSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSkill_studentId_skillId_key" ON "StudentSkill"("studentId", "skillId");

-- CreateIndex
CREATE INDEX "Project_studentId_idx" ON "Project"("studentId");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectSkill_projectId_idx" ON "ProjectSkill"("projectId");

-- CreateIndex
CREATE INDEX "ProjectSkill_skillId_idx" ON "ProjectSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSkill_projectId_skillId_key" ON "ProjectSkill"("projectId", "skillId");

-- CreateIndex
CREATE INDEX "AcademicEvent_studentId_idx" ON "AcademicEvent"("studentId");

-- CreateIndex
CREATE INDEX "AcademicEvent_startDate_idx" ON "AcademicEvent"("startDate");

-- CreateIndex
CREATE INDEX "AcademicEvent_endDate_idx" ON "AcademicEvent"("endDate");

-- CreateIndex
CREATE INDEX "Recommendation_studentId_idx" ON "Recommendation"("studentId");

-- CreateIndex
CREATE INDEX "Recommendation_roleId_idx" ON "Recommendation"("roleId");

-- CreateIndex
CREATE INDEX "Recommendation_skillId_idx" ON "Recommendation"("skillId");

-- CreateIndex
CREATE INDEX "Recommendation_status_idx" ON "Recommendation"("status");

-- CreateIndex
CREATE INDEX "Recommendation_priorityScore_idx" ON "Recommendation"("priorityScore");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_targetRoleId_fkey" FOREIGN KEY ("targetRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAlias" ADD CONSTRAINT "SkillAlias_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSkill" ADD CONSTRAINT "RoleSkill_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSkill" ADD CONSTRAINT "RoleSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_primaryRoleId_fkey" FOREIGN KEY ("primaryRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_jobCollectionRunId_fkey" FOREIGN KEY ("jobCollectionRunId") REFERENCES "JobCollectionRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicEvent" ADD CONSTRAINT "AcademicEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
