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

  it("leaves out placeholder contact details", () => {
    expect(prompt).not.toContain("XX-XXX");
  });
});
