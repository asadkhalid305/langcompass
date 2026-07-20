import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Cpu, Download, ExternalLink, HardDrive, LockKeyhole, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react"

import { LangCompassLogo } from "@/components/branding/langcompass-logo"

export const metadata: Metadata = {
  title: "On-device AI learning tools",
  description: "How LangCompass on-device AI works, including privacy, downloads, storage, device requirements, browser support, and troubleshooting.",
}

const chromeRequirements = [
  "Windows 10 or 11, macOS 13 or newer, Linux, or a supported Chromebook Plus device",
  "At least 22 GB free on the volume containing the Chrome profile",
  "Either more than 4 GB GPU memory, or at least 16 GB system memory and four CPU cores",
  "An unmetered connection for the initial model or language-pack downloads",
]

const quickFacts: Array<{ Icon: LucideIcon; title: string; text: string }> = [
  { Icon: Download, title: "Downloads require your action", text: "LangCompass does not request a model download when you open a lesson. It asks the browser to create a tool only after you explicitly choose Download & generate." },
  { Icon: Cpu, title: "Chrome chooses and runs the model", text: "LangCompass does not host an AI model or send a prompt to an AI server. The browser creates the appropriate local session for the selected task." },
  { Icon: ShieldCheck, title: "Generated content stays separate", text: "AI output is labelled, stored separately from the curated lesson, and never silently replaces lesson content or your original sentence." },
  { Icon: HardDrive, title: "History is local site data", text: "Recent and saved results belong to this browser profile and device. They do not sync to another profile, browser, or computer." },
]

const troubleshooting = [
  ["This API is not available", "Update to the latest desktop Chrome. The normal lesson remains available even when AI is not."],
  ["Device requirements are not met", "Check free storage and hardware requirements. A different tool may still work because every API is checked separately."],
  ["Download does not begin", "Use a stable, unmetered connection, restart Chrome, and retry after confirming enough free storage."],
  ["A model was available before but disappeared", "Chrome may remove models after prolonged inactivity, policy changes, or when free storage falls below its safety threshold."],
  ["A target language is unavailable", "Chrome checks each language pair separately. Choose another target language or retry after updating Chrome."],
  ["Generation is slow", "Local generation speed depends on the model Chrome selected and the available CPU, GPU, and memory. You can cancel without losing your source or input."],
]

