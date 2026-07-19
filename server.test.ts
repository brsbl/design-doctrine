import { describe, expect, it } from "vitest";

import { loadDoctrine, searchDoctrine } from "./server";

describe("design doctrine library", () => {
  it("loads the Markdown rules directly", async () => {
    const library = await loadDoctrine(process.cwd());

    expect(library.rules).toHaveLength(33);
    expect(library.status_counts).toEqual({ active: 33 });
    expect(new Set(library.rules.map((rule) => rule.id)).size).toBe(33);
    expect(library.rules.every((rule) => rule.canonical_path.endsWith(".md"))).toBe(true);
    expect(library.domains).toContain("interaction");
  });

  it("searches rule content with AND semantics", async () => {
    const library = await loadDoctrine(process.cwd());
    const results = searchDoctrine(library.rules, "compact utilities");

    expect(results.map((rule) => rule.id)).toContain("ddr_001");
  });

  it("uses scoped single-episode rules without an approval queue", async () => {
    const library = await loadDoctrine(process.cwd());
    const results = searchDoctrine(library.rules, "explicit click");
    const rule = library.rules.find((item) => item.id === "ddr_011");

    expect(results.map((item) => item.id)).toContain("ddr_011");
    expect(rule?.status).toBe("active");
    expect(rule?.confidence).toBe("medium");
  });

  it("keeps published evidence free of private bb locators", async () => {
    const library = await loadDoctrine(process.cwd());
    const evidence = library.rules.flatMap((rule) => rule.evidence).join("\n");

    expect(evidence).not.toMatch(/\b(?:thr|proj|env)_[a-z0-9_-]+\b/i);
    expect(evidence).not.toContain("/Users/");
  });
});
