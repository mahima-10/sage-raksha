# Docs Directory Guide

**Purpose:** Feature Requirement Documents (FRDs) that define every feature before code is written.

## Scope

### Include
- FRDs for all app features (P0, P1, P2)
- Data models and API specifications
- Prototype scope definition
- Master index for navigation

### Exclude
- Implementation code (see /prototype, /backend, /mobile)
- Design mockups (described in FRDs as text)

## FRD Naming Convention

| Range | Priority       | Examples                    |
|-------|----------------|-----------------------------|
| 00    | Index          | 00-INDEX.md                 |
| 01-09 | P0 (Critical) | Core features for prototype |
| 10-19 | P1 (Important) | Production features         |
| 20+   | P2 (Future)    | AI/advanced features        |

## Key Commands

- "Build screen per docs/XX-feature.md"
- "Check prototype scope per docs/10-prototype-specifications.md"

## Related Directories

- `/prototype` — Phase 1 implementation using these FRDs
- `/backend` — Phase 2 API implementation
