import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log('=== ROLES IN DATABASE (' + roles.length + ') ===');
  for (const r of roles) {
    console.log(`- ${r.code}: id=${r.id}, name="${r.name}"`);
  }

  const jobs = await prisma.jobPosting.findMany({
    include: {
      primaryRole: true,
      skills: {
        include: { skill: true }
      }
    }
  });
  console.log('\n=== JOBS IN DATABASE (' + jobs.length + ') ===');
  for (const j of jobs) {
    console.log(`- Job [${j.id}] "${j.title}" by ${j.company}`);
    console.log(`  provider=${j.provider}, location="${j.location}"`);
    console.log(`  status=${j.status}, entryLevelStatus=${j.entryLevelStatus}, processingStatus=${j.processingStatus}`);
    console.log(`  postedDate=${j.postedDate}, lastCheckedAt=${j.lastCheckedAt}`);
    console.log(`  primaryRole=${j.primaryRole ? j.primaryRole.code + ' (' + j.primaryRoleId + ')' : 'NULL'}`);
    console.log(`  skills (${j.skills.length}): ${j.skills.map(s => s.skill.name).join(', ')}`);
  }

  const runs = await prisma.jobCollectionRun.findMany();
  console.log('\n=== COLLECTION RUNS (' + runs.length + ') ===');
  for (const run of runs) {
    console.log(`- Run [${run.id}] provider=${run.provider}, status=${run.status}, queries=${run.queriesExecuted}, received=${run.jobsReceived}, accepted=${run.jobsAccepted}, rejected=${run.jobsRejected}, errors=${run.errors}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
