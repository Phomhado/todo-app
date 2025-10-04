"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import AuthLayout from "../components/AuthLayout";

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type PasswordVisibility = {
  password: boolean;
  confirmPassword: boolean;
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

// Define o schema com Zod
const SignUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const [form, setForm] = useState<SignUpForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState<PasswordVisibility>({
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({ ...previous, [target.name]: target.value }));
  };

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const result = SignUpSchema.safeParse(form);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Invalid data";
      setError(firstError);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("API URL is not configured.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: form.name,
            email: form.email,
            password: form.password,
          },
        }),
      });

      const payload: unknown = await response
        .json()
        .catch(() => ({ message: "Unable to parse server response." }));

      if (!response.ok) {
        setError(extractErrorMessage(payload) || "Failed to create account.");
        return;
      }

      setSuccess("Account created successfully!");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An error occurred while creating the account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      <p className="text-center text-sm text-gray-400">
        Create a new account to start managing your tasks.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-300" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300" htmlFor="email">
            Email
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
          <div className="relative">
            <input
              id="password"
              type={showPassword.password ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your password"
              required
              autoComplete="new-password"
            />
            <span
              onClick={() => togglePasswordVisibility("password")}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  togglePasswordVisibility("password");
                }
              }}
            >
              {showPassword.password ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-300"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
            />
            <span
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  togglePasswordVisibility("confirmPassword");
                }
              }}
            >
              {showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center">{success}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
