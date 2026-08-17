const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
  let errorMessage = "Something went wrong.";

  try {
    const errorData = await response.json();

    if (typeof errorData.detail === "string") {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join(", ");
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message;
    }
  } catch {
    errorMessage = `Request failed with status ${response.status}`;
  }

  throw new Error(errorMessage);
}
  return response.json();
}

export type SystemStatus = {
  app_name: string;
  version: string;
  environment: string;
  database_ok: boolean;
  stripe_secret_configured: boolean;
  stripe_price_configured: boolean;
  stripe_webhook_configured: boolean;
  auth_enabled: boolean;
  billing_enabled: boolean;
};

export async function getSystemStatus() {
  return apiRequest<SystemStatus>("/system/status");
}

export type User = {
  id: number;
  email: string;
  plan: string;
  is_active: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function signupUser(email: string, password: string) {
  return apiRequest<User>("/auth/signup", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
}

export async function loginUser(email: string, password: string) {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest<User>("/auth/me", {
    token,
  });
}

export type SummarizeResponse = {
  user_id: number;
  email: string;
  summary: string;
  report_id?: number;
};

export type ProSummaryResponse = {
  user_id: number;
  email: string;
  plan: string;
  pro_summary: string;
};

export async function summarizeText(token: string, text: string) {
  return apiRequest<SummarizeResponse>("/ai/summarize", {
    method: "POST",
    token,
    body: {
      text,
    },
  });
}

export async function proSummarizeText(token: string, text: string) {
  return apiRequest<ProSummaryResponse>("/ai/pro-summary", {
    method: "POST",
    token,
    body: {
      text,
    },
  });
}

export type Report = {
  id: number;
  user_id: number;
  tool_type: string;
  input_summary: string;
  output_text: string;
  created_at: string;
};

export async function getReports(token: string) {
  return apiRequest<Report[]>("/reports/", {
    token,
  });
}

export async function getReport(token: string, reportId: number) {
  return apiRequest<Report>(`/reports/${reportId}`, {
    token,
  });
}

export type UsageStatus = {
  tool_name: string;
  plan: string;
  used: number;
  limit: number;
  remaining: number;
};

export type UsageAllResponse = {
  user_id?: number;
  email?: string;
  plan?: string;
  usage?: UsageStatus[];
  tools?: UsageStatus[];
};

export async function getAllUsage(token: string) {
  return apiRequest<UsageStatus[] | UsageAllResponse>("/usage/all", {
    token,
  });
}

export type CheckoutSessionResponse = {
  checkout_url?: string;
  url?: string;
  session_url?: string;
};

export async function createCheckoutSession(token: string) {
  return apiRequest<CheckoutSessionResponse>(
    "/billing/create-checkout-session",
    {
      method: "POST",
      token,
    }
  );
}

export type Upload = {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
};

export async function uploadFile(token: string, file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/uploads/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Upload failed.";

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      }
    } catch {
      errorMessage = `Upload failed with status ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<Upload>;
}

export async function getUploads(token: string) {
  return apiRequest<Upload[]>("/uploads/", {
    token,
  });
}

export type FileAnalysisResponse = {
  upload_id: number;
  report_id: number;
  user_id: number;
  email: string;
  filename: string;
  tool_type: string;
  analysis: string;
};

export async function analyzeUpload(token: string, uploadId: number) {
  return apiRequest<FileAnalysisResponse>(
    `/ai/analyze-upload/${uploadId}`,
    {
      method: "POST",
      token,
    }
  );
}

export type Job = {
  id: number;
  user_id: number;
  upload_id: number;
  report_id: number | null;
  job_type: string;
  status: "queued" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export async function createAnalysisJob(
  token: string,
  uploadId: number
) {
  return apiRequest<Job>(
    `/jobs/analyze-upload/${uploadId}`,
    {
      method: "POST",
      token,
    }
  );
}

export async function getJob(
  token: string,
  jobId: number
) {
  return apiRequest<Job>(
    `/jobs/${jobId}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function downloadReport(
  token: string,
  reportId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/reports/${reportId}/export`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download report.");
  }

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `report-${reportId}.txt`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}