import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { createElement, type ComponentProps } from "react";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  },
});

// Mock Next.js Link to behave like a standard anchor in tests.
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: ComponentProps<"a">) =>
    createElement("a", { href, ...rest }, children),
}));
