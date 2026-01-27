# Made by Punks

A community-curated directory of projects, tools, and art inspired by CryptoPunks. Celebrating builders who keep the punk spirit alive.

## Project Structure

This project uses a **content-driven architecture** where all punk and project data is stored in markdown files with YAML frontmatter. This makes it easy for anyone to contribute by simply adding or editing markdown files.

```
madebypunks/
├── content/
│   └── punks/
│       └── [punkId]/           # Folder for each punk (e.g., 2113/)
│           ├── index.md        # Punk metadata
│           └── [project].md    # One file per project
├── src/
│   ├── app/                    # Next.js pages
│   ├── components/             # React components
│   ├── data/
│   │   └── punks.ts            # Data loading utility
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript types
└── public/                     # Static assets
```

## Add Your Project

Building something with Punks? Add it to the directory:

### 1. Create Your Punk Folder

Create a folder in `content/punks/` with your punk ID:

```
content/punks/1234/
```

### 2. Add Punk Metadata

Create an `index.md` file with your punk's info:

```md
---
name: Your Name
twitter: your_twitter_handle
website: https://your-website.com
---
```

#### Punk Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name for the punk owner |
| `twitter` | No | Twitter/X handle (without @) |
| `website` | No | Personal website URL |

### 3. Add Your Projects

Create a markdown file for each project (e.g., `my-project.md`):

```md
---
name: My Project
description: A brief description of what the project does.
thumbnail: https://example.com/logo.png
url: https://my-project.com
launchDate: 2024-01-15
tags:
  - Tool
  - Art
  - Community
twitter: project_twitter
github: https://github.com/user/repo
discord: https://discord.gg/invite
---

Optional longer description in markdown.
```

#### Project Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Project name |
| `description` | Yes | Short description (1-2 sentences) |
| `url` | Yes | Project URL |
| `launchDate` | Yes | Launch date in YYYY-MM-DD format |
| `tags` | Yes | Array of tags (e.g., Tool, Art, Community) |
| `thumbnail` | No | URL to project logo/thumbnail |
| `twitter` | No | Project's Twitter/X handle |
| `github` | No | GitHub repository URL |
| `discord` | No | Discord invite URL |
| `hidden` | No | Set to `true` to hide from listings |

### 4. Submit a PR

Fork this repository, add your files, and submit a pull request!

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - YAML frontmatter parsing
- Dynamic OG images with `next/og`

## Colors

The design uses the official CryptoPunks color palette:
- Punk Blue: `#638696`
- Punk Pink: `#ff69b4`

## Deploy

Deploy on [Vercel](https://vercel.com) with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gwendall/madebypunks)

## License

MIT
