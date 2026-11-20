import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface CreateOrgPayload {
  name: string;
  type: string;
  typeOther?: string;
  phone?: string;
  website?: string;
  locationName: string;
  address?: string;
  city?: string;
  state?: string;
  timezone?: string;
  promoId?: string;
  /** Invited as staff to the first location once the org exists. Not sent to POST /organizations. */
  inviteEmails?: string[];
}

export interface CreateOrgResponse {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  plan: string;
  maxMembers: number;
  createdAt: string;
  /** The first location, created with the org. */
  locations: { id: string; name: string }[];
  /** Invite emails the invite endpoint rejected. */
  failedInvites: string[];
}

export function useCreateOrg() {
  return useMutation<CreateOrgResponse, AxiosError<{ message: string }>, CreateOrgPayload>({
    mutationFn: async ({ inviteEmails = [], ...payload }) => {
      const { data } = await api.post<Omit<CreateOrgResponse, "failedInvites">>("/organizations", payload);
      // Same path as inviting from the dashboard, so these show in Team Invites
      // and join the location when accepted. One failure doesn't stop the rest.
      const locationIds = data.locations.map((l) => l.id);
      const results = await Promise.allSettled(
        inviteEmails.map((email) => api.post(`/organizations/${data.id}/invite`, { email, locationIds, role: "staff" }))
      );
      const failedInvites = inviteEmails.filter((_, i) => results[i].status === "rejected");
      return { ...data, failedInvites };
    },
  });
}