export default function LearningToolsInfoPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[linear-gradient(180deg,#FFFDF8_0%,#FFFFFF_42%,#F8FAFC_100%)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Go to LangCompass overview">
            <LangCompassLogo compact />
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 border border-border bg-white px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_#111827] hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to lessons
          </Link>
        </div>

        <header className="mt-8 border border-[#111827] bg-[#111827] px-5 py-8 text-white shadow-[7px_7px_0_#F97316] md:px-9 md:py-11">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-300"><Sparkles className="h-4 w-4" aria-hidden="true" />On-device AI guide</p>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-tight md:text-5xl">Before you use Learning tools</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
            LangCompass can ask AI built into a supported browser to translate, explain, create examples, summarize lessons, and check a sentence. The work happens on your device, but it can require browser-managed downloads, storage, memory, and processing power.
          </p>
          <p className="mt-5 max-w-3xl border-l-4 border-orange-400 pl-4 text-sm leading-relaxed text-white/75">
            Learning tools are optional. The curriculum explorer and every curated lesson continue to work without them.
          </p>
        </header>

        <nav className="mt-8 border border-border bg-white p-5 shadow-[4px_4px_0_rgba(17,24,39,0.14)]" aria-label="On this page">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">On this page</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#how-it-works">How it works</a>
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#privacy">Privacy</a>
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#downloads">Downloads and impact</a>
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#remove-models">Remove models</a>
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#requirements">Requirements</a>
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#browsers">Browsers</a>
            <a className="border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40" href="#troubleshooting">Troubleshooting</a>
          </div>
        </nav>

        <section id="how-it-works" className="mt-8 scroll-mt-6 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">The short version</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickFacts.map(({ Icon, title, text }) => (
              <article key={title} className="border border-border bg-muted/10 p-4">
                <Icon className="h-5 w-5 text-orange-600" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="privacy" className="mt-8 scroll-mt-6 border border-emerald-300 bg-emerald-50/50 p-5 md:p-8">
          <div className="flex items-center gap-3"><LockKeyhole className="h-6 w-6 text-emerald-700" aria-hidden="true" /><h2 className="font-display text-2xl font-semibold md:text-3xl">What stays private</h2></div>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-emerald-950 md:text-base">
            <p>The selected lesson passage, a sentence you write, and the generated response are processed through the browser&apos;s on-device API. LangCompass has no AI backend, account, API key, or cloud fallback.</p>
            <p>Chrome states that after the required browser model has been downloaded, model input is processed locally and is not sent to Google or another third party. Edge makes a similar statement for its built-in models.</p>
            <p>If recent history is enabled, LangCompass stores the source and result in this site&apos;s IndexedDB storage. Use Results to delete individual or filtered groups. Clearing LangCompass site data removes those results, but it does not necessarily remove browser-managed AI models.</p>
          </div>
        </section>

        <section id="downloads" className="mt-8 scroll-mt-6 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Storage and performance</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Downloads and impact on your machine</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground md:text-base">
            <p><strong>There is no single honest download-size number.</strong> Translation uses language-pair packs, while explanation, examples, summaries, and sentence checking can use a foundation model plus task-specific resources. Exact sizes can change with browser and model updates.</p>
            <p>Chrome requires at least <strong>22 GB of free space</strong> before it will make foundation-model tools available. This is an eligibility and safety requirement—not a claim that LangCompass downloads 22 GB. Chrome says the actual model is significantly smaller and exposes its current size in <code className="border border-border bg-muted px-1 py-0.5">chrome://on-device-internals</code>.</p>
            <p>Chrome manages downloads and updates in the background. A model update can involve downloading a complete replacement. If free storage later falls below 10 GB, Chrome may remove the model and download it again when requirements are met.</p>
            <p>While generating, the browser uses local CPU or GPU capacity and memory. On some machines this can temporarily increase battery use, heat, fan activity, or response time. You can cancel generation, close the panel, or ignore Learning tools completely.</p>
          </div>
        </section>

        <section id="remove-models" className="mt-8 scroll-mt-6 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Free disk space</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">How to remove downloaded models</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground md:text-base">
            <p><strong>Model removal is controlled by Chrome, not by LangCompass.</strong> The browser can share one foundation model across explanation, examples, summaries, sentence checking, other websites, and Chrome features. A per-tool delete button would therefore suggest separation that does not exist.</p>
            <div className="border border-border bg-muted/15 p-4">
              <p className="font-semibold">In desktop Chrome:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Open the Chrome menu and select <strong className="text-foreground">Settings</strong>.</li>
                <li>Open <strong className="text-foreground">System</strong>.</li>
                <li>Turn off <strong className="text-foreground">On-device AI</strong>.</li>
              </ol>
              <p className="mt-3 text-muted-foreground">Chrome deletes its downloaded generative AI models and frees their disk space. If you turn the setting on again, Chrome can download the models again when an eligible feature needs them.</p>
              <p className="mt-3 text-muted-foreground">You can paste <code className="border border-border bg-white px-1 py-0.5">chrome://settings/system</code> into Chrome&apos;s address bar. Websites cannot open protected <code className="border border-border bg-white px-1 py-0.5">chrome://</code> pages for you.</p>
            </div>
            <p><strong>Translation is different.</strong> It uses language-pair packs rather than the shared generative foundation model. Chrome does not currently expose a website API for deleting an individual translation pack, so LangCompass cannot offer an honest per-language removal control.</p>
            <p>Removing browser models does not delete your recent or saved LangCompass results. Those are separate site data and remain under <strong>Results</strong> until their retention period expires or you delete them.</p>
          </div>
        </section>

        <section id="requirements" className="mt-8 scroll-mt-6 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Full toolset</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Device requirements</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Translation has lighter, language-pack-specific requirements. The complete LangCompass toolset also uses browser foundation-model APIs, for which Chrome currently documents these requirements:</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {chromeRequirements.map((requirement) => <li key={requirement} className="border-l-4 border-orange-500 bg-muted/15 px-4 py-3 text-sm leading-relaxed">{requirement}</li>)}
          </ul>
          <p className="mt-5 border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">Meeting these numbers does not guarantee every API or language pair. Browser policy, model rollout, profile eligibility, and exact task options can still affect availability. LangCompass checks each tool separately.</p>
        </section>

        <section id="browsers" className="mt-8 scroll-mt-6 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Compatibility</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Which browser should you use?</h2>
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead className="bg-muted/30"><tr><th className="border-b border-r border-border px-4 py-3">Browser</th><th className="border-b border-r border-border px-4 py-3">Current guidance</th><th className="border-b border-border px-4 py-3">What to expect</th></tr></thead>
              <tbody>
                <tr><th scope="row" className="border-b border-r border-border px-4 py-3">Desktop Chrome</th><td className="border-b border-r border-border px-4 py-3">Use the latest version; Chrome 149+ is recommended for the complete multilingual experience.</td><td className="border-b border-border px-4 py-3">LangCompass&apos;s primary supported and tested browser. Translator and Summarizer shipped in Chrome 138; the web Prompt API shipped in Chrome 148.</td></tr>
                <tr><th scope="row" className="border-b border-r border-border px-4 py-3">Microsoft Edge</th><td className="border-b border-r border-border px-4 py-3">Edge 148+ exposes matching Translator and Prompt APIs, but complete LangCompass coverage is not yet validated.</td><td className="border-b border-border px-4 py-3">Best-effort support. Individual tools may be ready, unavailable, or experimental depending on Edge version, channel, device, and policy.</td></tr>
                <tr><th scope="row" className="border-r border-border px-4 py-3">Mobile, Firefox, Safari, and others</th><td className="border-r border-border px-4 py-3">Do not rely on the current Learning tools.</td><td className="px-4 py-3">The normal LangCompass explorer and lessons remain fully usable.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">API maturity</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Why one tool may work while another does not</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className="border border-border p-4"><h3 className="font-semibold">Translate</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Uses the task-specific Translator API and a pack for the exact German-to-target-language pair.</p></article>
            <article className="border border-border p-4"><h3 className="font-semibold">Summarize lesson</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Uses the Summarizer API and a browser foundation model.</p></article>
            <article className="border border-border p-4"><h3 className="font-semibold">Explain and More examples</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use the Prompt API, which requires newer browser and multilingual model support.</p></article>
            <article className="border border-border p-4"><h3 className="font-semibold">Check my sentence</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Uses Proofreader when the browser provides it, otherwise the Prompt API. Proofreader availability is still more experimental.</p></article>
          </div>
        </section>

        <section id="troubleshooting" className="mt-8 scroll-mt-6 border border-border bg-white p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">When it does not work</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Troubleshooting</h2>
          <div className="mt-5 divide-y divide-border border border-border">
            {troubleshooting.map(([problem, advice]) => <div key={problem} className="grid gap-2 px-4 py-4 md:grid-cols-[14rem_1fr]"><h3 className="font-semibold">{problem}</h3><p className="text-sm leading-relaxed text-muted-foreground">{advice}</p></div>)}
          </div>
          <div className="mt-5 border border-border bg-muted/15 p-4 text-sm leading-relaxed">
            <p className="font-semibold">Chrome diagnostic page</p>
            <p className="mt-1 text-muted-foreground">Open <code className="border border-border bg-white px-1 py-0.5">chrome://on-device-internals</code> directly in Chrome to inspect model status and current disk usage. LangCompass cannot open or change this protected browser page for you.</p>
          </div>
        </section>

        <section className="mt-8 border border-[#111827] bg-[#111827] p-5 text-white md:p-8">
          <h2 className="font-display text-2xl font-semibold">Important limits</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/80">
            <li>Generated language can be incomplete, inaccurate, unnatural, biased, or offensive.</li>
            <li>Repeated output is not proof that a language rule or translation is correct.</li>
            <li>AI results do not replace the curated lesson, a teacher, or professional advice.</li>
            <li>Browser requirements and API availability can change after this page is published.</li>
          </ul>
        </section>

        <footer className="mt-8 border-t border-border py-8 text-sm text-muted-foreground">
          <p>Requirements and model-management guidance reviewed July 20, 2026. LangCompass checks live browser availability before allowing generation.</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <a className="inline-flex items-center gap-1 font-semibold text-foreground underline underline-offset-4" href="https://developer.chrome.com/docs/ai/get-started" target="_blank" rel="noreferrer">Chrome requirements <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a className="inline-flex items-center gap-1 font-semibold text-foreground underline underline-offset-4" href="https://developer.chrome.com/docs/ai/built-in-apis" target="_blank" rel="noreferrer">Chrome API status <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a className="inline-flex items-center gap-1 font-semibold text-foreground underline underline-offset-4" href="https://developer.chrome.com/docs/ai/understand-built-in-model-management" target="_blank" rel="noreferrer">Chrome model management <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a className="inline-flex items-center gap-1 font-semibold text-foreground underline underline-offset-4" href="https://support.google.com/chrome/answer/16961953" target="_blank" rel="noreferrer">Remove Chrome AI models <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a className="inline-flex items-center gap-1 font-semibold text-foreground underline underline-offset-4" href="https://learn.microsoft.com/en-us/microsoft-edge/web-platform/translator-api" target="_blank" rel="noreferrer">Edge Translator API <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </footer>
      </div>
    </main>
  )
}
