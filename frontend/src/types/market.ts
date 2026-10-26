export interface MarketSkill {
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
  skills: MarketSkill[];
}

export interface MarketAnalyticsResponse {
  generatedAt: string;
  freshnessDays: number;
  minimumSampleSize: number;
  roles: RoleMarketAnalytics[];
}
