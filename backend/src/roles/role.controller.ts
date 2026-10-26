import type { Request, Response } from 'express';
import {
  getRoleById,
  getRoles,
} from './role.service.js';

export async function listRoles(
  _req: Request,
  res: Response,
): Promise<void> {
  const roles = await getRoles();

  res.status(200).json(roles);
}

export async function getRole(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  const role = await getRoleById(id);

  if (!role) {
    res.status(404).json({
      error: 'ROLE_NOT_FOUND',
      message: 'Role not found',
    });
    return;
  }

  res.status(200).json(role);
}