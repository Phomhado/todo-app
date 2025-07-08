'use client'

import { useEffect, useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  column: string;
  done_at: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Unauthorized. No token found.");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to fetch tasks.");
          return;
        }

        const data = await res.json();
        setTasks(data);
      } catch (err) {
        setError("Something went wrong while fetching tasks.");
      }
    };

    fetchTasks();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">Your Tasks</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <li key={task.id} className="bg-gray-800 p-4 rounded-md text-white border border-gray-700">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <p className="text-sm text-gray-300">{task.description}</p>
            <p className="text-sm text-gray-400 mt-2">Status: {task.column}</p>
            <p className="text-sm text-gray-500">Due: {task.due_date}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
