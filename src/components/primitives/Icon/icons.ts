/**
 * The hand-picked icon set (PRD §10.8). One geometric family, 1.5px stroke on a
 * 24×24 grid, `currentColor`. Add a glyph here only when a component needs it.
 */
export type IconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'check'
  | 'document'
  | 'inbox'
  | 'repeat'
  | 'clock'
  | 'plug'
  | 'activity'
  | 'users'
  | 'menu'
  | 'close'
  // Industry glyphs — one per target sector (design spec §9 card anatomy)
  | 'pulse'
  | 'scale'
  | 'shield'
  | 'calculator'
  | 'building'
  | 'hardhat'
  | 'briefcase'
  // UI glyphs
  | 'plus'
  | 'minus'
  | 'map'
  | 'alert'

export const ICON_PATHS: Record<IconName, string> = {
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-up-right': 'M7 17 17 7M8 7h9v9',
  check: 'M5 13l4 4L19 7',
  document: 'M7 3h7l4 4v14H7zM14 3v4h4',
  inbox: 'M4 13h4l2 3h4l2-3h4M4 13l2-8h12l2 8v6H4z',
  repeat: 'M4 9a5 5 0 0 1 5-5h9M18 4l2 2-2 2M20 15a5 5 0 0 1-5 5H6M6 20l-2-2 2-2',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4',
  activity: 'M3 12h4l3 8 4-16 3 8h4',
  users:
    'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.8M18 20a6 6 0 0 0-4-5.6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',

  // ─── Industry glyphs ───────────────────────────────────────────────────
  pulse: 'M3 12h3l2-5 4 10 2-5h7',
  scale: 'M12 4v16M7 20h10M12 7 5 9l3 5a3.5 3.5 0 0 0 6-2zM12 7l7 2-3 5a3.5 3.5 0 0 1-6-2z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  calculator: 'M6 3h12v18H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h3',
  building: 'M4 21V6l7-3 7 3v15M4 21h16M9 9h.01M13 9h.01M9 13h.01M13 13h.01M10 21v-4h4v4',
  hardhat: 'M3 17h18M4 17v-2a8 8 0 0 1 16 0v2M10 5h4v4M8 8V6M16 8V6',
  briefcase: 'M3 8h18v12H3zM9 8V5h6v3M3 13h18',

  // ─── UI glyphs ─────────────────────────────────────────────────────────
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
  /* Circled exclamation — inline form errors. Same 24×24 circle as `clock`. */
  alert: 'M12 8v4.5M12 16v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}
