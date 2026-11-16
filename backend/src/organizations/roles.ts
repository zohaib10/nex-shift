/**
 * Organization roles (org_members.role)
 *   owner  — created the organization; one per org; can't be removed. Everything
 *            an admin can do, plus promoting/demoting admins.
 *   admin  — runs the whole organization: locations, invites, roles, schedules.
 *            Acts as a manager at every location without location rows.
 *   member — no org-wide rights; access comes from their location roles.
 *
 * Location roles (location_members.role)
 *   manager — runs one location: its schedule and inviting staff to it.
 *   staff   — works shifts there; sees their own schedule.
 */
export const ORG_ROLES = ['owner', 'admin', 'member'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const LOCATION_ROLES = ['manager', 'staff'] as const;
export type LocationRole = (typeof LOCATION_ROLES)[number];

/** What an invite can grant. `admin` is an org role; the others are location roles. */
export const INVITE_ROLES = ['staff', 'manager', 'admin'] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

export const isOrgAdmin = (role: OrgRole) => role === 'owner' || role === 'admin';

/** Rows written before these roles existed used 'user' for members. */
export function normalizeOrgRole(role: string): OrgRole {
  return (ORG_ROLES as readonly string[]).includes(role) ? (role as OrgRole) : 'member';
}

export function normalizeLocationRole(role: string): LocationRole {
  return role === 'manager' ? 'manager' : 'staff';
}
