import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock Next.js Link to behave like a standard anchor in tests.
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
