# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.1.x   | Yes |
| 1.0.x   | Yes |
| < 1.0   | No |

## Reporting a Vulnerability

Please report security vulnerabilities via [GitHub Security Advisories](https://github.com/sunliang11/md-to-docx/security/advisories/new) (private disclosure).

Do not open public issues for security reports.

### Response targets (best effort)

| Stage | Target |
|-------|--------|
| Acknowledge receipt | within **7 days** |
| Initial severity / triage note | within **14 days** of acknowledgment |
| Fix or mitigation plan | as capacity allows; critical issues are prioritized |

These are goals for a volunteer-maintained project, not contractual SLAs. If a report is out of scope (for example a dependency issue upstream), we will say so and point to the right channel when possible.

### Scope

In scope: vulnerabilities in this repository's conversion pipeline, CLI/API/MCP/Web surfaces, GitHub Action, and packaging that could lead to unexpected code execution, path traversal, or data exfiltration when processing untrusted Markdown/DOCX.

Out of scope: social engineering, denial-of-service via extremely large inputs without a clear security boundary bug, and issues solely in third-party dependencies (please report those upstream; we track them via Dependabot / `pip-audit`).
