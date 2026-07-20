# Learning tools: a user guide

LangCompass helps you explore German topics by level, theme, grammar, and communication goal. Its full lesson pages contain curated explanations, examples, common mistakes, and related topics.

Learning tools add optional, task-specific help to those lessons. You can translate a passage, ask for another explanation, create practice examples, summarize a lesson, or check a German sentence. The tools use AI built into supported desktop versions of Chrome and run on your device.

The learning tools are not a chatbot, a course, or a replacement for the lesson. They do not automatically change lesson content or your writing. Treat every generated result as a study aid: compare important details with the curated lesson and make the final decision yourself.

## What can I do?

| If you want to… | Choose… | What you receive |
| --- | --- | --- |
| Understand a German or English passage | **Translate** | The original passage and its translation side by side |
| Understand meaning, form, or sentence structure | **Explain** | A focused explanation based on the current lesson |
| Practise a rule with fresh sentences | **More examples** | Three German examples with hidden translations and usage notes |
| Review a complete lesson quickly | **Summarize lesson** | A recap in the format you choose |
| Improve something you wrote in German | **Check my sentence** | Your original, a suggested correction, what changed, why, and sometimes an alternative |

Each tool is checked separately. For example, translation may be available even when lesson summaries are not.

## Get started

1. Open a topic that has a full lesson.
2. Use a **Translate**, **Explain**, or **More examples** button beside the part of the lesson you are studying. You can also select **Open learning tools** to see every tool.
3. Check the **Source context**. This shows the lesson passage or rule the tool will use.
4. Choose any available options, such as explanation focus, example difficulty, or summary format.
5. Select **Generate**. If Chrome needs a model or language pack first, select **Download & generate** instead.
6. Read the result, compare it with the lesson, and then copy, save, regenerate, or delete it.

You can close the learning-tools panel at any time and continue reading the lesson. Your selected source and options remain available during normal navigation in the same browser session.

Use **Manage AI storage** at the top of the panel when you want to remove downloaded browser models. This opens the browser-wide removal guidance; it is not placed inside individual tool tabs because several tools share the same model.

## How to use each tool

### Translate a lesson passage

Use a **Translate** button beside an example to open it directly, or select **Translate** in the learning-tools panel. The **German sentence** menu lists every curated German example on the lesson page, so you can choose exactly which sentence to translate. German is always the source language; use **Translate into** to choose any target language currently documented by Chrome.

1. Confirm the passage under **Source context**.
2. Choose the target language under **Translate into**. German is always the source.
3. Select **Generate**.

The result keeps the selected original and its translation visible side by side. Translation is available only when the lesson provides curated German examples.

### Ask for an explanation

Use **Explain** when a lesson point still feels unclear. Choose what kind of help you need:

- meaning and usage;
- one word or phrase;
- sentence structure;
- why a particular form is used;
- a contrast between alternatives;
- a mental model;
- a comparison table; or
- a reusable pattern.

After generating the result, select **Simpler** if you want the same point explained more plainly.

### Create more examples

Use **More examples** to practise the rule or idea shown under **Source context**.

1. Choose **Easier**, **Same difficulty**, or **More challenging**.
2. Select **Generate**.
3. Try to understand each German example before selecting **Reveal translation**.
4. Read the usage note, or select **Explain this example** to explore one sentence in more detail.

Select **Another example** when you want a fresh set based on the same lesson point.

### Summarize a lesson

**Summarize lesson** uses the complete displayed lesson, not only the passage currently visible on screen. Choose the format that matches your goal:

- **Quick recap** for a short overview;
- **Key rules** for the main language points;
- **Five bullets** for a scannable review; or
- **Revision card** for later study.

Summaries and new examples require a full curated lesson. They are unavailable on topics that currently show only catalog information.

### Check your German sentence

Use **Check my sentence** to review your own writing without replacing it.

1. Enter one German sentence in **Your German sentence**.
2. Select **Generate**.
3. Compare your original with the suggested correction.
4. Review **What changed** and **Why** before deciding whether to use it.

You can select **Copy correction** or **Try another** when you are ready. A result may also say that your sentence is already correct. Your original always remains visible.

## A five-minute first try

If you are unsure where to begin, try this sequence on one full lesson:

1. Translate one example sentence.
2. Ask for an explanation of its sentence structure.
3. Generate three examples at the same difficulty and reveal their translations only after reading them.
4. Create a quick recap of the complete lesson.
5. Check a sentence of your own, or try `Ich lernt Deutsch jeden Tag.` and inspect the suggested change.

This gives you a quick tour without turning the tools into the main learning experience.

## Results, saved items, and history

Generated results appear in **Results**. Every result is marked as AI-generated and can be inaccurate.

- **Recent** contains up to 20 unsaved results from the last seven days.
- **Saved** contains results you explicitly save. They remain until you delete or unsave them.
- **Copy** copies the visible generated output.
- **Regenerate** asks for a new result using the same task and source.
- **Delete** removes one result.
- **Clear recent**, **Delete all saved**, and **Delete everything** remove larger groups after confirmation.

Use **Filter by tool** to show results from only one activity. Turn off **Keep recent results for seven days** if you do not want automatic recent history. You can still save individual results while recent history is off.

Results belong only to the current Chrome profile on the current device. They do not sync to another browser, profile, or device.

## Privacy and control

