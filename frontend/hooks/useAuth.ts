"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser, type User } from "@/lib/api";

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        setLoading(false);
        router.push("/login");
        return;
      }

      setToken(savedToken);

      try {
        const currentUser = await getCurrentUser(savedToken);
        setUser(currentUser);
      } catch (err) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setError("Session expired. Please log in again.");

        setTimeout(() => {
          router.push("/login");
        }, 800);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return {
    user,
    token,
    loading,
    error,
    logout,
  };
}