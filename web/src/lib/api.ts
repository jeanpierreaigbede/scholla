const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_ENABLED = !!API_BASE;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("schola_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_ENABLED || !API_BASE) {
    // UI-only mode: no real backend. Return an empty object so screens can render statically.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[SCHOLA] Backend API disabled, returning mock empty data for", path);
    }
    return {} as T;
  }
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    full_name: string;
    school_name?: string;
  }) =>
    API_ENABLED
      ? api<{ user_id: number; email: string; message: string }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({
          user_id: 1,
          email: data.email,
          message: "Mock signup (UI-only mode)",
        }),

  verifyOtp: (data: { email: string; code: string }) =>
    API_ENABLED
      ? api<{ access_token: string; token_type: string }>("/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({
          access_token: "mock-token",
          token_type: "bearer",
        }),

  login: (data: { email: string; password: string }) =>
    API_ENABLED
      ? api<{ access_token: string; token_type: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({
          access_token: "mock-token",
          token_type: "bearer",
        }),
};

export const usersApi = {
  me: () =>
    API_ENABLED
      ? api<{
          id: number;
          email: string;
          full_name: string;
          school_name: string | null;
          role: string;
          is_verified: boolean;
        }>("/users/me")
      : Promise.resolve({
          id: 1,
          email: "student@example.com",
          full_name: "Mock Student",
          school_name: "Mock SHS",
          role: "student",
          is_verified: true,
        }),
};
