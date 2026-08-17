"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signupUser } from "@/lib/api";

import { ErrorMessage } from "@/components/ErrorMessage";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
  setError("Email is required.");
  return;
  }

  if (!password.trim()) {
    setError("Password is required.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await signupUser(email, password);

      setSuccess(`Account created for ${user.email}. Redirecting to login...`);

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-8">
        <p className="mb-2 text-sm text-gray-400">Create account</p>

        <h1 className="text-4xl font-bold">Sign up</h1>

        <p className="mt-4 text-gray-400">
          Create a real backend user account.
        </p>

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-6"
        >
          <input
            className="w-full rounded-lg border border-gray-800 bg-black px-4 py-3 text-white"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border border-gray-800 bg-black px-4 py-3 text-white"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {success && <p className="text-sm text-green-400">{success}</p>}
        </form>

        <p className="mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}