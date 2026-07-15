# On-device learning tools decision record

- Date: 2026-07-13
- Scope: ASA-95 / ASA-97
- Status: Accepted for the MVP implementation

## Decision

LangCompass learning tools are an optional, client-only progressive enhancement. They use Chrome's built-in AI APIs when a compatible browser, model, language combination, and device are available. They do not call a LangCompass server, a third-party model endpoint, or a cloud fallback.

The existing catalog and lesson detail JSON remain the source of truth. Generated text is temporary learner assistance, is never promoted to curriculum content, and is always presented as potentially inaccurate.

## MVP API selection

| Learner workflow | Primary API | Fallback inside the MVP | Maturity rule |
| --- | --- | --- | --- |
| Translate | `Translator` | Unavailable-state guidance; preserve the source text | Stable task API on supported desktop Chrome |
| Detect an unknown translation source | `LanguageDetector` | Ask the learner to select a source language | Stable task API; do not trust low-confidence or very short detections |
| Summarize a lesson | `Summarizer` | Unavailable-state guidance | Stable task API on supported desktop hardware |
| Explain lesson content | `LanguageModel` | Unavailable-state guidance | Stable web Prompt API from Chrome 148; constrain every request with lesson context |
| Generate examples | `LanguageModel` with a response schema | Plain-text parsing only when it can be validated; otherwise show a recoverable error | Stable web Prompt API from Chrome 148; validate structured output before rendering |
| Check a sentence | `Proofreader` when present, otherwise `LanguageModel` with a response schema | Unavailable-state guidance | Proofreader remains experimental, so the stable Prompt API is the dependable MVP path |
| Writer / Rewriter | Not selected | None | Experimental APIs do not add a required MVP capability |

`Writer` and `Rewriter` are deliberately excluded. They are useful for general composition and rewriting, but LangCompass needs grounded explanations, examples, and corrections rather than open-ended writing assistance.

## Capability matrix

Status and API shapes were checked against the official Chrome documentation on 2026-07-13.

| API | Web maturity | German support and constraints | Streaming / structure | MVP use |
| --- | --- | --- | --- | --- |
| Translator | Stable from Chrome 138 | Availability is checked for each source/target pair; expert model; desktop only | `translate()` and `translateStreaming()` | Required for translation |
| Language Detector | Stable from Chrome 138 | Detection covers many languages but is not exhaustive; confidence is unreliable for short text | Ranked results with confidence values | Optional source detection |
| Summarizer | Stable from Chrome 138 | Foundation-model hardware requirements; declare expected input, output, and context languages | `summarize()` and `summarizeStreaming()`; fixed type/format/length options | Required for lesson summaries |
| Prompt (`LanguageModel`) | Stable for web from Chrome 148; extensions from Chrome 138 | From Chrome 149 the foundation model documents German, English, Spanish, Japanese, and French input/output support | `promptStreaming()`, cancellation, context measurement, and JSON Schema response constraints | Required for explanations and examples; stable fallback for checking |
| Writer | Developer trial; origin trial documented through Chrome 148 | Foundation-model hardware requirements; expected input/context languages and output language | `write()` and `writeStreaming()` | Excluded |
| Rewriter | Developer trial | Foundation-model hardware requirements; expected input/context languages and output language | `rewrite()` and `rewriteStreaming()` | Excluded |
| Proofreader | Developer trial; earlier origin trial documented for Chrome 141-145 | Expected input languages; correction types and explanations are not currently supported options | Structured corrected input and correction ranges; no streaming requirement | Optional preferred checker only |

Foundation-model APIs require a supported desktop OS, at least 22 GB free on the Chrome-profile volume, and either more than 4 GB VRAM or at least 16 GB RAM with four CPU cores. The initial model download requires an unmetered connection. Models are not available on mobile. Downloads must begin only after meaningful user activation, and the UI must expose `downloadable`, `downloading`, `available`, and unavailable states.

All sessions must accept an `AbortSignal`. Prompt sessions may be reused only within the same tool and option set; a tool, topic, language, schema, or grounding change creates a new session. Sessions are destroyed on replacement or workspace teardown so context cannot leak between tasks.

## Live desktop Chrome capture

Captured on 2026-07-13 from the user's normal Chrome `Personal` profile at:

`http://localhost:3003/topic/a1_1_m1_present_basic?level=All`

