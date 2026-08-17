"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { getReports, type Report } from "@/lib/api";

import { downloadReport } from "@/lib/api";

import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingMessage } from "@/components/LoadingMessage";
import { PageHeader } from "@/components/PageHeader";

export default function ReportsPage() {
  const { user, token, loading, error, logout } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    async function loadReports() {
      if (!token) {
        return;
      }

      setReportsLoading(true);
      setReportsError("");

      try {
        const data = await getReports(token);
        setReports(data);
      } catch (err) {
        if (err instanceof Error) {
          setReportsError(err.message);
        } else {
          setReportsError("Failed to load reports.");
        }
      } finally {
        setReportsLoading(false);
      }
    }

    loadReports();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <LoadingMessage message="Loading reports..." />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
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
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-8">
          <PageHeader
            level="Level 158"
            title="Reports"
            description={
              user ? `Saved AI outputs for ${user.email}` : "Saved AI outputs."
            }
          />
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Report History</h2>
              <p className="mt-2 text-sm text-gray-400">
                Reports are created when you run AI tools.
              </p>
            </div>

            <Link
              href="/tools"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Run AI Tool
            </Link>
          </div>

          {reportsLoading && (
            <p className="mt-6 text-gray-400">Loading saved reports...</p>
          )}

          {reportsError && (
            <p className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {reportsError}
            </p>
          )}

          {!reportsLoading && !reportsError && reports.length === 0 && (
            <div className="mt-6 rounded-lg border border-gray-800 bg-black p-6">
              <p className="text-gray-300">No reports yet.</p>
              <p className="mt-2 text-sm text-gray-500">
                Go to AI Tools, run a summary, then come back here.
              </p>
            </div>
          )}

          {!reportsLoading && !reportsError && reports.length > 0 && (
            <div className="mt-6 grid gap-4">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


function ReportCard({ report }: { report: Report }) {
  const { token } = useAuth();
  const createdDate = new Date(report.created_at).toLocaleString();

  async function handleDownload(reportId: number) {
    if (!token) {
      return;
    }

    try {
      await downloadReport(token, reportId);
    } catch (err) {
      console.error("Report download failed:", err);
    }
  }

  return (
    <article className="rounded-xl border border-gray-800 bg-black p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Report #{report.id}</p>

          <h3 className="mt-1 text-xl font-semibold text-white">
            {formatToolName(report.tool_type)}
          </h3>

          <p className="mt-2 text-sm text-gray-500">{createdDate}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-fit rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
            User #{report.user_id}
          </span>
          <button
            onClick={() => handleDownload(report.id)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:border-gray-500"
          >
            Download
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-400">Input Preview</p>
          <p className="mt-2 line-clamp-4 rounded-lg border border-gray-900 bg-gray-950 p-4 text-sm text-gray-300">
            {report.input_summary || "No input preview saved."}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-400">Output</p>
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-900 bg-gray-950 p-4 text-sm text-gray-300">
            {report.output_text}
          </p>
        </div>
      </div>
    </article>
  );
}

function formatToolName(toolType: string) {
  if (toolType === "summarize") {
    return "Summarize";
  }

  if (toolType === "pro_summary") {
    return "Pro Summary";
  }

  if (toolType === "file_analysis") {
  return "File Analysis";
  }

  return toolType;
}

