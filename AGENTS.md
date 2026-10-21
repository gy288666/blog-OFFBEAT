# Frontend design constraints

For visual or interaction changes, apply these constraints before editing and verify them before delivery.

- Follow the user's revised direction: a lavish emerald botanical observatory, expansive illustrated scenery, antique-gold orbital ornament, oversized serif typography and staggered article exhibits. Preserve reading clarity and meaningful controls. No equal three-column card layout.
- UI colors come only from semantic variables in `src/tokens.css`. Use deep emerald surfaces, ivory text and pale-gold accents. No purple/indigo gradient backgrounds or pure black/white page surfaces. WebGL artwork has a separate material palette.
- Use 4px spacing increments, 8px/16px surface radii and 1px borders. Circles are reserved for geometric art and status dots. Shadows use the shared token, reserved for overlays and elevated exhibits.
- Distinguish display, readable body, and monospaced metadata typography. Body text starts at 15px desktop / 14px mobile; metadata may be smaller.
- Preserve the requested WebGL artwork, rotating/flippable cards, and corgi. Respect reduced motion; avoid unrelated perpetual UI animations.
- Interactive elements need focus-visible, hover, pressed and applicable disabled states. Disable pending asynchronous controls until settlement; do not add artificial delays.
- Cover real loading, empty, failure, recovery and success branches. The 3D module has a loading skeleton and retry banner; local articles need no fake fetch skeleton. Storage failures must not claim persistence succeeded.
- Validate desktop/mobile layout, keyboard use, storage failure, WebGL failure/retry and existing reading/search/bookmark behavior. Reading remains usable when enhancements fail.

Run `npm run check:design` to enforce token use and prohibited patterns. Pair it with browser checks: static rules cannot assess visual hierarchy.
