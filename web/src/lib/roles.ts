// Mirrors backend/src/organizations/roles.ts. The backend enforces these;
// the web app only uses them to decide what to show.

export type OrgRole = "owner" | "admin" | "member";
export type LocationRole = "manager" | "staff";
export type InviteRole = "staff" | "manager" | "admin";

export const ORG_ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const LOCATION_ROLE_LABEL: Record<LocationRole, string> = {
  manager: "Manager",
  staff: "Staff",
};

export const INVITE_ROLE_LABEL: Record<InviteRole, string> = {
  staff: "Staff",
  manager: "Manager",
  admin: "Admin",
};

export const INVITE_ROLE_HINT: Record<InviteRole, string> = {
  staff: "Works shifts and sees their own schedule.",
  manager: "Runs the schedule and invites staff at their locations.",
  admin: "Manages the whole organization: every location, the team and settings.",
};

export const isOrgAdmin = (role: OrgRole | undefined) => role === "owner" || role === "admin";

interface OrgLike {
  role: OrgRole;
  locations: { id: string; role: LocationRole }[];
}

/** Locations this person can manage (all of them for admins). */
export function managedLocations<T extends OrgLike>(org: T | null): T["locations"] {
  if (!org) return [];
  return isOrgAdmin(org.role) ? org.locations : org.locations.filter((l) => l.role === "manager");
}

/**
 * Anyone can create their first organization; after that only owners and
 * admins can create more. Matches OrganizationsService.assertCanCreateOrg.
 */
export function canCreateOrg(orgs: { role: OrgRole }[]): boolean {
  return orgs.length === 0 || orgs.some((o) => isOrgAdmin(o.role));
}

/** What the person sees: the full dashboard, a manager's, or a staff member's. */
export function dashboardKind(org: OrgLike | null): "admin" | "manager" | "staff" {
  if (!org) return "staff";
  if (isOrgAdmin(org.role)) return "admin";
  return managedLocations(org).length > 0 ? "manager" : "staff";
}
