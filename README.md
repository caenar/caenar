```json
{
   "name": "profile",
   "version": "4.1.0",
   "description": "A bit of this, a bit of that.",
   "author": "Caenar Arteta",
   "languages": {
      "programming": ["JavaScript", "TypeScript", "PHP", "Python", "Java", "Dart"],
      "markup": ["HTML", "CSS", "SVG", "Markdown", "XML", "YAML"],
      "spoken": ["English", "Tagalog"]
   },
   "interests": ["coding", "systems", "learning", "problem-solving"],
   "currentProject": "orgbit",
   "goal": "Planted a seed that I hope to see bloom one day."
}
```

## Portfolio content architecture

Public project content is static and committed to this repository:

- `public/projects/v1/projects.json` contains the versioned project catalog.
- `public/projects/v1/assets/<slug>/` contains local project images.
- `/`, `/work`, and `/work/[slug]` are statically generated from that catalog.
- `/admin` stays dynamic and protected by `ADMIN_SECRET`.

Admin changes are published by committing the updated catalog and image files to GitHub. The GitHub push triggers the connected Vercel deployment; `VERCEL_DEPLOY_HOOK_URL` can optionally trigger an additional deployment.

The admin publisher reads the catalog from the configured branch before every change and refuses to publish against a stale commit. It also verifies that every image referenced by the catalog already exists in that branch. This means the static catalog and all of its assets must be pushed to the deployment branch before the first admin edit; the publisher never falls back to an older bundled snapshot.

The connected Vercel project uses `master` as its production branch. The `main` branch, when present, only creates preview deployments.

### Required environment

Copy `.env.example` into your deployment environment and configure:

- `ADMIN_SECRET`: protects the admin area.
- `GITHUB_TOKEN`: a fine-grained token with **Contents: read and write** permission.
- `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH`: repository location (defaults target `caenar/caenar` on `master`).
- `VERCEL_DEPLOY_HOOK_URL`: optional deploy hook.

No database, Prisma, or Supabase Storage is required for public project content.
