import { access, readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import astroPaperConfig from "../../astro-paper.config";
import { profile } from "./site-data";

describe("public profile configuration", () => {
  test("uses Dmitry Mayer's identity and LinkedIn profile", () => {
    expect(astroPaperConfig.site).toMatchObject({
      url: "https://rokk.club/",
      title: "Dmitry Mayer",
      author: "Dmitry Mayer",
      profile: "https://www.linkedin.com/in/dmitry-mayer-71525477/",
    });
    expect(astroPaperConfig.socials).toEqual([
      {
        name: "linkedin",
        url: "https://www.linkedin.com/in/dmitry-mayer-71525477/",
      },
    ]);
  });

  test("uses the approved tagline and portrait", async () => {
    expect(profile).toMatchObject({
      heading: "All Things Automation, Principal Quality Engineer and SDET",
      image: "/profile.png",
      imageAlt: "Dmitry Mayer",
    });
    await expect(access("public/profile.png")).resolves.toBeUndefined();
  });

  test("configures the custom domain", async () => {
    await expect(readFile("public/CNAME", "utf8")).resolves.toBe("rokk.club\n");
  });
});
