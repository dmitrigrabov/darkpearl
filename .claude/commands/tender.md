# Tender Evaluation Command

You are now executing the UK Tender Evaluator skill to analyze a government procurement opportunity.

## Context

The user has provided a find-tender.service.gov.uk URL and wants a comprehensive evaluation including:
- Market research (suppliers, competitors, trends)
- Risk and opportunity analysis
- Technical requirements specification
- Project plan with timeline and budget

## Your Task

1. **Invoke the uk-tender-evaluator skill** to execute the full evaluation workflow
2. **Use the URL provided by the user** (format: https://www.find-tender.service.gov.uk/Notice/XXXXXX-YYYY)
3. **Execute the automated research and analysis workflow** (15-25 minutes)
4. **Generate all 4 deliverable files** in structured, Claude-actionable format
5. **Summarize findings** and suggest next actions (e.g., create bd issues)

## Important Notes

- This is a **fully automated process** - no interactive checkpoints
- Output directory: `./tenders/{tender-id}/` (create directory structure)
- All research uses **public web sources only** (WebSearch + WebFetch)
- Deliverables are optimized for **both human review and Claude parsing**
- After completion, offer to **create bd issues** from requirements

## Expected Deliverables

After evaluation completes, you should have created:

1. **`{tender-id}-meta.md`** - Tender metadata and context
   - YAML frontmatter with tender details
   - Authority profile
   - Award criteria breakdown
   - Key dates and submission requirements

2. **`{tender-id}-evaluation.md`** - One-page evaluation summary
   - Executive summary with PURSUE/DECLINE/MONITOR recommendation
   - Risk assessment (RISK-001 format)
   - Opportunity analysis (OPP-001 format)
   - Competitive landscape
   - Winning strategy

3. **`{tender-id}-requirements.md`** - Technical requirements (parseable)
   - Requirements with REQ-XXX IDs
   - Acceptance criteria (checkbox format)
   - Dependencies explicitly noted
   - Effort estimates in days
   - Award criteria mapping

4. **`{tender-id}-plan.md`** - Project plan (parseable)
   - Phase breakdown with tasks (TASK-X.X format)
   - Milestones, risks, dependencies
   - Resource plan and budget
   - Critical path analysis

Additionally in `research/` subdirectory:
- `competitors.md` - Detailed competitor profiles
- `current-supplier.md` - Incumbent analysis
- `market-analysis.md` - Trends and intelligence
- `sources.md` - All research sources with URLs

## Next Actions After Completion

1. **Summarize key findings**: Recommendation, opportunity/risk scores, critical insights
2. **Highlight winning strategy**: How to position based on award criteria
3. **Ask if user wants to**:
   - Create bd issues from requirements (parse and generate full issue structure)
   - Refine specific sections (deep-dive into areas)
   - Generate architecture docs (system design, API specs, database schema)
   - Draft bid documents (technical response, commercial response)

## Quality Checklist

Before completing, ensure:
- [ ] All 4 deliverable files created with correct naming
- [ ] YAML frontmatter is valid
- [ ] Requirements have unique IDs (REQ-001, REQ-002, etc.)
- [ ] Dependencies are explicitly noted
- [ ] Effort estimates present for all requirements
- [ ] Acceptance criteria use checkbox format `- [ ]`
- [ ] All sources cited in research/sources.md
- [ ] Risk register has minimum 5 risks
- [ ] Minimum 3 competitors analyzed

Now proceed with the tender evaluation using the uk-tender-evaluator skill.
