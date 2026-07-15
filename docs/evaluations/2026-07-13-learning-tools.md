# Learning tools release evaluation

- Date: 2026-07-13
- Scope: ASA-95 / ASA-106
- Status: Release verification complete; awaiting manual approval and delivery

## Release gate summary

| Gate | Result | Evidence |
| --- | --- | --- |
| Static-first architecture | Pass | Browser-only globals remain behind client components; no API route, auth, backend, cloud model, embedding, or vector dependency was added |
| Five task workflows | Pass with deterministic browser fixtures | Translate, Explain, More examples, Summarize lesson, and Check my sentence generate task-specific result cards |
| Capability and recovery states | Pass with deterministic browser fixtures | Unsupported-by-capture, unavailable, downloadable/downloading, ready, generating, success, canceled, malformed, and error paths were exercised |
| Local persistence | Pass | IndexedDB recent/saved results, seven-day/20-result pruning, session workspace, refresh, disabled history, and BroadcastChannel tab updates were exercised |
| Responsive and keyboard behavior | Pass | 390 x 844 bottom sheet, 1440 x 900 side sheet, Escape close, trigger focus restoration, labelled controls, and long-content scrolling were checked |
| Representative lessons | Pass | Existing theme, grammar, and communication lessons expose the workspace and contextual actions; metadata-only context is covered by an automated fallback test |
| Automated repository checks | Pass | 31 tests, lint, topic validation (120/120 details, 0 warnings), diff checks, and production build (129 generated pages) passed after the final live-browser fixes |
| Supported Chrome live German output | Pass | Translator, Prompt, and Summarizer paths produced real German learning results on localhost after the documented development flags were enabled |

The supported-Chrome release gate is satisfied. ASA-106 and its parent remain open only for manual approval, commit, push verification, and Linear closeout.

## Human review rubric

Score each dimension from 0 to 2:

- **0 — fail:** wrong, fabricated, unsafe, unrelated, invalidly structured, or meaning-changing.
- **1 — usable with revision:** mostly correct and grounded but incomplete, awkward, too difficult, or insufficiently clear.
- **2 — pass:** correct for the sample, grounded only in supplied context, level-appropriate, concise, and presented in the requested structure.

Automatic rejection applies regardless of score when an output leaks prompt text, invents curriculum claims, duplicates requested examples, changes learner meaning without disclosure, mixes the language pair, or cannot satisfy its runtime schema.

This is a small release-oriented sample, not evidence of universal language accuracy.

## Dated A1-B2 evaluation set

Run the following against a supported real Chrome model. Record the model/API availability, selected options, raw visible result, reviewer scores, and notes without copying private learner text into logs.

| Level | Tool | Source and request | Required review points |
| --- | --- | --- | --- |
| A1 | Translate | `Ich wohne in Berlin.` from an introductions lesson, German to English | meaning, direction, no added fact |
| A1 | Check | `Ich lernt Deutsch jeden Tag.` | preserves original, corrects `lernt` to `lerne`, explains person agreement, natural alternative |
| A2 | Explain | a curated word-order example with a time phrase first | identifies verb-second using only supplied lesson context, beginner-friendly wording |
| A2 | More examples | a separable-verb rule, same-level difficulty | three distinct German examples, correct separation, translations and notes match |
| B1 | Summarize | a complete subordinate-clause lesson | critical rules retained, no unrelated grammar rule, requested summary format respected |
| B1 | Check | an ambiguous but grammatical sentence with two natural phrasings | does not invent an error; uncertainty or alternatives are explicit |
| B2 | Explain | a contrastive connector passage | nuance is grounded in the passage and level-appropriate, no external factual claim |
| B2 | Translate | a longer sentence containing a subordinate clause, German to English | clause relationships and meaning preserved, no omission |
| B2 | More examples | a nuanced grammar rule at challenge difficulty | examples obey the rule without exceeding the supplied grounding |

## Deterministic browser observations

The development-only fixture boundary was exercised at `localhost` without accessing browser storage through automation:

- ready-state Explain, More examples, Summarize, Translate, and sentence checking completed;
- structured examples rendered three separate German sentences with concealed translations;
- sentence checking rendered original, correction, explanation, and alternative as separate fields;
- malformed structured output produced a recoverable unreadable-result error and no invented card;
- hostile-looking markup and a `javascript:` model link rendered as inert text with no executable link, while a 30,000-character fixture remained contained in the scrollable result surface;
- cancellation preserved the learner sentence and returned to an actionable state;
- downloadable state required an explicit **Download & generate** action and showed only fixture-reported progress;
- unavailable state explained the device/language limitation and disabled generation;
- refresh restored retained results, disabled recent history kept new unsaved output only for the session, and an explicit save appeared in a second tab;
- theme, grammar, and communication pages kept the existing lesson and contextual actions usable;
- the browser console contained no application error entries during the pass.

## Performance and resource observations

These observations distinguish deterministic UI timing from real model performance:

| Behavior | Observation |
| --- | --- |
| Initial lesson path | Learning tools are a client-only component; capability checks run after hydration and do not block static lesson rendering |
| Model download | No download occurs on page load or workspace open; creation begins only after the generation action |
| Deterministic warm generation | Ready fixture result cards appeared within the sub-second verification wait; this is not a model latency claim |
| Streaming responsiveness | Slow fixture exposed streamed text and a working Cancel action before completion |
| Repeated tasks | Translator and Summarizer sessions are reused only for matching task/language options; Prompt sessions are isolated to prevent unrelated context retention |
| Cleanup | Task sessions are destroyed on replacement or workspace teardown; cancellation uses `AbortSignal` |
| Long summaries | Lesson text is deterministically chunked and summarized again, avoiding a single oversized request |
| Stored payload | Only result display fields and task options are persisted; prompt strings, model internals, and unrelated catalog data are omitted |

The 2026-07-15 live pass observed the following coarse user-visible timings through the browser UI. These are single-run ranges, not benchmarks: translation completed within the first two-second check; examples and sentence checking completed within roughly 8-16 seconds; grounded explanation and summarization completed within roughly 16-24 seconds; a Prompt request canceled successfully after about one second. Capabilities were already ready, so download duration was not measured.

Cold model start and actual download duration remain unmeasured because the models were ready after Chrome restarted. The observed ranges above are sufficient for this release smoke test but must not be presented as universal performance claims.

## Known limitations

- Chrome built-in AI support varies by browser release, desktop OS, hardware, storage, policy, model state, and language combination.
- Mobile Chrome is not claimed as supported.
- Proofreader is experimental; sentence checking must remain honest about using Prompt when Proofreader is absent.
- A locally generated result can still be linguistically incorrect even when it passes the structural schema.
- History is browser-profile and device local; there is no synchronization or recovery after site data is cleared.
- Current full lessons all have detail files. The valid metadata-only case is verified through the context builder and remains a regression requirement if sparse catalog entries return.

## Completed supported-browser procedure

1. A supported desktop Chrome profile was used on `localhost` after the official local-development flags were enabled.
2. LangCompass's visible capability states reported Translator, Summarizer, and Prompt ready; Proofreader remained optional and sentence checking used Prompt.
3. All five workflows produced real visible results, including German input/output, and live cancellation succeeded.
4. Live failures found during the pass were corrected and regression-tested: German translation source selection, strict explanation grounding, the Summarizer `tldr` enum, model-independent original-sentence preservation, and understandable change descriptions.
5. The full repository gate is rerun after these corrections.
6. Manual approval remains required before commit, push, and Linear completion.
