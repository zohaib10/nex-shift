/** The cached profile in localStorage ("rosta_session"); see lib/session.ts. */
export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
