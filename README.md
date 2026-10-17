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

## Dashboard cards
The three interactive web dashboards live in `dashboards/` and are linked from the cards under the story.

## Page structure
Hero (with the invoice-check "working paper"), Who I help, Case studies, Dashboards (Tableau story + cards), Fixed-price packages, Tools for each job, How a project runs, About, FAQ, Contact.

- Case studies are written as problem, approach, outcome. Every number must come from the linked project files, and each case states its data source (public, sample or simulated). Don't add client names, testimonials or results that aren't real.
- FAQ answers are duplicated in the `FAQPage` JSON-LD in `<head>`; update both together.
- Prices appear in the Pricing section and in the `ProfessionalService` JSON-LD; update both together.

## Other data
The services matrix and process Gantt are built from `SERVICES` and `STEPS` in `script.js`.

## Contact
Email `bmondal0000@gmail.com` appears in `index.html` (contact section, footer and the Person JSON-LD).

Freelance profiles, linked from the contact section, the footer, the "Freelancer or Upwork" FAQ answer and the JSON-LD `sameAs`:
- Freelancer: https://www.freelancer.com/u/biswajitm024
- Upwork: https://www.upwork.com/freelancers/~01228b6c590d97c3cc

## Publish
Push to `main`; GitHub Pages serves the repo root.
