import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksPage from "../page";
import { beforeEach, describe, expect, test, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

type FetchResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

const createJsonResponse = <T,>(data: T, status = 200): FetchResponse<T> => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

describe("TasksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "test-token");
    process.env.NEXT_PUBLIC_API_URL = "http://localhost/api/v1";
  });

  test("renders tasks grouped by their columns", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            id: 1,
            title: "Alpha",
            description: "First task",
            due_date: "2025-01-10",
            column: "todo",
            done_at: null,
          },
          {
            id: 2,
            title: "Bravo",
            description: "Second task",
            due_date: "2025-01-12",
            column: "doing",
            done_at: null,
          },
        ]),
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TasksPage />);

    const todoColumn = await screen.findByTestId("column-todo");
    const doingColumn = screen.getByTestId("column-doing");

    expect(within(todoColumn).getByText("Alpha")).toBeInTheDocument();
    expect(within(doingColumn).getByText("Bravo")).toBeInTheDocument();
    expect(within(doingColumn).queryByText("Alpha")).not.toBeInTheDocument();
  });

  test("allows creating a new task through the modal", async () => {
    const newTask = {
      id: 7,
      title: "Launch",
      description: "Prepare launch docs",
      due_date: "2025-02-01",
      column: "doing" as const,
      done_at: null,
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse([]))
      .mockResolvedValueOnce(createJsonResponse(newTask, 201));

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TasksPage />);

    const user = userEvent.setup();

    await screen.findByText(/create your first task/i);

    await user.click(screen.getByRole("button", { name: /add task/i }));

    const modal = await screen.findByTestId("task-form-modal");
    expect(modal).toBeInTheDocument();

    await user.type(screen.getByLabelText(/title/i), newTask.title);
    await user.type(
      screen.getByLabelText(/description/i),
      newTask.description,
    );
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2025-02-01" },
    });
    fireEvent.change(screen.getByLabelText(/column/i), {
      target: { value: "doing" },
    });

    await user.click(screen.getByRole("button", { name: /save task/i }));

    await screen.findByText(/task created successfully/i);
    await screen.findByText(newTask.title);

    const doingColumn = screen.getByTestId("column-doing");
    expect(within(doingColumn).getByText(newTask.title)).toBeInTheDocument();

    const requestBody = JSON.parse(
      (fetchMock.mock.calls[1][1] as RequestInit).body as string,
    );
    expect(requestBody).toEqual({
      task: {
        title: newTask.title,
        description: newTask.description,
        due_date: "2025-02-01",
        column: "doing",
      },
    });
  });

  test("moves a task between columns with the move buttons", async () => {
    const task = {
      id: 3,
      title: "Charlie",
      description: "QA",
      due_date: "2025-03-05",
      column: "todo" as const,
      done_at: null,
    };

    const updatedTask = { ...task, column: "doing" as const };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse([task]))
      .mockResolvedValueOnce(createJsonResponse(updatedTask));

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TasksPage />);

    const user = userEvent.setup();

    await screen.findByText(task.title);

    await user.click(screen.getByRole("button", { name: /move to doing/i }));

    await screen.findByText(/moved "charlie" to doing\./i);

    const doingColumn = screen.getByTestId("column-doing");
    expect(within(doingColumn).getByText(task.title)).toBeInTheDocument();

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  test("deletes a task and updates local state", async () => {
    const task = {
      id: 11,
      title: "Delta",
      description: "Cleanup",
      due_date: "2025-04-01",
      column: "test" as const,
      done_at: null,
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse([task]))
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}) as unknown,
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TasksPage />);

    const user = userEvent.setup();

    await screen.findByText(task.title);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await screen.findByText(/deleted "delta"\./i);

    expect(screen.queryByText(task.title)).not.toBeInTheDocument();
  });

  test("redirects to login and clears token on 401 responses", async () => {
    localStorage.setItem("token", "expired-token");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse({ error: "Token expired" }, 401),
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TasksPage />);

    await screen.findByText(/token expired/i);

    expect(localStorage.getItem("token")).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
