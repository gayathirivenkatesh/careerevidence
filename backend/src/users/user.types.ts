export interface UpdateProfileInput {
  name?: string;
  education?: string | null;
  graduationYear?: number | null;
  targetRoleId?: string | null;
  careerHoursPerWeek?: number;
}