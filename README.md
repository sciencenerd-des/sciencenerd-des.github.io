# Biswajit Mondal - Portfolio

Static single-page site (`index.html` + `style.css`). No build step. Open `index.html` in a browser to preview.

## Add a Tableau dashboard
In `index.html`, each project card (Dashboard 1/2/3) has commented-out lines to enable:

1. **Screenshot:** save an image as `images/dashboard-N.png`, then in the card replace the `<span>Dashboard N - coming soon</span>` with the (uncommented) `<img ...>` line and remove the `placeholder` class from the `thumb` div.
2. **Link:** publish the workbook to Tableau Public, copy its URL, uncomment the `<a class="btn small" ...>` line and replace `TABLEAU_PUBLIC_LINK_N`.
3. **Optional embed:** in Tableau Public click Share > Embed code, and paste the code inside the `thumb` div instead of the image (use `<iframe>` sized by CSS).
4. Edit the `<h3>` title and description, and delete the "Coming soon" badge.

## Contact
Replace `your-email@example.com` in the Contact section.

## Publish on GitHub Pages
Push to a GitHub repo, then Settings > Pages > deploy from the `main` branch root.
