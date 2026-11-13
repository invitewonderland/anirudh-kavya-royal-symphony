# Anirudh & Kavya — A Royal Symphony of Forever

A polished, responsive, **working interactive wedding-invitation concept**, created with original fictional AI characters, eight original concept photographs, and the supplied “A Canopy of White Roses” soundtrack. No build tools, frameworks, or API keys required.

## Open the invitation

Live invitation: https://invitewonderland.github.io/anirudh-kavya-royal-symphony/

Open `index.html` in a browser. For best results, serve it over HTTP or HTTPS: open the extracted folder in VS Code, use Live Server, or deploy the folder to GitHub Pages. Keep `index.html`, `styles.css`, `luxury.css`, `script.js`, `luxury.js`, and `assets/` together. **Do not upload only the HTML file**; the site needs both stylesheets, both scripts, 8 photographs, and theme music.

## Publish to GitHub Pages

1. Create a GitHub repository (e.g., `anirudh-kavya-royal-symphony`).
2. Upload the **contents** of this folder to the repository's root.
3. Go to **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Choose the `main` branch and `/ (root)`, then save.
5. Open the Pages URL shown in settings. Share that HTTPS URL on WhatsApp or Instagram.
6. After publication, replace `<meta property="og:image" ...>` with the **absolute HTTPS URL** to `assets/social-preview.jpg` so WhatsApp/Facebook can read the best preview.

## What actually works

- **Opening stage:** tap the central gold seal *or either velvet curtain* to draw the curtains apart. “A Canopy of White Roses” begins on that tap and loops continuously, respecting mobile autoplay restrictions. There are no background music on/off controls.
- **Cinematic photo storytelling:** all eight compressed original couple portraits, staggered editorial transitions, gentle scene depth, and a chapter navigation rail on desktop. Four editorial portraits open uncropped in an accessible gallery with previous/next controls, arrow keys, and Escape to close.
- **Scratch-to-reveal date:** physically erase an engraved gold celestial seal with touch or mouse. Stardust follows the scratch; erasing 40% releases the date, a viewport-wide cascade of light and a musical signature when music is enabled. An accessible button offers the same reveal without scratching, with a screen-reader announcement.
- **Celestial countdown:** four SVG astronomical dials, fine engraved ticks, gold progress arcs, orbiting stars, and a halo on each changing second. Accurate to the configured time zone, with a past-event state. Mobile uses a spacious two-by-two layout.
- **Interactive grand piano:** two octaves, 25 touchable keys, computer keyboard shortcuts, adjustable output volume, audio compression, and a “Play their melody” demo button. Each note releases light and animates a resonance display. Scroll horizontally across the piano on smaller screens.
- **Golden-seal love letter:** tap to smoothly unfold/close the letter, with staggered lines and a soft golden flourish.
- **Blessing garden:** write a wish and a new flower card blooms. **Saved in the visitor's own browser only** for this demo; not a shared guestbook.
- **RSVP:** prepare a personalised response, copy it, or open a WhatsApp share screen. **No RSVP is sent or recorded automatically** because no couple recipient or backend has been configured.
- **Wish finale:** release a shower of stars; “Replay the magic” returns to the opening curtain.
- **Cinematic tour:** a sequenced scroll through the key chapters that can help produce an Instagram Reel screen recording.

## Demo details — replace before presenting as a real event

This is explicitly a **fictional concept invitation**, not a real wedding announcement. The demonstration uses **Sunday 24 January 2027**, sample events on 22 and 24 January, and **fictional venue labels in Santorini, Greece**. The date has not been given by a real couple. It is intentionally set up as easily replaceable demo content.

