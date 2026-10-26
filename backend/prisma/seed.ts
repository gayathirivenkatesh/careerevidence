import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles = [
  {
    code: 'JUNIOR_REACT_DEVELOPER',
    name: 'Junior React Developer',
    description: 'Entry-level developer specializing in React frontend development.',
  },
  {
    code: 'JUNIOR_FRONTEND_DEVELOPER',
    name: 'Junior Frontend Developer',
    description: 'Entry-level developer focusing on general frontend web technologies.',
  },
  {
    code: 'JUNIOR_FULLSTACK_DEVELOPER',
    name: 'Junior Full-Stack Developer',
    description: 'Entry-level developer working across both frontend and backend.',
  },
  {
    code: 'JUNIOR_NODE_DEVELOPER',
    name: 'Junior Node.js Developer',
    description: 'Entry-level backend developer using Node.js.',
  },
  {
    code: 'JUNIOR_SOFTWARE_DEVELOPER',
    name: 'Junior Software Developer',
    description: 'General entry-level software engineering role.',
  },
];

const skills = [
  'REACT',
  'JAVASCRIPT',
  'TYPESCRIPT',
  'HTML',
  'CSS',
  'NODE.JS',
  'EXPRESS',
  'REST API',
  'POSTGRESQL',
  'MYSQL',
  'MONGODB',
  'SQL',
  'GIT',
  'GITHUB',
  'TESTING',
  'JEST',
  'CYPRESS',
  'NEXT.JS',
  'TAILWIND CSS',
  'REDUX',
  'ZUSTAND',
  'DOCKER',
];

const aliasesMap: Record<string, string[]> = {
  'REACT': ['ReactJS', 'React.js', 'React JS', 'react'],
  'NODE.JS': ['NodeJS', 'Node.js', 'Node JS'],
  'JAVASCRIPT': ['JS', 'ES6'],
  'TYPESCRIPT': ['TS'],
  'POSTGRESQL': ['Postgres', 'PostgreSQL', 'pg'],
  'MONGODB': ['Mongo', 'MongoDB'],
  'REST API': ['REST', 'REST API'],
  'TAILWIND CSS': ['Tailwind', 'Tailwind CSS'],
  'TESTING': ['Unit Testing'],
  'JEST': ['Jest'],
  'DOCKER': ['Docker', 'containerization'],
};

const roleSkillMappings = [
  {
    role: 'JUNIOR_REACT_DEVELOPER',
    core: ['REACT', 'JAVASCRIPT', 'HTML', 'CSS'],
    relevant: ['TYPESCRIPT', 'GIT', 'GITHUB', 'REST API', 'REDUX', 'ZUSTAND', 'TESTING', 'JEST', 'TAILWIND CSS'],
  },
  {
    role: 'JUNIOR_FRONTEND_DEVELOPER',
    core: ['HTML', 'CSS', 'JAVASCRIPT'],
    relevant: ['TYPESCRIPT', 'REACT', 'GIT', 'GITHUB', 'REST API', 'TESTING', 'JEST', 'CYPRESS', 'TAILWIND CSS'],
  },
  {
    role: 'JUNIOR_FULLSTACK_DEVELOPER',
    core: ['REACT', 'JAVASCRIPT', 'NODE.JS', 'REST API', 'SQL'],
    relevant: ['TYPESCRIPT', 'EXPRESS', 'POSTGRESQL', 'MYSQL', 'MONGODB', 'GIT', 'GITHUB', 'TESTING', 'DOCKER'],
  },
  {
    role: 'JUNIOR_NODE_DEVELOPER',
    core: ['NODE.JS', 'JAVASCRIPT', 'REST API'],
    relevant: ['TYPESCRIPT', 'EXPRESS', 'SQL', 'POSTGRESQL', 'MYSQL', 'MONGODB', 'GIT', 'GITHUB', 'TESTING', 'DOCKER'],
  },
  {
    role: 'JUNIOR_SOFTWARE_DEVELOPER',
    core: ['JAVASCRIPT', 'GIT', 'SQL'],
    relevant: ['TYPESCRIPT', 'TESTING', 'GITHUB'],
  },
];

async function main() {
  console.log('Seeding roles...');
  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }

  console.log('Seeding skills...');
  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s },
      update: {},
      create: {
        code: s.toUpperCase().replace(/\s+/g, '_').replace(/\./g, ''),
        name: s,
        description: `Canonical skill for ${s}`,
      },
    });
  }

  console.log('Seeding aliases...');
  for (const [skillName, aliasesList] of Object.entries(aliasesMap)) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) continue;

    for (const alias of aliasesList) {
      const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      await prisma.skillAlias.upsert({
        where: {
          skillId_normalizedAlias: {
            skillId: skill.id,
            normalizedAlias,
          },
        },
        update: {},
        create: {
          alias,
          normalizedAlias,
          skillId: skill.id,
        },
      });
    }
  }

  console.log('Seeding role-skills...');
  for (const mapping of roleSkillMappings) {
    const role = await prisma.role.findUnique({ where: { code: mapping.role } });
    if (!role) continue;

    for (const coreSkill of mapping.core) {
      const skill = await prisma.skill.findUnique({ where: { name: coreSkill } });
      if (!skill) continue;

      await prisma.roleSkill.upsert({
        where: {
          roleId_skillId: {
            roleId: role.id,
            skillId: skill.id,
          },
        },
        update: {
          relevanceScore: 100,
          isCore: true,
        },
        create: {
          roleId: role.id,
          skillId: skill.id,
          relevanceScore: 100,
          isCore: true,
        },
      });
    }

    for (const relevantSkill of mapping.relevant) {
      const skill = await prisma.skill.findUnique({ where: { name: relevantSkill } });
      if (!skill) continue;

      await prisma.roleSkill.upsert({
        where: {
          roleId_skillId: {
            roleId: role.id,
            skillId: skill.id,
          },
        },
        update: {
          relevanceScore: 75, // Strongly relevant default for non-core
          isCore: false,
        },
        create: {
          roleId: role.id,
          skillId: skill.id,
          relevanceScore: 75,
          isCore: false,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
