// Line icons drawn for this site on a 24-unit grid, rendered by Icon.astro. They are decorative,
// so the text beside each one has to carry its meaning.
const page = 'M6 2.5h8l4 4v15H6z M14 2.5v4h4';

export const icons = {
  truck: '<path d="M2.5 6.5h11v9h-11z M13.5 9.5h4l3 3.5v2.5h-7"/><circle cx="6.5" cy="17.75" r="1.75"/><circle cx="16.5" cy="17.75" r="1.75"/>',
  pod: `<path d="${page} M9 14l2 2 4-4"/>`,
  document: `<path d="${page} M9 11.5h6 M9 15h6 M9 18.5h3"/>`,
  receipt: '<path d="M6 2.5h12v19l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z M9 7.5h6 M9 11h6 M9 14.5h4"/>',
  layers: '<path d="M12 3.5l8.5 4.5-8.5 4.5-8.5-4.5z M3.5 12l8.5 4.5 8.5-4.5 M3.5 16l8.5 4.5 8.5-4.5"/>',
  alert: '<path d="M12 3.5l9.5 17h-19z M12 10v4.5 M12 17.5v.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
  message: '<path d="M3.5 4.5h17v11h-9.5l-4.5 4v-4h-3z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  pause: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6 M14 9v6"/>',
  repeat: '<path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3 M17.5 3.5V7H14 M19.5 12a7.5 7.5 0 0 1-12.8 5.3 M6.5 20.5V17H10"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M6.5 10h.01 M10 10h.01 M14 10h.01 M17.5 10h.01 M8 14h8"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="1"/><path d="M15.5 8.5v-5h-12v12h5"/>',
  handoff: '<path d="M3.5 8.5h15 M15 5l3.5 3.5L15 12 M20.5 15.5h-15 M9 12l-3.5 3.5L9 19"/>',
  chart: '<path d="M3.5 3.5v17h17 M8 16.5v-4 M12 16.5v-8 M16 16.5v-6"/>',
  checklist: '<path d="M10 6.5h10.5 M10 12h10.5 M10 17.5h10.5 M3.5 6.5L5 8l2.5-2.5 M3.5 12L5 13.5 7.5 11 M3.5 17.5L5 19l2.5-2.5"/>',
  coins: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6 M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',
  pound: '<path d="M16.5 7.5a4 4 0 0 0-7.5 1.9v10.1 M6 19.5h12 M6 13.5h7"/>',
  falling: '<path d="M3 7l6 6 4-4 8 8 M21 11v6h-6"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5.8 5.8 3 3 5.8-5.8a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5 M16 4.6a3.5 3.5 0 0 1 0 6.8 M18 14.3c2.1.6 3.5 2.9 3.5 6.2"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1"/><path d="M3.5 10h17 M8 3v4 M16 3v4"/>',
  window: '<rect x="3" y="4.5" width="18" height="15" rx="1"/><path d="M3 9h18 M6.5 6.75h.01 M9 6.75h.01"/>',
  sliders: '<path d="M4 6h9 M17 6h3 M4 12h3 M11 12h9 M4 18h11 M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  link: '<path d="M10 13.5a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1 M14 10.5a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1"/>',
  disconnected: '<rect x="2.5" y="8" width="6" height="8" rx="1"/><rect x="15.5" y="8" width="6" height="8" rx="1"/><path d="M8.5 12h1.5 M14 12h1.5 M11 15l2-6"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.5"/><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13 M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5"/>',
  bolt: '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z"/>',
  gap: '<rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="3 3"/><path d="M12 9v6 M9 12h6"/>',
} as const;

export type IconName = keyof typeof icons;
