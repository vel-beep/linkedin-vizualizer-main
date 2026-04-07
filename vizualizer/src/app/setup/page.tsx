import type { Metadata } from 'next'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = {
  title: `Setup — ${siteConfig.loginTitle}`,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed font-mono">
      {children}
    </pre>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
}

export default function SetupPage() {
  return (
    <div className="max-w-[668px] mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Setup Guide</h1>
        <p className="text-sm text-gray-500 mt-1">Everything you need to run and maintain {siteConfig.loginTitle}.</p>
      </div>

      <Section title="1. Add a new post">
        <p>
          Each post is a Markdown file in the <InlineCode>content/</InlineCode> folder.
          Create a new file with this format:
        </p>
        <Code>{`---
id: unique-post-id
person: Ruben
role: Head of Marketing
date: 2026-02-22
hook: This is the first line of the post — the hook.
image: /images/ruben-post-2026-02-22.png
---

The rest of the post body goes here.

Each paragraph is separated by a blank line.
LinkedIn formatting is preserved.`}</Code>

        <p>
          The <InlineCode>image</InlineCode> field is optional. If your post has no image, omit it entirely.
        </p>

        <p><strong>Naming convention for the file:</strong> use the date + a short slug, e.g.:</p>
        <Code>{`content/2026-02-22_ruben-ai-post.md`}</Code>

        <p><strong>Naming convention for images:</strong> match the post filename and put it in <InlineCode>public/images/</InlineCode>:</p>
        <Code>{`public/images/2026-02-22_ruben-ai-post.png`}</Code>

        <p>
          Then reference it in the frontmatter as{' '}
          <InlineCode>{`image: /images/2026-02-22_ruben-ai-post.png`}</InlineCode>.
        </p>
      </Section>

      <Section title="2. Run locally">
        <p>Prerequisites: <strong>Node.js 18+</strong> and <strong>npm</strong>.</p>
        <Code>{`# 1. Install dependencies
npm install

# 2. Copy the environment file
cp .env.local.example .env.local

# 3. Start the dev server
npm run dev

# 4. Open in browser
# → http://localhost:3000`}</Code>
      </Section>

      <Section title="3. Enable GitHub Discussions for Giscus">
        <p>Giscus stores comments as GitHub Discussions. One-time setup:</p>
        <ol className="list-decimal list-inside space-y-2 ml-1">
          <li>
            Go to your GitHub repo → <strong>Settings</strong> → <strong>Features</strong> → enable{' '}
            <strong>Discussions</strong>.
          </li>
          <li>
            Install the{' '}
            <strong>Giscus app</strong> on your repo:{' '}
            <InlineCode>https://github.com/apps/giscus</InlineCode>
          </li>
          <li>
            Go to <InlineCode>https://giscus.app</InlineCode>, enter your repo, choose a Discussions
            category (create one called <strong>"Post Reviews"</strong>), and copy the config values.
          </li>
          <li>
            Paste them into your <InlineCode>.env.local</InlineCode>:
          </li>
        </ol>
        <Code>{`NEXT_PUBLIC_GISCUS_REPO=your-org/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Post Reviews
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxxxxx`}</Code>
        <p>
          Comments will now appear on each post&apos;s detail page (<InlineCode>/post/[id]</InlineCode>).
          Reviewers need a GitHub account to comment.
        </p>
      </Section>

      <Section title="4. Deploy to Vercel">
        <Code>{`# Option A — Vercel CLI
npm i -g vercel
vercel

# Option B — GitHub integration
# 1. Push this repo to GitHub
# 2. Go to vercel.com → New Project → import your repo
# 3. Add env vars in Project Settings → Environment Variables
# 4. Deploy

# Build command (auto-detected):  next build
# Output directory (auto-detected): .next`}</Code>

        <p>
          For Vercel, you can remove <InlineCode>output: &apos;export&apos;</InlineCode> from{' '}
          <InlineCode>next.config.js</InlineCode> to unlock ISR and faster cold starts. It&apos;s not required
          but recommended for growing content sets.
        </p>
      </Section>

      <Section title="5. Deploy to Cloudflare Pages (static)">
        <Code>{`# Build command:
next build

# Output directory:
out

# Environment variables:
# Add your NEXT_PUBLIC_GISCUS_* vars in the Cloudflare Pages dashboard
# under Settings → Environment variables`}</Code>

        <ol className="list-decimal list-inside space-y-2 ml-1">
          <li>Push this repo to GitHub.</li>
          <li>Go to <strong>Cloudflare Dashboard → Pages → Create a project</strong>.</li>
          <li>Connect your GitHub repo.</li>
          <li>Set build command to <InlineCode>next build</InlineCode> and output dir to <InlineCode>out</InlineCode>.</li>
          <li>Add your Giscus env vars under <strong>Environment Variables</strong>.</li>
          <li>Deploy.</li>
        </ol>
        <p>
          The site builds statically — all post content is baked into HTML at build time. To add new
          posts, push new <InlineCode>.md</InlineCode> files and trigger a redeploy (automatic on
          git push).
        </p>
      </Section>

      <Section title="Frontmatter reference">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border border-gray-200 font-semibold">Field</th>
                <th className="text-left p-2 border border-gray-200 font-semibold">Type</th>
                <th className="text-left p-2 border border-gray-200 font-semibold">Required</th>
                <th className="text-left p-2 border border-gray-200 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['id', 'string', 'Yes', 'Unique identifier. Used for Giscus discussion mapping.'],
                ['person', 'string', 'Yes', 'Full name of the post author.'],
                ['role', 'string', 'Yes', 'Their job title or role.'],
                ['date', 'YYYY-MM-DD', 'Yes', 'Post date. Used for sorting.'],
                ['hook', 'string', 'Yes', 'First line of the post. Displayed bold.'],
                ['image', 'string', 'No', 'Path to image in /public. e.g. /images/post.png'],
              ].map(([field, type, req, desc]) => (
                <tr key={field} className="even:bg-gray-50">
                  <td className="p-2 border border-gray-200 font-mono">{field}</td>
                  <td className="p-2 border border-gray-200 font-mono text-gray-500">{type}</td>
                  <td className="p-2 border border-gray-200">{req}</td>
                  <td className="p-2 border border-gray-200 text-gray-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}
