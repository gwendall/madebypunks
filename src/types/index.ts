export interface Project {
  id: string; // Slug from filename
  name: string;
  description: string;
  body?: string; // Markdown content from the file
  thumbnail?: string; // Optional - will auto-fetch from URL's OG image if not provided
  url: string;
  launchDate: string;
  tags: string[];
  twitter?: string;
  github?: string;
  discord?: string;
  ded?: boolean; // Project is dead/discontinued
  featured?: boolean; // Featured projects appear first
  creators: number[]; // Punk IDs who built this project
}

export interface Punk {
  id: number;
  name?: string;
  twitter?: string;
  website?: string;
  body?: string; // Markdown content
}

export type PunksData = Record<number, Punk>;
