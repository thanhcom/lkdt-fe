export function getRolesFromToken(): string[] {
  if (typeof window === "undefined") return [];

  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const scopes = payload.scope?.split(" ") || [];

    return scopes.filter((s: string) => s.startsWith("ROLE_"));
  } catch (e) {
    return [];
  }
}
