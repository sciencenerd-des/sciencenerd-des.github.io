# Biswajit Mondal — Portfolio

Static site for [sciencenerd-des.github.io](https://sciencenerd-des.github.io/). The homepage is a self-contained `index.html` (inline CSS and JavaScript). There is no build step. Preview with `python3 -m http.server` in this folder.

A copy also runs on Cloudflare Workers at `https://sciencenerd-des.sciencenerd-des.workers.dev/`. Canonical URLs stay on GitHub Pages. Use root-relative links such as `/dashboards/ecommerce.html` so both hosts resolve correctly.

## Dashboards

The three interactive web dashboards live in `dashboards/` and are linked from the homepage case studies and from the “Interactive portfolio” section (`#work`). Shared chrome and colours are in `dashboards/dash.css`; Chart.js and Plotly helpers are in `dashboards/dash.js`. Data files are under `dashboards/data/`. Preview images for the dashboards index are in `screens/`.

- [Seattle Airbnb listings](dashboards/airbnb.html)
- [Olist e-commerce analysis](dashboards/ecommerce.html)
- [Video game sales](dashboards/videogames.html)

The homepage showcase also has story tabs for GST 2B audit and channel CAC vs LTV. Those open the related GitHub repositories, not a live web dashboard.

## Page structure

The homepage uses a persistent sidebar on desktop (a slide-out drawer on smaller screens): hero and working-paper demo, who I help, case studies, live dashboards, fixed-price packages, tools, how a project runs, about, FAQ, and contact.

- Case studies are written as problem, approach, outcome. Every number must come from the linked project files, and each case states its data source (public, sample or simulated). Don't add client names, testimonials or results that aren't real.
- FAQ answers are duplicated in the `FAQPage` JSON-LD in `<head>`; update both together.
- Prices appear in the Pricing section and in the `ProfessionalService` JSON-LD; update both together.

## Contact

Email `bmondal0000@gmail.com` appears in `index.html` (contact section, footer and the Person JSON-LD). Gmail treats this as the same inbox as `b.mondal0000@gmail.com`.

Freelance profiles, linked from the contact section, the footer, and the JSON-LD `sameAs`:

- Freelancer: https://www.freelancer.com/u/biswajitm024
- Upwork: https://www.upwork.com/freelancers/~01228b6c590d97c3cc
- GitHub: https://github.com/sciencenerd-des

## Publish

Push to `main`; GitHub Pages serves the repo root. After a homepage or dashboard change, also redeploy the Cloudflare Worker from this tree (exclude `.git`, this README, and any local Wrangler config). Custom headers live in `_headers`.
