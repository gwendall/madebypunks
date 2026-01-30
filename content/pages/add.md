---
title: Join the Directory
---

# Join the Directory

Made by Punks is a directory of CryptoPunks holders and the works they create. Whether you've built something around punk culture or you just want to show the world who you are - this is your place.

**No project required.** If you hold a punk, you belong here.

---

## Two Paths

### Just want a profile?

Create your punk page and tell people who you are. Share your story, your links, your vibe. That's it.

### Built something?

Share your CryptoPunks-inspired work with the community:

- **Art** - Derivatives, remixes, animations, illustrations
- **Writing** - Books, essays, zines about punk culture
- **Film** - Documentaries, videos about the community
- **Music** - Soundtracks, albums inspired by punk aesthetics
- **Physical goods** - Prints, merch, collectibles
- **Tools** - Apps, explorers, utilities
- **Community projects** - Events, collabs, initiatives

If it's about punks and you made it, it belongs here.

---

## How to Join

### Option 1: Fill Out a Form (Easy)

Not comfortable with GitHub? No problem. Fill out [this form](https://github.com/madebypunks/directory/issues/new?template=submission.md&title=New+Submission) and we'll add you.

Just tell us:
- Your punk ID
- Your name (optional)
- Your links (Twitter, website, etc.)
- A short bio (optional)
- If you have a project: name, description, URL

A maintainer will take it from there.

### Option 2: Submit via GitHub (For Those Who Know Git)

If you're comfortable with GitHub, you can add yourself directly:

1. **Fork** the [repository](https://github.com/madebypunks/directory)
2. **Create** your file(s) - see formats below
3. **Submit** a pull request

That's it. No gatekeepers, no approvals process. Just git.

---

## Meet PunkMod

When you submit a pull request, **PunkMod** will greet you. PunkMod is our AI assistant that helps contributors get their submissions right.

PunkMod will:
- **Check your files** for missing or incorrect data
- **Verify your URLs** to make sure they work
- **Filter scams and spam** - protects the directory from fake projects and phishing attempts
- **Suggest fixes** if something needs adjusting
- **Answer questions** - just reply to the bot!

Don't stress about getting everything perfect on your first try. PunkMod is patient and will help you through the process.

> PunkMod prepares submissions for review but never merges anything. A human maintainer always makes the final call.

---

## Punk Profile Format

Create `content/punks/[YOUR_PUNK_ID].md`:

```
---
name: Your Name
links:
  - https://x.com/your_handle
  - https://your-site.com
---

Write anything you want here. This is your space.
Share your story, your interests, what you're working on.
```

That's all you need. No project required.

---

## Project Format (Optional)

If you've built something, create `content/projects/your-project.md`:

```
---
name: Your Work Name
description: A brief description (1-2 sentences)
url: https://your-project.com
launchDate: 2024-01-15
tags:
  - Art
  - Tool
creators:
  - 1234
links:
  - https://x.com/your_handle
---

Write more about your work here if you want.
```

**Tags to choose from:**
Art, Book, Film, Documentary, Music, Photography, Animation, Illustration, Derivative, Generative, History, Guide, Education, Creation, Memes, Fun, Playful, Community, Collector, Marketplace, Explorer, Archive

---

## Collabs

Projects can have multiple creators. List all the punk IDs:

```
creators:
  - 1234
  - 5678
```

The project will appear on both punk pages.

---

## Thumbnails

Drop your image in `public/projects/` and reference it:

```
thumbnail: /projects/your-project.png
```

Keep it around 1200x630px for best results.

---

## The Spirit of This Place

CryptoPunks belong to no one and everyone. This directory is the same.

- **No database** - Everything lives in simple text files
- **No backend** - Just static files, forkable and remix-friendly
- **No gatekeepers** - Anyone can contribute, anyone can fork
- **Community-maintained** - Volunteers who hold punks, nothing more

This is lore that belongs to everyone. Take it and build.

---

## Questions?

Join the [community discussion](https://github.com/madebypunks/directory/discussions) on GitHub. PunkMod is there to answer your questions about the directory, submissions, or anything punk-related.

You can also [open an issue](https://github.com/madebypunks/directory/issues) for bug reports or specific requests.