| Check | Observed result |
| --- | --- |
| Browser surface | Stable desktop Chrome profile connected through the installed Codex extension |
| Chrome version | Not exposed by the permitted browser-control surface; the blocked internal version page was not bypassed |
| Origin | `http://localhost:3003` |
| Secure-context prerequisite | Chrome documents all APIs as available on localhost for prototyping; the browser-control surface did not expose `isSecureContext` |
| `Translator` | Global absent |
| `LanguageDetector` | Global absent |
| `Summarizer` | Global absent |
| `LanguageModel` | Global absent |
| `Writer` | Global absent |
| `Rewriter` | Global absent |
| `Proofreader` | Global absent |
| Availability values | Not callable because every API global was absent |
| German input/output generation | Blocked before session creation; no model download was triggered |
| Flags / origin-trial tokens | Not inspected because internal Chrome pages are outside the permitted browser-control surface |

This is a valid unsupported-environment fixture, not evidence that every stable Chrome installation lacks the APIs. The likely causes include a Chrome version below an API's release, disabled local prototyping flags, an unavailable origin trial, enterprise configuration, or unsupported device/model conditions. The application must not guess which cause applies.

### Follow-up supported localhost capture

On 2026-07-15 the user enabled the two Chrome localhost-development flags documented in the official setup guide and restarted Chrome. The same normal desktop profile and localhost lesson then reported Translator, Summarizer, and Prompt capabilities as ready through LangCompass's production feature-detection path.

| Workflow | Live result |
| --- | --- |
| Translate | Passed: `Ich heiße Mina.` produced `My name is Mina.` with German and English labels |
| Explain | Passed after tightening the prompt against unsupported scope: the final response stayed within the supplied ich/du/formal-Sie rules, kept `sein` separate as irregular, and used lesson-supported word order examples |
| More examples | Passed: three schema-validated examples rendered with correct revealed translations and usage notes |
| Summarize lesson | Passed after correcting the real Chrome enum from `tl;dr` to `tldr`; the recap retained regular endings, irregular `sein`, and word order |
| Check my sentence | Passed: `Ich lernt Deutsch jeden Tag.` preserved the original, produced `Ich lerne Deutsch jeden Tag.`, and explained the person-ending change |
| Cancellation | Passed: a live Prompt request canceled from the visible action and returned `Generation canceled.` while preserving the workspace |

The Chrome version remains unavailable through the permitted browser-control surface, so no version was inferred. No new model download was observed because the selected capabilities reported ready after restart.

## Runtime detection and degradation

1. Feature-detect the required global for the selected tool.
2. Call `availability()` with the exact languages, modalities, and output constraints before creating a session.
3. Treat missing globals as `unsupported` and an `unavailable` response or exception as `unavailable`.
4. Treat `downloadable` as a user-choice state. Never begin a model download just because the lesson page loaded.
5. Show progress during `downloading`, then create the session only after a learner action.
6. Preserve the learner's source text and selected options through unsupported, unavailable, canceled, and error states.
7. Explain that support depends on Chrome, device, model, and language availability. Do not imply that changing browsers or enabling flags is guaranteed to work.
8. Do not transmit lesson or learner text to any remote service. If no local path is available, the tool remains unavailable.

## Context and output limits

- Build grounding from the current catalog metadata and detail JSON in displayed lesson order.
- Keep user input visibly separate from trusted lesson context and system instructions.
- Measure Prompt API context usage before long requests where supported.
- Summaries use deterministic chunking and a summary-of-summaries strategy when a lesson exceeds the task API's context window.
- Structured Prompt responses use JSON Schema and runtime validation. Invalid, partial, duplicated, or unrelated data produces a recoverable error rather than an invented result.
- Streaming is used for learner-facing generative text where the API supports it. Translation may use request output for short selections and streaming for long text.

## Product and release consequences

- The static export and all existing lesson pages remain fully usable without built-in AI.
- Learning tools are enabled per capability rather than by a single browser-wide boolean.
- Browser/device support text is factual and task-specific.
- Recent history can be disabled and cleared locally; saved results remain local until explicitly deleted.
- The release matrix includes both the unsupported 2026-07-13 capture and the successful supported localhost run from 2026-07-15. ASA-106 and ASA-95 can proceed to manual approval and delivery.

## Official references

- [Built-in AI API status](https://developer.chrome.com/docs/ai/built-in-apis)
- [Built-in AI requirements and model download](https://developer.chrome.com/docs/ai/get-started)
- [Translator API](https://developer.chrome.com/docs/ai/translator-api)
- [Language Detector API](https://developer.chrome.com/docs/ai/language-detection)
- [Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api)
- [Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [Writer API](https://developer.chrome.com/docs/ai/writer-api)
- [Rewriter API](https://developer.chrome.com/docs/ai/rewriter-api)
- [Proofreader API](https://developer.chrome.com/docs/ai/proofreader-api)
- [Built-in AI production guidance](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts)
