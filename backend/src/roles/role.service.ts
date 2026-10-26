import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getRoles() {
  return prisma.role.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
    },
  });
}

export async function getRoleById(roleId: string) {
  return prisma.role.findUnique({
    where: {
      id: roleId,
    },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
    },
  });
}