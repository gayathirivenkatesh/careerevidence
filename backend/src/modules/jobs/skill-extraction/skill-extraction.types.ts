export interface ExtractedSkill {
  canonicalName: string;
  source: 'deterministic';
  matchedText: string;
}

export interface SkillExtractionResult {
  skills: ExtractedSkill[];
  method: 'deterministic' | 'deterministic+ai';
  ambiguousTerms: string[];
}