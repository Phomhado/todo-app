"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  column: ColumnKey;
  done_at: string | null;
}

type ColumnKey = "todo" | "doing" | "test" | "done";

type TaskFormValues = {
  title: string;
  description: string;
  due_date: string;
  column: ColumnKey;
};

const COLUMNS: { id: ColumnKey; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "doing", label: "Doing" },
  { id: "test", label: "Test" },
  { id: "done", label: "Done" },
];

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

const formatForInput = (value: string) => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
};

type ApiErrorPayload = {
  error?: string;
  errors?: string[];
  message?: string;
};

type ApiResult<T> = {
  data?: T;
  error?: string;
  status: number;
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

const DEFAULT_FORM_VALUES: TaskFormValues = {
  title: "",
  description: "",
  due_date: "",
  column: "todo",
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<TaskFormValues>(
    DEFAULT_FORM_VALUES,
  );
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleUnauthorized = useCallback(
    (message: string) => {
      localStorage.removeItem("token");
      setTasks([]);
      setError(message);
      setActionError(message);
      router.push("/login");
    },
    [router],
  );

  const apiRequest = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<ApiResult<T>> => {
      if (!apiUrl) {
        return { status: 0, error: "API URL is not configured." };
      }

      const token = localStorage.getItem("token");

      if (!token) {
        handleUnauthorized(MISSING_TOKEN_MESSAGE);
        return { status: 401, error: MISSING_TOKEN_MESSAGE };
      }

      try {
        const response = await fetch(`${apiUrl}${path}`, {
          ...init,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
        });

        let payload: unknown = null;

        if (response.status !== 204) {
          payload = await response
            .json()
            .catch(() => ({ message: "Unable to parse server response." }));
        }

        if (!response.ok) {
          const message =
            extractErrorMessage(payload) ||
            (response.status === 401
              ? UNAUTHORIZED_MESSAGE
              : "Request failed.");

          if (response.status === 401) {
            handleUnauthorized(message);
          }

          return { status: response.status, error: message };
        }

        return { status: response.status, data: payload as T };
      } catch (err) {
        console.error("API request failed:", err);
        return {
          status: 0,
          error: "Network error. Please try again.",
        };
      }
    },
    [apiUrl, handleUnauthorized],
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (actionMessage) {
      timeoutId = setTimeout(() => {
        setActionMessage("");
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [actionMessage]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (actionError) {
      timeoutId = setTimeout(() => {
        setActionError("");
      }, 7000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [actionError]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!apiUrl) {
        setError("API URL is not configured.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      setActionError("");

      const result = await apiRequest<Task[]>("/tasks");

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (Array.isArray(result.data)) {
        setTasks(result.data);
        setError("");
      } else {
        setError("Unexpected response from the server.");
      }

      setIsLoading(false);
    };

    void fetchTasks();
  }, [apiUrl, apiRequest]);

  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce<Record<ColumnKey, Task[]>>((acc, column) => {
      acc[column.id] = tasks.filter((task) => task.column === column.id);
      return acc;
    }, { todo: [], doing: [], test: [], done: [] });
  }, [tasks]);

  const closeForm = () => {
    setIsFormOpen(false);
    setFormError("");
    setFormValues(DEFAULT_FORM_VALUES);
    setActiveTaskId(null);
    setIsSubmitting(false);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setFormValues(DEFAULT_FORM_VALUES);
    setFormError("");
    setActiveTaskId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setFormMode("edit");
    setFormValues({
      title: task.title,
      description: task.description,
      due_date: formatForInput(task.due_date),
      column: task.column,
    });
    setFormError("");
    setActiveTaskId(task.id);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    setFormError("");

    if (formMode === "create") {
      const result = await apiRequest<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({ task: values }),
      });

      setIsSubmitting(false);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.data) {
        setTasks((prev) => [...prev, result.data as Task]);
        setActionMessage("Task created successfully.");
        closeForm();
        return;
      }

      setFormError("Unexpected response from the server.");
      return;
    }

    if (formMode === "edit" && activeTaskId !== null) {
      const result = await apiRequest<Task>(`/tasks/${activeTaskId}`, {
        method: "PATCH",
        body: JSON.stringify({ task: values }),
      });

      setIsSubmitting(false);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.data) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === activeTaskId ? (result.data as Task) : task,
          ),
        );
        setActionMessage("Task updated successfully.");
        closeForm();
        return;
      }

      setFormError("Unexpected response from the server.");
    }

    setIsSubmitting(false);
  };

  const handleMove = async (task: Task, targetColumn: ColumnKey) => {
    setActionError("");
    setActionMessage("");

    const result = await apiRequest<Task>(`/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ task: { column: targetColumn } }),
    });

    if (result.error) {
      setActionError(result.error);
      return;
    }

    if (result.data) {
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? (result.data as Task) : item)),
      );
      const columnLabel =
        COLUMNS.find((column) => column.id === targetColumn)?.label ??
        targetColumn;
      setActionMessage(`Moved "${task.title}" to ${columnLabel}.`);
      return;
    }

    setActionError("Unexpected response from the server.");
  };

  const handleDelete = async (task: Task) => {
    setActionError("");
    setActionMessage("");

    const result = await apiRequest<null>(`/tasks/${task.id}`, {
      method: "DELETE",
    });

    if (result.error) {
      setActionError(result.error);
      return;
    }

    if (result.status === 204) {
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      setActionMessage(`Deleted "${task.title}".`);
      return;
    }

    setActionError("Unexpected response from the server.");
  };

  const hasConfiguredApi = Boolean(apiUrl);

  return (
    <main className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Your Tasks</h1>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          Add task
        </button>
      </div>

      {isLoading && (
        <p className="mt-6 text-gray-400" role="status">
          Loading tasks...
        </p>
      )}

      {!isLoading && error && (
        <p className="mt-6 text-red-500" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && !tasks.length && (
        <p className="mt-6 text-sm text-gray-400">
          Create your first task to populate the board.
        </p>
      )}

      {actionError && (
        <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      {actionMessage && (
        <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {actionMessage}
        </p>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column, columnIndex) => {
          const columnTasks = groupedTasks[column.id];
          const isFirstColumn = columnIndex === 0;
          const isLastColumn = columnIndex === COLUMNS.length - 1;

          return (
            <div
              key={column.id}
              className="flex min-h-[18rem] flex-col rounded-lg border border-gray-700 bg-gray-900/60"
              data-testid={`column-${column.id}`}
            >
              <header className="border-b border-gray-800 p-4">
                <h2 className="text-lg font-semibold text-gray-100">
                  {column.label}
                  <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                    {columnTasks.length}
                  </span>
                </h2>
              </header>
              <div className="flex-1 space-y-3 p-4">
                {columnTasks.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No tasks in this column yet.
                  </p>
                )}

                {columnTasks.map((task) => {
                  const currentIndex = columnIndex;
                  const previousColumn =
                    currentIndex > 0 ? COLUMNS[currentIndex - 1] : undefined;
                  const nextColumn =
                    currentIndex < COLUMNS.length - 1
                      ? COLUMNS[currentIndex + 1]
                      : undefined;

                  return (
                    <article
                      key={task.id}
                      className="space-y-3 rounded-md border border-gray-700 bg-gray-800 p-4 shadow-sm"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          {task.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          {task.description || "No description provided."}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        <p>
                          Due: <span className="text-gray-200">{task.due_date ? formatDueDate(task.due_date) : "No due date"}</span>
                        </p>
                        <p className="capitalize">Status: {task.column}</p>
                        {task.done_at && (
                          <p className="text-emerald-400">
                            Completed on {formatDueDate(task.done_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {previousColumn && (
                          <button
                            type="button"
                            onClick={() => handleMove(task, previousColumn.id)}
                            className="rounded-md border border-gray-600 px-3 py-1 text-xs font-semibold text-gray-200 hover:border-gray-400 hover:text-white"
                          >
                            Move to {previousColumn.label}
                          </button>
                        )}
                        {nextColumn && (
                          <button
                            type="button"
                            onClick={() => handleMove(task, nextColumn.id)}
                            className="rounded-md border border-gray-600 px-3 py-1 text-xs font-semibold text-gray-200 hover:border-gray-400 hover:text-white"
                          >
                            Move to {nextColumn.label}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditForm(task)}
                          className="rounded-md border border-blue-400/40 px-3 py-1 text-xs font-semibold text-blue-200 hover:border-blue-300 hover:text-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task)}
                          className="rounded-md border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-300 hover:border-red-400 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {!isLoading && !hasConfiguredApi && (
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

      <TaskFormModal
        isOpen={isFormOpen}
        title={formMode === "create" ? "Create task" : "Edit task"}
        values={formValues}
        error={formError}
        isSubmitting={isSubmitting}
        onClose={closeForm}
        onChange={setFormValues}
        onSubmit={handleFormSubmit}
      />
    </main>
  );
}

type TaskFormModalProps = {
  isOpen: boolean;
  title: string;
  values: TaskFormValues;
  error: string;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (values: TaskFormValues) => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

function TaskFormModal({
  isOpen,
  title,
  values,
  error,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: TaskFormModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleChange = <Field extends keyof TaskFormValues>(
    field: Field,
    value: TaskFormValues[Field],
  ) => {
    onChange({ ...values, [field]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      data-testid="task-form-modal"
    >
      <div className="w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-300 hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label htmlFor="task-title" className="text-sm font-medium text-gray-200">
              Title
            </label>
            <input
              id="task-title"
              name="title"
              value={values.title}
              onChange={(event) => handleChange("title", event.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="task-description"
              className="text-sm font-medium text-gray-200"
            >
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={values.description}
              onChange={(event) => handleChange("description", event.target.value)}
              className="h-24 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="task-due-date" className="text-sm font-medium text-gray-200">
                Due date
              </label>
              <input
                id="task-due-date"
                name="due_date"
                type="date"
                value={values.due_date}
                onChange={(event) => handleChange("due_date", event.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="task-column" className="text-sm font-medium text-gray-200">
                Column
              </label>
              <select
                id="task-column"
                name="column"
                value={values.column}
                onChange={(event) =>
                  handleChange("column", event.target.value as ColumnKey)
                }
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {COLUMNS.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
