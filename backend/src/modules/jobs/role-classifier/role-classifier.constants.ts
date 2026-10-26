import type { PrimaryRole } from './role-classifier.types';

export const ROLE_CLASSIFICATION_WEIGHTS = {
  title: 0.5,
  responsibilities: 0.3,
  technology: 0.2,
} as const;

export const ROLE_CONFIDENCE_THRESHOLD = 0.7;

export const ROLE_SIGNALS: Record<
  PrimaryRole,
  {
    title: string[];
    responsibilities: string[];
    technology: string[];
  }
> = {
  JUNIOR_FULLSTACK_DEVELOPER: {
    title: [
      'full stack',
      'full-stack',
      'fullstack',
    ],
    responsibilities: [
      'frontend and backend',
      'front end and back end',
      'frontend and server',
      'backend and frontend',
      'end to end',
    ],
    technology: [
      'react',
      'node.js',
      'nodejs',
      'express',
      'rest api',
      'postgresql',
      'mysql',
      'mongodb',
    ],
  },

  JUNIOR_REACT_DEVELOPER: {
    title: [
      'react developer',
      'react.js developer',
      'react developer',
    ],
    responsibilities: [
      'build react applications',
      'develop react applications',
      'react components',
      'react interfaces',
      'react frontend',
    ],
    technology: [
      'react',
      'react.js',
      'javascript',
      'typescript',
      'jsx',
    ],
  },

  JUNIOR_FRONTEND_DEVELOPER: {
    title: [
      'frontend developer',
      'front-end developer',
      'frontend engineer',
      'front-end engineer',
      'ui developer',
    ],
    responsibilities: [
      'frontend development',
      'front-end development',
      'user interface',
      'build web interfaces',
      'responsive interfaces',
    ],
    technology: [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
    ],
  },

  JUNIOR_NODE_DEVELOPER: {
    title: [
      'node developer',
      'node.js developer',
      'nodejs developer',
      'backend developer',
      'back-end developer',
    ],
    responsibilities: [
      'backend development',
      'back-end development',
      'server-side development',
      'rest api development',
      'api development',
    ],
    technology: [
      'node.js',
      'nodejs',
      'express',
      'rest api',
      'postgresql',
      'mysql',
      'mongodb',
    ],
  },

  JUNIOR_SOFTWARE_DEVELOPER: {
    title: [
      'software developer',
      'software engineer',
      'junior developer',
      'application developer',
    ],
    responsibilities: [
      'software development',
      'application development',
      'write software',
      'develop applications',
      'debug software',
    ],
    technology: [
      'javascript',
      'typescript',
      'java',
      'python',
      'c++',
      'git',
    ],
  },
};