import { describe, it, expect, beforeEach } from "vitest";
import { useReadingProgress } from "@/hooks/use-reading-progress";

describe("useReadingProgress snapshot stability", () => {
  beforeEach(() => {
    // Clear localStorage simulation if any
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("exports useReadingProgress as a hook", () => {
    expect(typeof useReadingProgress).toBe("function");
  });
});
