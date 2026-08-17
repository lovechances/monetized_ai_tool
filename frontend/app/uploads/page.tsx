"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingMessage } from "@/components/LoadingMessage";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  createAnalysisJob,
  getJob,
  getUploads,
  uploadFile,
  type Job,
  type Upload,
} from "@/lib/api";

const ALLOWED_EXTENSIONS = [".txt", ".md", ".csv", ".json"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function UploadsPage() {
  const { user, token, loading, error, logout } = useAuth();

  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const [jobErrors, setJobErrors] = useState<Record<number, string>>({});

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

async function pollJob(token: string, uploadId: number, jobId: number) {
  const interval = setInterval(async () => {
    try {
      const job = await getJob(token, jobId);

      setJobs((currentJobs) => ({
        ...currentJobs,
        [uploadId]: job,
      }));

      if (job.status === "completed" || job.status === "failed") {
        clearInterval(interval);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch job status.";

      setJobErrors((currentErrors) => ({
        ...currentErrors,
        [uploadId]: message,
      }));

      clearInterval(interval);
    }
  }, 1000);
}

async function handleAnalyze(uploadId: number) {
  if (!token) {
    return;
  }

  setJobErrors((currentErrors) => ({
    ...currentErrors,
    [uploadId]: "",
  }));

  try {
    const job = await createAnalysisJob(token, uploadId);

    setJobs((currentJobs) => ({
      ...currentJobs,
      [uploadId]: job,
    }));

    pollJob(token, uploadId, job.id);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to start analysis job.";

    setJobErrors((currentErrors) => ({
      ...currentErrors,
      [uploadId]: message,
    }));
  }
}

  useEffect(() => {
    async function loadUploads() {
      if (!token) {
        return;
      }

      setUploadsLoading(true);
      setUploadError("");

      try {
        const data = await getUploads(token);
        setUploads(data);
      } catch (err) {
        if (err instanceof Error) {
          setUploadError(err.message);
        } else {
          setUploadError("Failed to load uploads.");
        }
      } finally {
        setUploadsLoading(false);
      }
    }

    loadUploads();
  }, [token]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadError("");
    setUploadSuccess("");

    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = getFileExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);
      setUploadError(
        `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setUploadError("File is too large. Max size is 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setUploadError("You must be logged in.");
      return;
    }

    if (!selectedFile) {
      setUploadError("Choose a file first.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const newUpload = await uploadFile(token, selectedFile);

      setUploads((currentUploads) => [newUpload, ...currentUploads]);
      setUploadSuccess(`${newUpload.original_filename} uploaded successfully.`);
      setSelectedFile(null);

      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-6xl px-8 py-10">
          <LoadingMessage message="Loading uploads..." />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-6xl px-8 py-10">
          <ErrorMessage message={error} />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-8 py-10">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 underline">
            Back to dashboard
          </Link>

          <button
            onClick={logout}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <PageHeader
          level="Level 164"
          title="File Uploads"
          description={
            user
              ? `Upload and manage files for ${user.email}`
              : "Upload and manage files."
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleUpload}
            className="rounded-xl border border-gray-800 bg-gray-950 p-6"
          >
            <h2 className="text-2xl font-semibold">Upload File</h2>

            <p className="mt-2 text-sm text-gray-400">
              Allowed: .txt, .md, .csv, .json. Maximum size: 5 MB.
            </p>

            <label
              htmlFor="file-upload"
              className="mt-6 block text-sm font-medium text-gray-300"
            >
              Choose file
            </label>

            <input
              id="file-upload"
              type="file"
              accept=".txt,.md,.csv,.json"
              onChange={handleFileChange}
              className="mt-3 block w-full rounded-lg border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300"
            />

            {selectedFile && (
              <div className="mt-4 rounded-lg border border-gray-800 bg-black p-4">
                <p className="font-medium text-white">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>

            <div className="mt-4">
              <ErrorMessage message={uploadError} />
            </div>

            {uploadSuccess && (
              <div className="mt-4 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-300">
                {uploadSuccess}
              </div>
            )}
          </form>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Upload History</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Files saved to your account.
                </p>
              </div>

              <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
                {uploads.length} files
              </span>
            </div>

            {uploadsLoading && (
              <div className="mt-6">
                <LoadingMessage message="Loading uploaded files..." />
              </div>
            )}

            {!uploadsLoading && uploads.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  title="No uploaded files yet."
                  description="Choose a supported file and upload it to begin."
                />
              </div>
            )}

            {!uploadsLoading && uploads.length > 0 && (
              <div className="mt-6 space-y-4">
                {uploads.map((upload) => (
                  <UploadCard
                    key={upload.id}
                    upload={upload}
                    job={jobs[upload.id]}
                    jobError={jobErrors[upload.id] || ""}
                    onAnalyze={handleAnalyze}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function UploadCard({
  upload,
  job,
  jobError,
  onAnalyze,
}: {
  upload: Upload;
  job?: Job;
  jobError: string;
  onAnalyze: (uploadId: number) => void;
}) {

  const createdDate = new Date(upload.created_at).toLocaleString();

  const isWorking =
  job?.status === "queued" ||
  job?.status === "processing";

  return (
    <article className="rounded-xl border border-gray-800 bg-black p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Upload #{upload.id}
          </p>

          <h3 className="mt-1 text-lg font-semibold">
            {upload.original_filename}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {createdDate}
          </p>
        </div>

        <span className="w-fit rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
          {upload.file_type}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <UploadStat
          label="Size"
          value={formatFileSize(upload.file_size)}
        />

        <UploadStat
          label="MIME"
          value={upload.mime_type}
        />

        <UploadStat
          label="Owner"
          value={`User #${upload.user_id}`}
        />
      </div>

      <div className="mt-5 border-t border-gray-900 pt-5">
        <button
          onClick={() => onAnalyze(upload.id)}
          disabled={isWorking}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {isWorking ? "Analyzing..." : "Analyze File"}
        </button>

        {job && (
  <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">
    <p className="text-sm text-gray-500">
      Job #{job.id}
    </p>

    <p className="mt-2 text-sm text-gray-300">
      Status:{" "}
      <span className="font-medium text-white">
        {job.status}
      </span>
    </p>

    {job.status === "queued" && (
      <p className="mt-3 text-sm text-gray-400">
        Waiting to start...
      </p>
    )}

    {job.status === "processing" && (
      <p className="mt-3 text-sm text-gray-400">
        Analyzing file...
      </p>
    )}

    {job.status === "completed" && (
      <div className="mt-4">
        <p className="text-sm text-green-300">
          Analysis complete.
        </p>

        {job.report_id && (
          <Link
            href="/reports"
            className="mt-3 inline-block rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-white"
          >
            View Report #{job.report_id}
          </Link>
        )}
      </div>
    )}

    {job.status === "failed" && (
      <div className="mt-4">
        <ErrorMessage
          message={job.error_message ?? "Analysis failed."}
        />
      </div>
    )}
  </div>
)}

        {jobError && (
          <div className="mt-4">
            <ErrorMessage message={jobError} />
          </div>
        )}
      </div>
    </article>
  );
}

function UploadStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-900 bg-gray-950 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-all text-sm text-gray-300">{value}</p>
    </div>
  );
}

function getFileExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return filename.slice(lastDotIndex).toLowerCase();
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}