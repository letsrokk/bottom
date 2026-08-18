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
  initials: "YN",
  heading: "Notes from a career in technology",
  bio: "I write about information technology, artificial intelligence, quality assurance, and software development through the lens of personal experience.",
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
  { owner: "your-username", repo: "example-app" },
  { owner: "your-username", repo: "example-service" },
];
