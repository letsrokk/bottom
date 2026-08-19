export type App = {
  name: string;
  description?: string;
  url: string;
  status: "coming-soon";
};

export type ReleaseRepository = {
  owner: string;
  repo: string;
};

export const profile = {
  heading: "All Things Automation, Principal Quality Engineer and SDET",
  bio: "I write about engineering quality, software development, and artificial intelligence through the lens of personal experience.",
  image: "/profile.png",
  imageAlt: "Dmitry Mayer",
};

export const apps: App[] = [
  {
    name: "Example App",
    description: "Replace this entry with your first application.",
    url: "https://github.com/your-username/example-app",
    status: "coming-soon",
  },
  {
    name: "Example Service",
    description: "Replace this entry when your service is ready.",
    url: "https://github.com/your-username/example-service",
    status: "coming-soon",
  },
];

export const releaseRepositories: ReleaseRepository[] = [
  { owner: "letsrokk", repo: "bottom" },
];
