import { getSession, type SessionUser } from "./session";

export type Permission =
  | "staff:manage" | "services:manage" | "tours:manage"
  | "requests:manage" | "requests:view-assigned" | "quotes:manage"
  | "reports:view" | "settings:manage";

const MATRIX: Record<SessionUser["role"], Permission[]> = {
  SUPER_ADMIN: ["staff:manage","services:manage","tours:manage","requests:manage","requests:view-assigned","quotes:manage","reports:view","settings:manage"],
  ADMIN: ["tours:manage","requests:manage","requests:view-assigned","quotes:manage","reports:view"],
  STAFF: ["requests:view-assigned"],
};

export const can = (role: SessionUser["role"], p: Permission) => MATRIX[role].includes(p);

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Call at the top of every admin route handler / server function. */
export async function requirePermission(p: Permission): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new HttpError(401, "Sign in required.");
  if (!can(session.role, p)) throw new HttpError(403, "You do not have permission to do this.");
  return session;
}

/** Same-origin check for state-changing requests (CSRF defence alongside SameSite=Lax). */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw new HttpError(403, "Cross-origin request blocked.");
  }
}
