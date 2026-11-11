# HalalSpot Development Workflow

**Document ID:** ENG-WF-001  
**Version:** 1.0  
**Project:** HalalSpot MVP  
**Owner:** Founder / Tech Lead  
**Status:** Proposed — pending review and merge

## 1. Purpose

This document defines how code and documentation changes are developed, tested, reviewed, merged, and maintained in HalalSpot.

The goals are to protect the `main` branch, maintain code quality, improve traceability, and establish professional engineering habits.

## 2. Development Principles

- Keep changes small, focused, and reviewable.
- Prefer simple solutions over unnecessary abstractions.
- Follow established Laravel, React, TypeScript, and PostgreSQL conventions.
- Validate inputs, enforce authorization, and protect sensitive information.
- Add or update tests for behavior changes.
- Never introduce secrets or credentials into Git.
- Distinguish verified halal certification, restaurant self-declared claims, and unknown halal status.
- Never represent an unverified claim as certified.

## 3. Branching Strategy

The `main` branch represents the latest integrated version of HalalSpot.

All planned changes should be developed on a separate branch and submitted through a Pull Request.

### Branch naming

Use lowercase, hyphen-separated names:

| Prefix      | Purpose                | Example                       |
| ----------- | ---------------------- | ----------------------------- |
| `feat/`     | New functionality      | `feat/restaurant-search`      |
| `fix/`      | Bug fixes              | `fix/search-validation`       |
| `docs/`     | Documentation          | `docs/development-workflow`   |
| `test/`     | Tests and verification | `test/restaurant-filters`     |
| `chore/`    | Maintenance            | `chore/update-ci`             |
| `refactor/` | Internal improvements  | `refactor/restaurant-service` |

Branch from an updated `main` whenever possible.

## 4. Commit Standards

Use Conventional Commit messages:

`type: short description`

Examples:

- `feat: add restaurant search endpoint`
- `fix: validate restaurant location input`
- `test: cover review authorization`
- `docs: document development workflow`
- `chore: update CI configuration`
- `refactor: simplify restaurant query logic`
- `style: format README documentation`

Commits should be focused, descriptive, and free from unrelated changes.

## 5. Pull Request Workflow

1. Create a branch from the latest `main`.
2. Implement a focused change.
3. Add or update relevant tests.
4. Run applicable local quality checks.
5. Review the Git diff and verify that no secrets are included.
6. Commit using Conventional Commits.
7. Push the branch to GitHub.
8. Open a Pull Request using the repository template.
9. Link the relevant issue and requirement ID when available.
10. Review the changes and resolve CI failures.
11. Merge only after the required checks pass.
12. Verify post-merge CI and synchronize local `main`.

For a solo founder, zero external approvals are currently required. A self-review is still expected.

Future contributors may require a formal review policy.

## 6. Automated Quality Checks

GitHub Actions runs the `tests` workflow, including the required `ci` job.

Before opening a Pull Request, run:

```bash
npm run check
composer ci:check
git diff --check
```

`composer ci:check` is the project's aggregate CI validation command and may repeat some individual checks.

A Pull Request must satisfy the repository's required checks before merging.

Never bypass or disable checks merely to make a failing Pull Request mergeable.

If a check fails:

1. Read the failing job logs.
2. Identify the root cause.
3. Reproduce the failure locally when possible.
4. Apply a focused correction.
5. Run the relevant checks again.
6. Commit, push, and verify the new CI run.

## 7. Security and Data Integrity

Every change should consider:

- Input validation and error handling.
- Authentication and authorization.
- Database integrity and concurrency where relevant.
- Safe handling of uploaded content.
- Prevention of exposed secrets and personal data.
- Protection against common web application vulnerabilities.
- Clear separation of verified halal certification, self-declared claims, and unknown status.

Authorization must be enforced on the server, not solely through frontend controls.

## 8. Merge Policy

The `main` branch is protected by the GitHub ruleset named **Protect main**.

The current ruleset requires:

- Pull Requests before merging.
- Successful `ci` status checks.
- Protection against branch deletion.
- Protection against force pushes.

The current solo-founder configuration requires zero approving reviews.

Use a normal merge commit by default for traceability. Squash and rebase merges are available when appropriate.

Do not merge when required checks are failing or when unresolved high-risk issues are known.

## 9. Post-Merge Verification

After merging:

```bash
git switch main
git pull --ff-only origin main
git status -sb
```

Verify that the post-merge GitHub Actions workflow succeeds.

Delete obsolete feature branches after confirming the merge and preserving any needed work.

## 10. Incident and Rollback Procedure

If a merged change introduces a serious issue:

1. Assess the impact and stop further risky changes.
2. Open a bug report describing the problem.
3. Prefer a corrective Pull Request or `git revert` over rewriting shared history.
4. Run tests and obtain required CI results.
5. Merge the correction through the protected workflow.
6. Verify the fix and document the root cause.

Never force-push to `main` as a routine rollback method.

## 11. Definition of Done

A change is complete when:

- Acceptance criteria are satisfied.
- Relevant tests pass.
- Required CI checks pass.
- Security and authorization implications are reviewed.
- Documentation is updated where necessary.
- The Pull Request is reviewed and merged.
- Post-merge verification is complete.

## 12. Policy Maintenance

This document should be updated whenever HalalSpot's development workflow changes.

Changes to branch protection, CI requirements, or review policy should be documented and approved by the founder.
