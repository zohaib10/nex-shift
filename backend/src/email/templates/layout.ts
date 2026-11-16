/** Escape user-provided text (names, org names) before putting it into email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** The shared wrapper every NexShift email uses. `body` is trusted HTML. */
export function emailLayout(body: string, maxWidth = 500): string {
  return `
    <div style="font-family: 'Helvetica Neue', sans-serif; max-width: ${maxWidth}px; margin: 0 auto; color: #333;">
      ${body}
    </div>
  `;
}

/** The green call-to-action button. `href` must be a URL we built. */
export function emailButton(href: string, label: string): string {
  return `
    <p style="margin: 32px 0;">
      <a href="${href}" style="background-color: #00D48A; color: #07090E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">${label}</a>
    </p>
  `;
}

export function frontendUrl(path: string): string {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}${path}`;
}