LangCompass does not require an account, API key, or paid AI subscription for these tools. The selected lesson context, your sentence, and generated result are processed through Chrome's on-device AI features. LangCompass does not send them to its own AI server or an analytics service.

LangCompass does not request a model download or start generation simply because you opened a lesson. It asks the browser to create the tool only after you select **Download & generate**. Chrome still manages its own models and resources, and your organization may restrict or disable the underlying features.

Recent and saved results are stored as site data in your current browser profile. Clearing LangCompass site data, using private browsing, or changing profiles can remove or hide them. Use the deletion controls in **Results** when you want to remove them deliberately.

## Availability and downloads

Learning tools are an optional enhancement for supported desktop Chrome installations. They are not currently presented as a mobile Chrome feature. Availability can depend on:

- your Chrome version and browser policy;
- your operating system and device hardware;
- free storage;
- the selected languages; and
- whether Chrome's local model or language pack is ready.

The first use of a tool can require a large download, usually best attempted on an unmetered connection. If Chrome reports download progress, LangCompass displays it. You can keep reading the lesson while downloading or generating.

The normal LangCompass explorer and lessons remain usable when one or every learning tool is unavailable.

### Remove downloaded models

LangCompass cannot delete browser-managed model files directly. Chrome shares its generative foundation model across LangCompass tools, other websites, and Chrome features, so model removal is browser-wide rather than per learning tool.

To remove Chrome's downloaded generative AI models and free their disk space:

1. Open the Chrome menu and select **Settings**.
2. Open **System**.
3. Turn off **On-device AI**.

You can also paste `chrome://settings/system` into Chrome's address bar. A website cannot open this protected address for you. Turning **On-device AI** on again allows Chrome to download the models again when an eligible feature needs them.

Translation uses separate language-pair packs. Chrome does not currently expose a website API for deleting one translation pack, so LangCompass cannot provide a working per-language or per-tab removal button. Destroying an active Translator session releases runtime resources but does not remove the downloaded pack from disk.

Browser model removal and LangCompass result deletion are separate. Turning off **On-device AI** does not delete recent or saved results; use the controls under **Results** for those.

## Frequently asked questions

### Is this a chatbot?

No. Each tool performs one clearly defined learning task using the lesson as context. There is no open-ended conversation or personal learning profile.

### Do I need an account or API key?

No. LangCompass does not require an account, API key, or cloud AI subscription for the learning tools.

### Which browser and device should I use?

Use a supported desktop version of Chrome. Support still depends on Chrome's built-in AI availability, your device, languages, storage, and browser policy. Another browser may continue to show the normal lessons without offering these tools.

### Why does the button say “Download & generate”?

Chrome has reported that the required on-device model or language pack can be downloaded. Selecting the button gives permission to start that download and then run the task. LangCompass does not start it automatically.

### Will the tools work offline?

Do not rely on offline use. Chrome must first have the required model and language resources, and the browser controls whether a particular task is available. Finish any required downloads while connected before experimenting offline.

### Can I remove a model for only one learning tool?

No. Explain, More examples, Summarize lesson, and Check my sentence can share Chrome's generative foundation model, and Chrome does not let websites delete it. Use **Manage AI storage** for Chrome's browser-wide removal steps. Translation packs are also browser-managed and do not currently have a website-accessible per-pack delete API.

### Is my sentence sent to LangCompass?

It is not sent to a LangCompass AI server. Chrome processes it through the selected on-device feature. If recent history is enabled, the sentence is stored locally with its result on this device.

### Can the AI change the lesson or my writing?

No. Generated content is kept separate from the curated lesson, and sentence checking preserves your original. You decide whether to copy or use a suggestion.

### How long are my results kept?

LangCompass keeps at most 20 unsaved recent results for seven days. Saved results stay until you delete or unsave them. Browser site-data clearing can remove both sooner.

### Why did a result disappear?

An unsaved result may have reached the seven-day age limit or fallen outside the 20-result limit. Results can also disappear after site data is cleared, in private browsing, or when you switch device or browser profile.

### What should I do if a result looks wrong?

Compare it with the curated lesson. You can regenerate once or try a more specific tool option, but do not treat repeated output as proof that it is correct. Generated language can be incomplete, inaccurate, or unnatural.

### What happens if I cancel a task or generation fails?

Your source passage, selected options, and sentence remain in the workspace so you can retry. Canceling does not change the lesson or your original sentence.

### Can I use LangCompass without the learning tools?

Yes. The curriculum explorer and curated lessons are the core platform. Learning tools are optional and can be ignored completely.

## Troubleshooting

| What you see | What it means and what to try |
| --- | --- |
| **API not available in this browser** | Continue with the normal lesson. Update Chrome if appropriate, but do not bypass browser or organization policy. |
| **Device or language requirements are not met** | This task is unavailable for the current setup. Try another learning tool because support is checked separately. |
| The download does not finish | Keep reading and retry later on a stable, unmetered connection. Make sure the device has enough free storage. |
| Generation was canceled or failed | Check the source and options, then retry. Your input has been preserved. |
| The generated result cannot be displayed | The result did not have a safe, readable structure. Retry rather than relying on a partial result. |
| Copy is blocked | Select the visible text and copy it manually. |

## For contributors

This page is the public usage guide. The implementation contract, current browser API maturity, and verification evidence are recorded separately in [the on-device learning tools decision record](decisions/2026-07-13-on-device-learning-tools.md) and [the evaluation record](evaluations/2026-07-13-learning-tools.md).
