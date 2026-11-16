import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { RoleCard } from "./RoleCard";

export function RolesSection() {
  return (
    <div className="rev max-w-[1160px] mx-auto py-16 md:py-[88px] px-6 md:px-[52px]">
      <Text variant="eyebrow">Access Control</Text>
      <Heading variant="section">The right access for every role.</Heading>
      <Text variant="section">Owners and admins run the organization. Managers run their locations. Staff see their own shifts. Everyone sees only what they need.</Text>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-[18px] mt-10 md:mt-[52px]">
        <RoleCard
          tone="blue"
          badge="Owner & Admin"
          title="Admins"
          description="Full control of the organization: every location, the team and settings. The owner also decides who else gets admin access."
          points={["Add and manage locations", "Invite staff, managers and admins", "Change anyone's role or remove them", "Build & publish schedules everywhere", "Approve shift swaps & requests", "View analytics for every location"]}
        />
        <RoleCard
          tone="amber"
          badge="Manager"
          title="Managers"
          description="Run the locations they're responsible for, without seeing the rest of the organization."
          points={["Build & publish their location's schedule", "Invite staff to their locations", "Approve time off & shift swaps", "See invite history for their locations", "Work shifts elsewhere as staff"]}
        />
        <RoleCard
          tone="green"
          badge="Staff"
          title="Staff Members"
          description="A clean, focused view of their own schedule. Request changes, get notified, and stay in sync without the noise."
          points={["View personal schedule", "Request time off or shift swaps", "Receive real-time notifications", "See the locations they work at", "Submit availability preferences", "Access via web or mobile app"]}
        />
      </div>
    </div>
  );
}
