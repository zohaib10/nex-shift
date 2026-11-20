/**
 * Positions a new organization starts with, by the type picked in onboarding
 * (must match INDUSTRY_OPTIONS in web OrgDetailsStep). Admins can add or
 * delete any of them later.
 */
const DEFAULTS: Record<string, string[]> = {
  'Medical Clinic': [
    'Physician',
    'Nurse Practitioner',
    'RN',
    'Medical Assistant',
    'Front Desk',
  ],
  'Hospital / Health System': [
    'RN',
    'LPN',
    'CNA',
    'Physician',
    'Respiratory Therapist',
    'Unit Clerk',
  ],
  'Urgent Care': [
    'Physician',
    'Physician Assistant',
    'RN',
    'Medical Assistant',
    'Radiology Tech',
    'Front Desk',
  ],
  'Dental Practice': [
    'Dentist',
    'Dental Hygienist',
    'Dental Assistant',
    'Front Desk',
  ],
  'Physical Therapy': [
    'Physical Therapist',
    'PT Assistant',
    'Rehab Aide',
    'Front Desk',
  ],
  'Mental Health Practice': [
    'Psychiatrist',
    'Therapist',
    'Case Manager',
    'Front Desk',
  ],
  'Home Health Agency': ['RN', 'LPN', 'Home Health Aide', 'Scheduler'],
};

const FALLBACK = ['RN', 'Medical Assistant', 'Front Desk'];

export function defaultPositions(orgType: string): string[] {
  return DEFAULTS[orgType] ?? FALLBACK;
}

/**
 * Colours are assigned by the system, not picked. Each new position takes the
 * least-used colour, in this order, so neighbours on the schedule differ.
 */
export const POSITION_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
  '#14B8A6', // teal
  '#EC4899', // pink
  '#F97316', // orange
  '#6366F1', // indigo
  '#64748B', // slate
];

export function nextColor(used: string[]): string {
  const count = (c: string) => used.filter((u) => u === c).length;
  return POSITION_COLORS.reduce((best, c) =>
    count(c) < count(best) ? c : best,
  );
}

/** A new organization's positions, each with its own colour. */
export function seedPositions(orgType: string) {
  const used: string[] = [];
  return defaultPositions(orgType).map((name) => {
    const color = nextColor(used);
    used.push(color);
    return { name, color };
  });
}
