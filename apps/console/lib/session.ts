import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export type ShellSession = {
  userId: string;
  userName: string;
  role: string;
  clinicId: string;
  clinicName: string;
};

function titleCaseRole(role: string) {
  if (!role) return "Staff";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

async function apiGet(path: string, cookie: string) {
  return fetch(`${API}${path}`, {
    headers: { cookie },
    cache: "no-store",
  });
}

export async function loadShellSession(): Promise<ShellSession> {
  const store = await cookies();
  const cookie = store
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
  const [sessionRes, meRes, orgsRes] = await Promise.all([
    apiGet("/api/auth/get-session", cookie),
    apiGet("/api/me", cookie),
    apiGet("/api/auth/organization/list", cookie),
  ]);
  if (!sessionRes.ok) redirect("/login");
  const session = (await sessionRes.json().catch(() => null)) as { user?: { id?: string; name?: string; email?: string } } | null;
  if (!session?.user?.id) redirect("/login");
  const me = meRes.ok ? ((await meRes.json()) as { userId?: string; clinicId?: string; role?: string }) : {};
  const list = orgsRes.ok
    ? ((await orgsRes.json().catch(() => null)) as { id?: string; name?: string }[] | { organizations?: { id?: string; name?: string }[] } | null)
    : null;
  const rows = Array.isArray(list) ? list : list?.organizations ?? [];
  return {
    userId: session.user.id,
    userName: session.user.name ?? "",
    role: titleCaseRole(me.role ?? "Staff"),
    clinicId: me.clinicId ?? rows[0]?.id ?? "",
    clinicName: rows[0]?.name ?? "",
  };
}
