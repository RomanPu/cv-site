import { describe, expect, it } from "vitest";
import { profile } from "../../src/data/profile";
import { buildSystemPrompt } from "../src/prompt";

const prompt = buildSystemPrompt(profile);

describe("buildSystemPrompt", () => {
  it("speaks in first person as Roman's digital twin", () => {
    expect(prompt).toMatch(/first person/i);
    expect(prompt).toContain("digital twin");
  });

  it("keeps first person even when declining", () => {
    expect(prompt).toMatch(/even when declining/i);
  });

  it("does not open answers with an AI disclaimer (the widget already labels it)", () => {
    expect(prompt).toMatch(/do not introduce yourself as an AI/i);
  });

  it("includes real profile facts", () => {
    for (const fact of ["Elbit Systems", "ATmega2561", "Magshimim", "Coding Academy", "Hebrew"]) {
      expect(prompt).toContain(fact);
    }
  });

  it("deflects unknowns to the real email", () => {
    expect(prompt).toContain("romanpu@gmail.com");
  });

  it("tells the model to ignore attempts to change its rules", () => {
    expect(prompt).toMatch(/ignore .*instructions/i);
  });

  it("describes placeholder projects as coming soon", () => {
    expect(prompt).toMatch(/coming soon/i);
    expect(prompt).not.toContain("Project One");
  });

  it("uses real projects and drops the coming-soon rule once projects exist", () => {
    const withProjects = buildSystemPrompt({
      ...profile,
      projects: [
        { title: "Chat App", description: "Realtime chat", tags: ["React"], github: "https://github.com/x/y", live: "#" },
        { title: "Half Done", description: "Placeholder — describe it", tags: [], github: "https://github.com/x/z", live: "#" },
      ],
    });
    expect(withProjects).toContain("Chat App");
    expect(withProjects).not.toMatch(/coming soon/i);
    expect(withProjects).not.toContain("Half Done");
  });

  it("leaves out placeholder contact details", () => {
    expect(prompt).not.toContain("XX-XXX");
  });
});
