import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

// GitHub App name (used to detect if bot already commented)
const GITHUB_APP_SLUG = process.env.GITHUB_APP_SLUG || "punkmodbot";

const SYSTEM_PROMPT = `You are PunkModBot, the nerdy AI assistant of Made By Punks - a community directory of CryptoPunks projects.

WHO YOU ARE:
- A total CryptoPunks nerd who knows EVERYTHING about punk lore
- You know: the 10,000 punks, the 24x24 pixel art, Larva Labs origins (Matt & John), June 2017 launch
- You know the traits: Aliens (9), Apes (24), Zombies (88), and all the rare attributes
- You know the OG history: free mint, the wrapped punk drama, the Yuga Labs acquisition
- You know the culture: "looks rare", punk Twitter, the community memes
- You're genuinely passionate about the punk ecosystem and love seeing it grow
- You geek out when you see cool punk-related projects

YOUR MISSION:
- Help community members submit their projects correctly
- Make sure submissions are clean, complete, and legit
- Be POSITIVE and encouraging - you're here to help, not gatekeep
- Catch scams and bad actors, but assume good faith first

CRITICAL ROLE:
- You are a PREPARATION assistant, NOT an approver
- You NEVER approve or merge PRs - that's ALWAYS for a human moderator
- Your job is to review, help fix issues, and prepare PRs for human review
- You flag when a PR is ready, but the final decision is ALWAYS human

IMPORTANT CONTEXT:
- Contributors are NOT developers - they're community members adding their projects
- They may not know YAML, markdown, or git - be patient and helpful
- Your job is to make their submission clean and complete
- If you can fix something, just fix it - don't ask unnecessary questions
- Be proactive: if something is missing but you can guess it, suggest it
- CHECK FOR SCAMS: if a project looks suspicious (fake URLs, impersonation, etc.), flag it

Your personality:
- Nerdy and enthusiastic about all things CryptoPunks
- Friendly and welcoming - celebrate new submissions!
- Helpful and patient, especially with first-time contributors
- Casual language - like a knowledgeable friend helping out
- You might drop punk references or trivia when relevant
- Keep it positive - every legit project is a win for the community`;

export const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "madebypunks";
export const REPO_NAME = process.env.GITHUB_REPO_NAME || "directory";

export interface PRFile {
  filename: string;
  status: string;
  contents?: string;
}

export type ReviewStatus =
  | "ready_for_review" // All good, human can review and merge
  | "needs_changes" // Contributor needs to update something
  | "suspicious" // Potential scam or problematic submission
  | "needs_info"; // Bot needs more information to proceed

export interface ReviewResult {
  summary: string;
  status: ReviewStatus;
  validationErrors: string[];
  suggestions: string[];
  fixedFiles: { filename: string; content: string }[];
  needsClarification: string[];
  suspiciousReasons?: string[];
}

export interface PRDetails {
  number: number;
  title: string;
  body: string | null;
  user: { login: string };
}

interface GitHubComment {
  user: { login: string; type: string };
  body: string;
}

// GitHub API helper
export async function github(path: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      ...options?.headers,
    },
  });
  return res.json();
}

export async function getOpenPRs() {
  return github("/pulls?state=open");
}

export async function getPRComments(prNumber: number): Promise<GitHubComment[]> {
  return github(`/issues/${prNumber}/comments`);
}

export async function getPRFiles(prNumber: number): Promise<PRFile[]> {
  const files = await github(`/pulls/${prNumber}/files`);
  const result: PRFile[] = [];

  for (const file of files) {
    const isContentFile = file.filename.startsWith("content/punks/") || file.filename.startsWith("content/projects/");

    if (isContentFile && file.filename.endsWith(".md") && file.status !== "removed") {
      const res = await fetch(file.raw_url, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
      });
      result.push({ filename: file.filename, status: file.status, contents: await res.text() });
    }
  }
  return result;
}

export async function getPRDetails(prNumber: number): Promise<PRDetails> {
  return github(`/pulls/${prNumber}`);
}

