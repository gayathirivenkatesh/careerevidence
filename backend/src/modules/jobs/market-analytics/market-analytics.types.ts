export interface MarketEligibilityOptions {
  freshnessDays: number;
  minimumSampleSize: number;
}

export interface EligibleMarketJob {
  id: string;
  primaryRoleId: string;
  postedDate: Date | null;
  lastCheckedAt: Date;
}

export interface RoleMarketSummary {
  roleId: string;
  roleCode: string;
  roleName: string;
  jobCount: number;
}

export interface SkillDemandSummary {
  skillId: string;
  skillCode: string;
  skillName: string;
  jobCount: number;
  demandPercentage: number;
}

export interface RoleMarketAnalytics {
  roleId: string;
  roleCode: string;
  roleName: string;
  sampleSize: number;
  sufficientSampleSize: boolean;
  skills: SkillDemandSummary[];
}

export interface MarketAnalyticsResult {
  generatedAt: Date;
  freshnessDays: number;
  minimumSampleSize: number;
  roles: RoleMarketAnalytics[];
}