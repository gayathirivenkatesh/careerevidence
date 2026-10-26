export const CANONICAL_SKILLS = [
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
] as const;

export type CanonicalSkill =
  (typeof CANONICAL_SKILLS)[number];

export const SKILL_ALIASES: Record<
  CanonicalSkill,
  readonly string[]
> = {
  REACT: [
    'react',
    'react.js',
    'reactjs',
    'react js',
  ],

  JAVASCRIPT: [
    'javascript',
    'javascript es6',
    'js',
    'ecmascript',
  ],

  TYPESCRIPT: [
    'typescript',
    'ts',
  ],

  HTML: [
    'html',
    'html5',
  ],

  CSS: [
    'css',
    'css3',
  ],

  'NODE.JS': [
    'node.js',
    'nodejs',
    'node js',
    'node',
  ],

  EXPRESS: [
    'express',
    'express.js',
    'expressjs',
  ],

  'REST API': [
    'rest api',
    'rest apis',
    'restful api',
    'restful apis',
    'rest',
  ],

  POSTGRESQL: [
    'postgresql',
    'postgres',
    'postgres db',
    'postgres database',
  ],

  MYSQL: [
    'mysql',
    'mysql database',
  ],

  MONGODB: [
    'mongodb',
    'mongo db',
    'mongo',
  ],

  SQL: [
    'sql',
  ],

  GIT: [
    'git',
  ],

  GITHUB: [
    'github',
    'github actions',
  ],

  TESTING: [
    'testing',
    'software testing',
    'unit testing',
    'integration testing',
  ],

  JEST: [
    'jest',
  ],

  CYPRESS: [
    'cypress',
  ],

  'NEXT.JS': [
    'next.js',
    'nextjs',
    'next js',
  ],

  'TAILWIND CSS': [
    'tailwind css',
    'tailwindcss',
    'tailwind',
  ],

  REDUX: [
    'redux',
    'redux toolkit',
    'react redux',
  ],

  ZUSTAND: [
    'zustand',
  ],

  DOCKER: [
    'docker',
    'docker containers',
    'containerization',
  ],
};