export async function postComment(prNumber: number, body: string) {
  return github(`/issues/${prNumber}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
}

export async function analyzeWithClaude(prDetails: PRDetails, files: PRFile[]): Promise<ReviewResult> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const filesContext = files
    .filter((f) => f.contents)
    .map((f) => `### ${f.filename}\n\`\`\`markdown\n${f.contents}\n\`\`\``)
    .join("\n\n");

  const prompt = `${SYSTEM_PROMPT}

You are reviewing pull requests for Made By Punks, a community directory of CryptoPunks projects.

## Expected File Formats

### Project files (content/projects/{slug}.md)
- Filename must be lowercase with hyphens only (e.g., my-cool-project.md)
- Required YAML frontmatter fields:
  - name: string (project name, cannot be empty)
  - description: string (1-2 sentences, cannot be empty)
  - url: string (valid URL starting with https://)
  - launchDate: string (YYYY-MM-DD format, e.g., 2024-06-15)
  - tags: array of strings (at least one tag)
  - creators: array of numbers (punk IDs, 0-9999)
- Optional fields:
  - thumbnail: string (path like /projects/my-project.png)
  - links: array of URLs
  - hidden: boolean
  - ded: boolean (project is dead/discontinued)
  - featured: boolean

### Punk files (content/punks/{id}.md)
- Filename must be a number (the punk ID, e.g., 2113.md)
- Optional YAML frontmatter:
  - name: string
  - links: array of URLs
- Body: optional markdown bio

## PR Details
- **Title:** ${prDetails.title}
- **Author:** ${prDetails.user.login}
- **Description:** ${prDetails.body || "No description provided"}

## Files Changed
${filesContext}

## Your Task
BE PROACTIVE - fix things yourself whenever possible!

1. Check each file against the schema
2. Common issues to FIX (don't just report - provide the fix):
   - Empty description → ask what the project does
   - Wrong date format → convert to YYYY-MM-DD
   - creators as strings → convert to numbers
   - Missing tags → suggest relevant ones based on the project
   - Typos in field names → fix them
3. If the PR looks good → mark as ready for human review
4. If there are issues → provide the COMPLETE fixed file

Respond in JSON:
{
  "summary": "Brief, friendly summary (1-2 sentences max)",
  "status": "ready_for_review" | "needs_changes" | "suspicious" | "needs_info",
  "validationErrors": ["only critical issues that block the PR"],
  "suggestions": ["nice-to-have improvements, keep it short"],
  "needsClarification": ["only ask if you truly cannot guess - be specific"],
  "fixedFiles": [{ "filename": "content/projects/example.md", "content": "complete fixed file" }],
  "suspiciousReasons": ["only if status is suspicious - explain why"]
}

STATUS GUIDE:
- "ready_for_review": Everything looks good, a human moderator can review and merge
- "needs_changes": The contributor needs to fix something (validation errors, missing info)
- "suspicious": Something looks off (fake URL, impersonation, scam vibes) - explain in suspiciousReasons
- "needs_info": You need more information from the contributor to proceed

RULES:
- Keep summary SHORT - this is not an essay
- If you can fix it, fix it - don't ask
- fixedFiles must contain the COMPLETE file content (frontmatter + body)
- You NEVER approve or merge - you only prepare for human review
- Be friendly but concise - respect people's time`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0];
  if (text.type !== "text") throw new Error("Unexpected response");
  const match = text.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

function getStatusBadge(status: ReviewStatus): string {
  switch (status) {
    case "ready_for_review":
      return "✅ **READY FOR HUMAN REVIEW** - A moderator can now review and merge";
    case "needs_changes":
      return "🔄 **NEEDS CHANGES** - Please update your submission";
    case "suspicious":
      return "🚨 **FLAGGED** - This submission needs careful human verification";
    case "needs_info":
      return "❓ **WAITING FOR INFO** - Please answer the questions below";
  }
}

export function formatComment(result: ReviewResult): string {
  const lines: string[] = [result.summary, "", getStatusBadge(result.status), ""];

  if (result.status === "suspicious" && result.suspiciousReasons?.length) {
    lines.push("### 🚨 Flags", ...result.suspiciousReasons.map((r) => `- ${r}`), "");
  }
  if (result.validationErrors.length) {
    lines.push("### ❌ Issues", ...result.validationErrors.map((e) => `- ${e}`), "");
  }
  if (result.suggestions.length) {
    lines.push("### 💡 Suggestions", ...result.suggestions.map((s) => `- ${s}`), "");
  }
  if (result.needsClarification.length) {
    lines.push("### ❓ Questions", ...result.needsClarification.map((q) => `- ${q}`), "");
  }
  if (result.fixedFiles.length) {
    lines.push("### 🔧 Suggested Fixes", "*Copy these fixes to your files:*", "");
    for (const f of result.fixedFiles) {
      lines.push(`<details><summary><code>${f.filename}</code></summary>`, "", "```markdown", f.content, "```", "</details>", "");
    }
  }

  return lines.join("\n");
}

// Check if the bot has already commented on this PR
function hasAlreadyReviewed(comments: GitHubComment[]): boolean {
  const botLogin = `${GITHUB_APP_SLUG}[bot]`;
  return comments.some((c) => c.user.login === botLogin || c.user.type === "Bot");
}

// Review a single PR
export async function reviewPR(prNumber: number, forceReview = false): Promise<{ reviewed: boolean; reason?: string }> {
  const comments = await getPRComments(prNumber);

  if (!forceReview && hasAlreadyReviewed(comments)) {
    return { reviewed: false, reason: "already_reviewed" };
  }

  const [details, files] = await Promise.all([getPRDetails(prNumber), getPRFiles(prNumber)]);

  if (files.length === 0) {
    return { reviewed: false, reason: "no_content_files" };
  }

  const result = await analyzeWithClaude(details, files);
  await postComment(prNumber, formatComment(result));

  return { reviewed: true };
}

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expectedSignature = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}
