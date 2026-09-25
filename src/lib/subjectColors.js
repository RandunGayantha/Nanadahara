// Fixed categorical order (never cycled) — validated for CVD-safe adjacent pairs.
const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']

export const SUBJECT_ORDER = ['Maths', 'Science', 'English', 'History', 'ICT', 'Commerce']

export function colorForSubject(subject) {
  const idx = SUBJECT_ORDER.indexOf(subject)
  return PALETTE[idx >= 0 ? idx % PALETTE.length : PALETTE.length - 1]
}
