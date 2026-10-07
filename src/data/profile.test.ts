import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";

describe("profile content", () => {
  it("shows exactly three projects on the main page", () => {
    expect(profile.projects).toHaveLength(3);
  });

  it("has at least one item in every skill group", () => {
    for (const group of profile.skills) {
      expect(group.items.length, group.group).toBeGreaterThan(0);
    }
  });

  it("has no leftover [placeholder] text in the summary", () => {
    expect(profile.summary.join(" ")).not.toContain("[");
  });

  it("uses the real contact email", () => {
    expect(profile.contact.email).toBe("romanpu@gmail.com");
  });

  it("lists the most recent role first", () => {
    expect(profile.experience[0].company).toBe("Magshimim Cyber Programme");
  });
});
