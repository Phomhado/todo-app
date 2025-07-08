'use client'

import { useState } from "react";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.email || !form.password) {
            setError("Email and password are required.");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.token); // 🔐 salva o token aqui

                setSuccess("Logged in successfully!");
                setForm({ email: "", password: "" });
            } else {
                const err = await res.json();
                setError(err.errors?.[0] || "Failed to login.");
            }
        } catch {
            setError("An error occurred while logging in.");
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
            <p className="text-center text-sm text-gray-400">
                Access your account
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-300">E-mail</label>
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
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your password"
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {success && <p className="text-sm text-green-500 text-center">{success}</p>}
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Log In
                </button>
                <p className="mt-4 text-sm text-center text-gray-400">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
}
