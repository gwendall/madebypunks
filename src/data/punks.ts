import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Punk, Project } from "@/types";

const punksDirectory = path.join(process.cwd(), "content/punks");

/**
 * Punk frontmatter schema (index.md)
 */
interface PunkFrontmatter {
  name?: string;
  twitter?: string;
  website?: string;
}

/**
 * Project frontmatter schema (*.md except index.md)
 */
interface ProjectFrontmatter {
  name: string;
  description: string;
  thumbnail?: string;
  url: string;
  launchDate: string;
  tags: string[];
  twitter?: string;
  github?: string;
  discord?: string;
  hidden?: boolean;
}

/**
 * Load a single punk by ID from the content folder
 */
function loadPunk(punkId: number): Punk | null {
  const punkDir = path.join(punksDirectory, String(punkId));

  if (!fs.existsSync(punkDir)) {
    return null;
  }

  // Load punk metadata from index.md
  const indexPath = path.join(punkDir, "index.md");
  let punkData: PunkFrontmatter = {};

  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, "utf8");
    const { data } = matter(indexContent);
    punkData = data as PunkFrontmatter;
  }

  // Load all project files (*.md except index.md)
  const files = fs.readdirSync(punkDir);
  const projects: Project[] = files
    .filter((file) => file.endsWith(".md") && file !== "index.md")
    .map((file) => {
      const filePath = path.join(punkDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContent);
      const projectData = data as ProjectFrontmatter;

      // Skip hidden projects
      if (projectData.hidden) {
        return null;
      }

      const id = file.replace(/\.md$/, "");

      return {
        id,
        name: projectData.name,
        description: projectData.description,
        thumbnail: projectData.thumbnail,
        url: projectData.url,
        launchDate: projectData.launchDate,
        tags: projectData.tags || [],
        twitter: projectData.twitter,
        github: projectData.github,
        discord: projectData.discord,
      } as Project;
    })
    .filter((project): project is Project => project !== null);

  return {
    id: punkId,
    name: punkData.name,
    twitter: punkData.twitter,
    website: punkData.website,
    projects,
  };
}

/**
 * Load all punks from the content folder
 */
function loadAllPunks(): Punk[] {
  if (!fs.existsSync(punksDirectory)) {
    return [];
  }

  const punkDirs = fs.readdirSync(punksDirectory);

  return punkDirs
    .filter((dir) => {
      const dirPath = path.join(punksDirectory, dir);
      return fs.statSync(dirPath).isDirectory() && /^\d+$/.test(dir);
    })
    .map((dir) => loadPunk(parseInt(dir, 10)))
    .filter((punk): punk is Punk => punk !== null)
    .sort((a, b) => a.id - b.id);
}

// Load punks once at build time
const PUNKS: Punk[] = loadAllPunks();

export default PUNKS;

// Helper functions (for backwards compatibility)
export function getAllPunks(): number[] {
  return PUNKS.map((punk) => punk.id);
}

export function getPunkById(id: number): Punk | undefined {
  return PUNKS.find((punk) => punk.id === id);
}

export function getAllProjects() {
  return PUNKS.flatMap((punk) =>
    punk.projects.map((project) => ({
      ...project,
      punkId: punk.id,
      punkName: punk.name,
    }))
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  PUNKS.forEach((punk) => {
    punk.projects.forEach((project) => {
      project.tags.forEach((tag) => tags.add(tag));
    });
  });
  return Array.from(tags).sort();
}

export function getProjectsByTag(tag: string) {
  return getAllProjects().filter((project) =>
    project.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}
