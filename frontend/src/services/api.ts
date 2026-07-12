const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function request(endpoint: string, options: RequestOptions = {}) {
  const token = localStorage.getItem("ecosphere_token");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // If response is unauthorized (401), we can trigger logout/redirect
  if (response.status === 401 && endpoint !== "/auth/login") {
    localStorage.removeItem("ecosphere_token");
    localStorage.removeItem("ecosphere_user");
    // Redirect to login if window is available
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.errors?.join(", ") || "An error occurred";
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: (endpoint: string, headers?: Record<string, string>) => request(endpoint, { method: "GET", headers }),
  post: (endpoint: string, body: any, headers?: Record<string, string>) => request(endpoint, { method: "POST", body, headers }),
  put: (endpoint: string, body: any, headers?: Record<string, string>) => request(endpoint, { method: "PUT", body, headers }),
  delete: (endpoint: string, headers?: Record<string, string>) => request(endpoint, { method: "DELETE", headers }),
};
