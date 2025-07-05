"use client";

import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = SignUpSchema.safeParse(form);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Invalid data";
      setError(firstError);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:3001/api/v1/users', {
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

      if (res.ok) {
        setSuccess("Account created successfully!");
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        const err = await res.json();
        setError(err.errors?.[0] || "Failed to create account.");
      }
    } catch {
      setError("An error occurred while creating the account.");
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      <p className="text-center text-sm text-gray-400">
        Create a new account to start managing your tasks.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your password"
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat your password"
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center">{success}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Account
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-400">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
