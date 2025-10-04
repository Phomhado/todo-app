"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import AuthLayout from "../components/AuthLayout";

type FormState = {
  email: string;
  password: string;
};

type ErrorPayload = {
  errors?: string[];
  error?: string;
  message?: string;
};

const extractErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const details = payload as ErrorPayload;

  if (Array.isArray(details.errors) && details.errors.length > 0) {
    return details.errors[0];
  }

  return details.error ?? details.message ?? undefined;
};

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({ ...previous, [target.name]: target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("API URL is not configured.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const payload: unknown = await response
        .json()
        .catch(() => ({ message: "Unable to parse server response." }));

      if (!response.ok) {
        setError(extractErrorMessage(payload) || "Failed to login.");
        return;
      }

      const token =
        payload && typeof payload === "object"
          ? (payload as { token?: string }).token
          : undefined;

      if (!token) {
        setError("Login succeeded but no token was returned.");
        return;
      }

      localStorage.setItem("token", token);
      setSuccess("Logged in successfully!");
      setForm({ email: "", password: "" });
      router.push("/tasks");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while logging in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      <p className="text-center text-sm text-gray-400">Access your account</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-300" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your password"
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center">{success}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>

        <p className="mt-4 text-sm text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
