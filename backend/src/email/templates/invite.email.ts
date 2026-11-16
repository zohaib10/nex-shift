import type { EmailContent } from '../email.service';
import type { InviteRole } from '../../organizations/roles';
import { emailButton, emailLayout, escapeHtml, frontendUrl } from './layout';

export function inviteEmail({
  token,
  orgName,
  locationNames,
  role,
}: {
  token: string;
  orgName: string;
  locationNames: string[];
  role: InviteRole;
}): EmailContent {
  const acceptLink = frontendUrl(`/invite?token=${token}`);
  const locationLabel =
    locationNames.length > 1
      ? `${locationNames.slice(0, -1).join(', ')} and ${locationNames[locationNames.length - 1]}`
      : locationNames[0];
  const asRole = role === 'manager' ? 'a manager' : 'a staff member';
  // Admins join the whole organization, so the email names the org, not locations.
  const what =
    role === 'admin'
      ? {
          text: `${orgName} as an admin`,
          html: `<strong>${escapeHtml(orgName)}</strong> as an admin`,
        }
      : {
          text: `${locationLabel} (${orgName}) as ${asRole}`,
          html: `<strong>${escapeHtml(locationLabel)}</strong> (${escapeHtml(orgName)}) as ${asRole}`,
        };

  return {
    subject: `You've been invited to join ${orgName} on NexShift`,
    text: `You've been invited to join ${what.text} on NexShift.\n\nAccept the invitation: ${acceptLink}\n\nThis invitation expires in 7 days.`,
    html: emailLayout(
      `
      <h1 style="color: #07090E; margin-bottom: 8px;">You're invited</h1>
      <p>You've been invited to join ${what.html} on NexShift.</p>
      ${emailButton(acceptLink, 'Accept Invitation')}
      <p style="color: #999; font-size: 13px;">This invitation expires in 7 days. If you didn't expect this, you can safely ignore it.</p>
    `,
      520,
    ),
  };
}
