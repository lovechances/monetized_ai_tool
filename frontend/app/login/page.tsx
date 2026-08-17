"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginUser } from "@/lib/api";

import { ErrorMessage } from "@/components/ErrorMessage";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
  setError("Email is required.");
  return;
  }

  if (!password.trim()) {
    setError("Password is required.");
    return;
  }

    setLoading(true);
    setError("");

    try {
      const tokenData = await loginUser(email, password);

      localStorage.setItem("token", tokenData.access_token);

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-8">
        <p className="mb-2 text-sm text-gray-400">Welcome back</p>

        <h1 className="text-4xl font-bold">Login</h1>

        <p className="mt-4 text-gray-400">
          Login with your backend account and save your JWT token.
        </p>

        <form
          onSubmit={handleLogin}
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
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>

        <p className="mt-6 text-sm text-gray-400">
          Need an account?{" "}
          <Link href="/signup" className="text-white underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}