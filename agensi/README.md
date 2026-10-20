# agensi/

Agensi marketplace **publish archive** for the md-to-docx skill.

This folder holds everything needed to list, update, and re-submit the skill on [agensi.io](https://www.agensi.io/sell) without rebuilding from the whole repo each time.

## Contents

| Path | Purpose |
|------|---------|
| `LISTING.md` | Marketplace form copy (title, description, tags, GitHub, price) |
| `md-to-docx/` | Skill package root (mirrors zip top-level folder) |
| `md-to-docx.zip` | File to upload on the Agensi submit page |
| `pack.sh` | Rebuild `md-to-docx.zip` from `md-to-docx/` |

## Why this exists

- Agensi expects a zip with **one** top-level folder containing `SKILL.md` ([creator checklist](https://www.agensi.io/learn/skill-md-creator-checklist)).
- The full git repo is too large and includes binaries/tests/extensions that fail or slow security review.
- Keeping a slim, tested package here makes version bumps and re-uploads repeatable.

## Update / republish

1. Edit files under `md-to-docx/` (especially `SKILL.md`) and/or `LISTING.md`.
2. Locally verify:

   ```bash
   cd agensi/md-to-docx
   ./bin/convert examples/sample.md --preset technical
   ```

3. Repack:

   ```bash
   ./agensi/pack.sh
   ```

4. Upload `agensi/md-to-docx.zip` on the Agensi Creator Dashboard submit page, paste fields from `LISTING.md`, set price, submit for review.

## Listing

- GitHub: https://github.com/sunliangcode/md-to-docx
- Price: Free (first listing)
