# Biswajit Mondal - Portfolio

Static single-page site (`index.html` + `style.css` + `script.js`). No build step. Preview with `python3 -m http.server` in this folder.

The dashboards are shown as a Tableau-style **Story**: a row of captioned story points, each opening one dashboard with its notes.

## Add or update a dashboard
1. In Tableau Desktop, open the dashboard tab, then **Dashboard > Copy Image** (maximise the window first for dashboards with automatic sizing).
2. Save the clipboard to a file (macOS):
   `osascript -e 'set f to open for access POSIX file "/tmp/dash.png" with write permission' -e 'write (the clipboard as «class PNGf») to f' -e 'close access f'`
3. Make a web copy: `sips -Z 1600 -s format jpeg -s formatOptions 84 /tmp/dash.png --out images/<name>.jpg`
4. Add an entry to `STORIES` in `script.js` (image, size, alt text, workbook line, title, question, two key numbers, three notes) and a matching `<button class="pt" role="tab" id="pt-N">` with its caption in `index.html`. Captions are findings, written as one plain sentence.
5. Five story points fit one row on desktop; more than five scroll sideways.

## In-progress cards
The video game sales and e-commerce cards under the story are placeholders (`.card.wip`). When a dashboard is ready, add it as a story point and delete its card.

## Other data
The services matrix, process Gantt and background timeline are built from `SERVICES`, `STEPS` and `TIMELINE` in `script.js`.

## Contact
Email `bmondal0000@gmail.com` appears in `index.html` (header, contact section).

## Publish
Push to `main`; GitHub Pages serves the repo root.
