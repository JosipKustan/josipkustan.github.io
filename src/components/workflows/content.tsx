import type { FC } from 'react'
import {
  CatchSchematic,
  SocialSchematic,
  RegionSchematic,
  RepublishSchematic,
  StoryFromSocialSchematic,
  CustomNewsSchematic,
  AnglesSchematic,
  TranslateSchematic,
  TranscribeSchematic,
  EditorSchematic,
  CheckSchematic,
  TraceSchematic,
} from './schematics'

// The full, growing workflow set, grouped by where it sits on the core loop
// (Sources → Workflow → Draft → Review → Decision). New workflows join an
// existing group as a new card; the page scales by adding cards, not sections.
// Copy is canonical from the Workflows page build prompt (v1). No em dashes.

export type WorkflowCard = {
  headline: string
  line: string
  body: string
  Schematic: FC
}

export type WorkflowGroup = {
  eyebrow: string
  h2: string
  sub: string
  note?: string
  cards: WorkflowCard[]
}

export const GROUPS: WorkflowGroup[] = [
  {
    eyebrow: 'Watch',
    h2: 'Watch the sources.',
    sub: "See what's worth covering, before the competition does.",
    cards: [
      {
        headline: 'Catch the story first.',
        line: 'Monitoring that flags what matters.',
        body: "Watches the sources you choose and flags the moments worth a story. It surfaces; it doesn't draft until you ask.",
        Schematic: CatchSchematic,
      },
      {
        headline: 'Stay on top of social.',
        line: 'The fastest news, from sources you trust.',
        body: "Pulls posts from the accounts you've vetted, in real time. You see the signal, not the noise.",
        Schematic: SocialSchematic,
      },
      {
        headline: 'See what a region is saying.',
        line: 'Search a topic across a part of the world.',
        body: 'Search how outlets in a specific region are covering a topic, in their own words. Read the coverage before you write yours.',
        Schematic: RegionSchematic,
      },
    ],
  },
  {
    eyebrow: 'Draft',
    h2: 'Draft the story.',
    sub: 'An input goes in. A sourced draft comes out. The editor takes it from there.',
    cards: [
      {
        headline: 'Republish a story in your voice.',
        line: 'Their reporting, your tone.',
        body: "Reads another outlet's story, lifts the context, and drafts it in your voice. A sourced draft, ready for an editor.",
        Schematic: RepublishSchematic,
      },
      {
        headline: 'Turn a social post into a story.',
        line: 'A post becomes an article.',
        body: 'Reads the post, gathers the background, and drafts the article. Every claim carries its source.',
        Schematic: StoryFromSocialSchematic,
      },
      {
        headline: 'Draft from your wires and press releases.',
        line: 'Custom News, from your feeds.',
        body: 'Reads the feeds you control and drafts publishable copy from them. You choose the feeds; NewsLabs drafts; the editor decides.',
        Schematic: CustomNewsSchematic,
      },
      {
        headline: 'Surface angles worth pursuing.',
        line: "Story ideas from what you've gathered.",
        body: 'Reads everything NewsLabs has collected for you and surfaces angles to consider. You decide which to chase.',
        Schematic: AnglesSchematic,
      },
    ],
  },
  {
    eyebrow: 'Translate',
    h2: 'Translate, localize, transcribe.',
    sub: 'Work across languages and formats, without losing your voice.',
    cards: [
      {
        headline: 'Translate and localize your stories.',
        line: 'Foreign coverage, in your language and voice.',
        body: 'Translates a story and adapts it for your audience: references, idioms, framing. This holds your voice, not raw machine translation.',
        Schematic: TranslateSchematic,
      },
      {
        headline: 'Turn audio and video into text.',
        line: 'Interviews and broadcasts, transcribed.',
        body: 'Transcribes interviews, broadcasts, and clips into clean, searchable text. A draft transcript an editor can quote from and check.',
        Schematic: TranscribeSchematic,
      },
    ],
  },
  {
    eyebrow: 'Verify',
    h2: 'Edit and verify.',
    sub: 'Shape the draft, then check every claim before it moves.',
    note: 'Source checking and tracing are about traceability, not truth. NewsLabs surfaces and links sources; the editor decides what is true.',
    cards: [
      {
        headline: 'Edit with AI, or by hand.',
        line: 'A block editor built for the desk.',
        body: 'Tighten, expand, restructure, or change tone with one action, or write it yourself. Every change is yours.',
        Schematic: EditorSchematic,
      },
      {
        headline: 'Check every claim against its source.',
        line: 'Source checking the editor can trust.',
        body: 'Lines up each claim with the source behind it and flags anything unsourced. NewsLabs shows the source. The editor verifies.',
        Schematic: CheckSchematic,
      },
      {
        headline: 'Trace every claim to where it came from.',
        line: 'Follow any line back to its source.',
        body: 'Every sentence links to the source it drew from, so the editor checks fast and approves with confidence.',
        Schematic: TraceSchematic,
      },
    ],
  },
]