| What to customise | Where |
| --- | --- |
| Couple names and on-page wording | `index.html` |
| Date shown under the gold scratch card | `index.html`, IDs `scratchDay`, `scratchMonth`, `scratchWeekday` |
| Live countdown time | `script.js`, `CONFIG.weddingDateISO` (ISO date with Greece's local time offset) |
| Schedule, venue names, and descriptions | `index.html`, section `id="celebrations"` |
| RSVP recipient/backend | `script.js`, RSVP handlers; presently WhatsApp **share** only |
| Shared guestbook/backend | `script.js`, blessing-form handler; presently **localStorage** only |
| Pictures | Replace images in `assets/images/`, retaining filenames, or update paths in `index.html` |
| Instrumental / background music | Replace `assets/audio/A_Canopy_of_White_Roses.mp3` |
| WhatsApp preview | `assets/social-preview.jpg` and the **absolute** `og:image` URL after deployment |
| Fonts, colours, spacing | `styles.css`, root palette and style rules |

## Original photographs included

1. `01-grand-arrival.webp` — Sunset Romance on a Greek Island Terrace
2. `02-royal-romance.webp` — Golden-Hour Grecian Wedding Embrace
3. `03-love-beyond-words.webp` — Golden Sunset Santorini Wedding Embrace
4. `04-aegean-promise.webp` — Golden Sunset Santorini Wedding Romance
5. `05-royal-bride.webp` — Golden-Hour Santorini Bridal Portrait
6. `06-royal-groom.webp` — Golden Sunset Sherwani Portrait on Santorini Terrace
7. `07-symphony-of-us.webp` — Santorini Twilight Wedding Dance
8. `08-into-forever.webp` — Sunset Romance Over the Aegean

`*-thumb.webp` variants are provided for future enhancements or a gallery view. WebP images are optimised for the web; the eight main portraits total approximately 2.3 MB, plus a ~1 MB music file.

## Music

`assets/audio/A_Canopy_of_White_Roses.mp3` is the user-supplied background soundtrack. Opening the curtains starts it in a continuous loop, with no background music controls. Replaying the curtains pauses it until the invitation is opened again. If a browser initially blocks playback, the next interaction after entering retries it automatically. The interactive piano retains its own volume setting.

## Performance and accessibility

Native HTML/CSS/JS, native pointer events, touch support, Web Audio for the piano, lazy loading for below-the-fold photos, compressed WebP assets, no JS libraries, no tracking, no server requirement. The scratch also has a button fallback; the curtain has keyboard activation; there is a reduced-motion CSS mode.

The shared atmosphere canvas caps pixel density, pixel count, particle count and frame rate, using smaller budgets on mobile and modest hardware. Offscreen scenes pause their repeating animations; page visibility pauses the atmosphere. The scratch progress check samples just 64 × 40 pixels instead of reading the full-resolution surface. Reduced-motion mode disables particles and spatial effects while keeping all interactions functional. Gallery focus is contained by a native dialog; the opening and chapter menu support keyboard navigation and visible focus indicators.

`luxury.css` contains the celestial art direction and responsive refinements. `luxury.js` owns the shared particle renderer, interaction light effects, scene visibility and portrait gallery. Date, RSVP, blessings and piano behavior remain in `script.js`.

### Local verification

Run `node --check script.js`, `node --check luxury.js`, and `node tests/interactions.cjs`. The dependency-free, non-rendering integration harness loads the real HTML and scripts with browser APIs stubbed. It covers countdown boundaries, scratch threshold and button reveal, opening with blocked audio, the letter, menu focus, portrait navigation, blessing storage and text escaping, RSVP preparation, wish cooldown and reduced motion. It does not render CSS or measure real device performance; desktop/mobile visual inspection remains a separate check.

Google Fonts is the only optional external visual dependency; the invitation uses local serif/sans fallbacks if fonts cannot load. Audio, photos, CSS, and JavaScript are bundled locally.

## Editorial and public use note

This is an **independently created fictional couple concept**. The original AI-generated characters are not photographs of real-world celebrities. The public copy must not imply that real figures named Anirudh Ravichander or Kavya Maran commissioned, authorised, participated in, or endorsed this experience.
