import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://rokk.club/",
    title: "Rokk Bottom",
    description: "All Things Automation, Principal Quality Engineer and SDET.",
    author: "Dmitry Mayer",
    profile: "https://www.linkedin.com/in/dmitry-mayer-71525477/",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Europe/Belgrade",
    dir: "ltr",
  },
  posts: {
    perPage: 5,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/letsrokk/bottom/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/dmitry-mayer-71525477/",
      linkTitle: "Dmitry Mayer on LinkedIn",
    },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
