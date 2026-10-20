// Deterministic reconciliation of the model's skill-match lists
// against the actual texts (critical review L1: the model listed
// "Git & GitHub" as BOTH matched and missing, and listed skills as
// matched that appear in neither document).
//
// Ground truth, derived from the texts themselves:
//   matched = named in the job description AND present in the resume
//   missing = named in the job description AND absent from the resume
//   anything else (not a requirement of this job, or invented by the
//   model) is dropped from both lists.
// The LLM's matchScore is left untouched.

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Boundary-aware containment: the skill must appear in the text not
 * glued to other word characters — so "Git" does not match inside
 * "digital", while terms like "C++", "C#", and "Node.js" still work.
 */
export function textContainsSkill(text: string, skill: string): boolean {
  const t = normalize(text);
  const s = normalize(skill);
  if (!s) return false;
  const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![a-z0-9+#])${escaped}(?![a-z0-9+#])`);
  return re.test(t);
}

export function reconcileSkillLists(
  lists: { matched?: string[]; missing?: string[] },
  resumeText: string,
  jobDescription: string
): { matched: string[]; missing: string[] } {
  const candidates = [...(lists.matched || []), ...(lists.missing || [])];
  const seen = new Set<string>();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const key = normalize(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const inJobDescription = textContainsSkill(jobDescription, raw);
    const inResume = textContainsSkill(resumeText, raw);

    if (inJobDescription && inResume) matched.push(raw);
    else if (inJobDescription && !inResume) missing.push(raw);
    // Otherwise the term is not a requirement of this job — drop it.
  }

  return { matched, missing };
}

/**
 * Corrects, in place, whichever skill-list shapes a generated result
 * carries (hardSkills/softSkills objects, or flat matched/missing
 * skill arrays) so the lists agree with the source texts.
 */
export function reconcileGeneratedSkills(
  result: any,
  resumeText: string,
  jobDescription: string
): any {
  if (!result || typeof result !== 'object') return result;

  for (const key of ['hardSkills', 'softSkills']) {
    const lists = result[key];
    if (lists && (Array.isArray(lists.matched) || Array.isArray(lists.missing))) {
      result[key] = reconcileSkillLists(lists, resumeText, jobDescription);
    }
  }

  if (Array.isArray(result.matchedSkills) || Array.isArray(result.missingSkills)) {
    const fixed = reconcileSkillLists(
      { matched: result.matchedSkills, missing: result.missingSkills },
      resumeText,
      jobDescription
    );
    result.matchedSkills = fixed.matched;
    result.missingSkills = fixed.missing;
  }

  return result;
}
