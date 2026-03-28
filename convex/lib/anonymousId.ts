/** UUID v4 or legacy Saathi onboarding id shape. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_RE = /^saathi_\d+_[a-z0-9]+$/i;
/** Registered-student chat uses anonymousId `jwt:<convex users table _id>`. */
function isJwtSubjectKey(s: string): boolean {
  if (!s.startsWith("jwt:") || s.length < 6 || s.length > 200) return false;
  const rest = s.slice(4);
  return !/\s/.test(rest);
}

export function isValidAnonymousId(anonymousId: string): boolean {
  const s = anonymousId.trim();
  return UUID_RE.test(s) || LEGACY_RE.test(s);
}

export function isValidSubjectKey(subjectKey: string): boolean {
  const s = subjectKey.trim();
  return isValidAnonymousId(s) || isJwtSubjectKey(s);
}

export function assertValidAnonymousId(anonymousId: string): void {
  if (!isValidAnonymousId(anonymousId.trim())) {
    throw new Error("Invalid anonymous id format");
  }
}

export function assertValidSubjectKey(subjectKey: string): void {
  if (!isValidSubjectKey(subjectKey.trim())) {
    throw new Error("Invalid subject key format");
  }
}
