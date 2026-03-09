const DEFAULT_API_URL = "http://localhost:3001";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }

  return process.env.NEXT_PUBLIC_API_TOKEN || null;
}

type HttpOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

type ApiError = {
  message?: string | string[];
  error?: string;
};

function withQuery(path: string, query?: HttpOptions["query"]): string {
  if (!query) {
    return path;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function apiRequest<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${getApiBaseUrl()}${withQuery(path, options.query)}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    let message = `HTTP ${response.status}`;

    try {
      const body = (await response.json()) as ApiError;

      if (Array.isArray(body.message) && body.message.length > 0) {
        message = body.message.join(", ");
      } else if (typeof body.message === "string" && body.message.length > 0) {
        message = body.message;
      } else if (body.error) {
        message = body.error;
      }
    } catch {
      // Ignore invalid JSON response bodies.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
