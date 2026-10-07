# AI Usage Log

Running record of AI-assisted development on this project, kept as evidence
for the IT415 acceptance checklist's "AI prompts, responses, evaluations, and
modifications are documented" requirement. Each entry: what was asked, what
the AI produced, and how it was evaluated/adapted.

## 2026-10-07 — Requirements analysis and design brainstorming

**Prompted:** Analyze `IT415_Practical_Exam.pdf` and `IT415-Sample-UI.pdf` and
summarize the requirements before any implementation.

**Produced:** A breakdown of the required 7-step transaction flow, functional
requirements, and the instructor test checklist embedded in the exam PDF; a
read of the sample UI as a non-binding visual reference.

**Evaluated/adapted:** Confirmed accurate against the source PDFs by the
team. Used as the basis for all later design decisions rather than taken at
face value — cross-checked against the exam PDF's own "required functionality"
list (section 4) and instructor test tables (sections 6–7).

**Prompted:** Brainstorm a design for the kiosk app (stack, data storage,
styling, visual identity, product catalog, transaction ID format, category
filters).

**Produced:** A proposed design covering React + Vite + Tailwind, in-memory
state (no backend), a warm orange/yellow/green visual palette (Fraunces +
Inter typography), the 6-product catalog reused from the sample UI, and a
timestamp-based transaction ID format.

**Evaluated/adapted:** Each decision was presented as an explicit choice with
trade-offs and approved individually by the team (stack, storage, styling,
palette, catalog, ID format, category filters) rather than accepted as a
single bundled proposal. Palette was specifically reviewed against generic
"AI-generated design" defaults before approval. Full accepted design recorded
in `docs/superpowers/specs/2026-10-07-kiosk-pos-design.md`.

**Prompted:** Generate `CLAUDE.md` and `README.md` for the repository.

**Produced:** Project guardrails (`CLAUDE.md`) summarizing stack, required
flow, palette, and working conventions (YAGNI, branch-per-feature); a
project-facing `README.md` with stack, flow, and setup instructions.

**Evaluated/adapted:** Reviewed and extended after the acceptance checklist
was provided — added group contributions section and this AI usage log to
meet the checklist's development-process requirements.

**Prompted:** Analyze `IT415-Acceptance-Checklist.docx` (instructor's grading
rubric) and explain what it requires beyond the practical exam PDF.

**Produced:** Identification of the group-contribution register (M1–M6,
feature branches, PR evidence), the 7-stage commit-history requirement
(setup/interface/core functionality/validation/bug fix/refactoring/
documentation), and the explicit AI-documentation requirement.

**Evaluated/adapted:** Confirmed as a genuinely new requirement (not covered
by the practical exam PDF alone); used to update the README and repo setup
(this log, group contributions table) rather than assumed to be already
satisfied.

---

Future entries should follow the same prompted / produced / evaluated-adapted
structure, including for feature implementation, debugging, and refactoring
work by each member.
