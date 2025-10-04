"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  column: string;
  done_at: string | null;
}

const MISSING_TOKEN_MESSAGE = "Unauthorized. No token found.";
const UNAUTHORIZED_MESSAGE = "Your session has expired. Please log in again.";

const formatDueDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type ApiErrorPayload = {
  error?: string;
  errors?: string[];
  message?: string;
};

const extractErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const details = payload as ApiErrorPayload;

  if (Array.isArray(details.errors) && details.errors.length > 0) {
    return details.errors[0];
  }

  return details.error ?? details.message ?? undefined;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!apiUrl) {
        setError("API URL is not configured.");
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setError(MISSING_TOKEN_MESSAGE);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload: unknown = await response
          .json()
          .catch(() => ({ message: "Unable to parse server response." }));

        if (!response.ok) {
          const apiMessage = extractErrorMessage(payload);
          const fallbackMessage =
            response.status === 401
              ? UNAUTHORIZED_MESSAGE
              : "Failed to fetch tasks.";

          setError(apiMessage || fallbackMessage);

          if (response.status === 401) {
            localStorage.removeItem("token");
            setTasks([]);
          }

          return;
        }

        if (Array.isArray(payload)) {
          setTasks(payload as Task[]);
          setError("");
        } else {
          setError("Unexpected response from the server.");
        }
      } catch (err) {
        console.error("Fetch tasks error:", err);
        setError("Something went wrong while fetching tasks.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTasks();
  }, [apiUrl]);

  const hasTasks = tasks.length > 0;

  return (
    <main className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">Your Tasks</h1>

      {isLoading && (
        <p className="text-gray-400" role="status">
          Loading tasks...
        </p>
      )}

      {!isLoading && error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && !hasTasks && (
        <div className="rounded-md border border-dashed border-gray-700 bg-gray-900/40 p-6 text-center">
          <p className="text-gray-300">No tasks available yet.</p>
          <p className="text-sm text-gray-500">
            Head back to the dashboard to create your first task.
          </p>
        </div>
      )}

      {!isLoading && !error && hasTasks && (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-md border border-gray-700 bg-gray-800 p-4 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <p className="mt-2 text-sm text-gray-300">{task.description}</p>
              <p className="mt-2 text-sm text-gray-400">Status: {task.column}</p>
              <p className="text-sm text-gray-500">
                Due: <span className="font-medium text-gray-300">{formatDueDate(task.due_date)}</span>
              </p>
              {task.done_at && (
                <p className="text-xs text-emerald-400">
                  Completed on {formatDueDate(task.done_at)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {!isLoading && !apiUrl && (
        <p className="mt-4 text-sm text-yellow-500">
          Configure <code className="rounded bg-gray-800 px-1 py-0.5">NEXT_PUBLIC_API_URL</code> to load your tasks.
        </p>
      )}

      {!isLoading &&
        (error === MISSING_TOKEN_MESSAGE || error === UNAUTHORIZED_MESSAGE) && (
        <p className="mt-4 text-sm text-gray-300">
          <Link href="/login" className="text-blue-400 underline">
            Log in
          </Link>{" "}
          to load your tasks.
        </p>
      )}
    </main>
  );
}
