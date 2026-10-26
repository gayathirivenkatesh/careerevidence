import { PrismaClient } from '@prisma/client';
import { AlignmentService } from './src/alignment/alignment.service.js';
import { RecommendationService } from './src/recommendations/recommendation.service.js';

const prisma = new PrismaClient();

async function inspect() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      targetRoleId: true,
      careerHoursPerWeek: true,
      studentSkills: {
        select: {
          skill: { select: { name: true } },
          knowledgeLevel: true,
          abilityLevel: true,
          evidenceLevel: true
        }
      },
      projects: {
        select: {
          id: true,
          title: true,
          skills: {
            select: {
              skill: { select: { name: true } },
              evidenceLevel: true
            }
          }
        }
      },
      academicEvents: true,
      recommendations: true
    }
  });

  console.log(`=== USERS IN DB (${users.length}) ===`);
  for (const u of users) {
    console.log(`User: ${u.name} (${u.email}) [id=${u.id}]`);
    console.log(`  targetRoleId: ${u.targetRoleId}, careerHoursPerWeek: ${u.careerHoursPerWeek}`);
    console.log(`  studentSkills count: ${u.studentSkills.length}`);
    console.log(`  projects count: ${u.projects.length}`);
    console.log(`  academicEvents count: ${u.academicEvents.length}`);
    console.log(`  recommendations count: ${u.recommendations.length}`);
    if (u.recommendations.length > 0) {
      console.log('  Recommendations:', u.recommendations.map(r => ({
        id: r.id,
        what: r.what,
        priorityScore: r.priorityScore,
        effortHours: r.effortHours,
        marketRelevance: r.marketRelevance,
        roleRelevance: r.roleRelevance,
        gapSeverity: r.gapSeverity,
        evidenceGap: r.evidenceGap,
        academicConstraint: r.academicConstraint
      })));
    }

    if (u.targetRoleId) {
      const alignmentService = new AlignmentService({ prisma });
      const gaps = await alignmentService.analyzeGaps(u.id, u.targetRoleId);
      console.log(`  Computed Gaps count for target role: ${gaps.gaps.length}`);
      for (const g of gaps.gaps) {
        console.log(`    - ${g.skillName}: demand=${g.marketDemandPercentage}%, primaryGap=${g.primaryGap}, explanation="${g.explanation}"`);
      }
    }
  }
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
