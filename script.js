// Portfolio behaviour: Tableau-style story points, full-size viewer, services matrix, Gantt.
(function () {
  const $ = (s, r = document) => r.querySelector(s);

  // ---- Story points: one per dashboard. Images come from Tableau's Dashboard > Copy Image. ----
  const STORIES = [
    {
      img: "images/india-d1.jpg", w: 1600, h: 1280,
      alt: "India trade overview dashboard: export, import and trade balance totals, a 2024 line of monthly exports and imports, and monthly trade balance bars from 2022 to 2026, all in deficit.",
      wb: "India trade workbook, dashboard 1 of 2", title: "Trade overview",
      q: "Where does India's trade deficit come from?",
      b1: "Every month", b1l: "in deficit since January 2022",
      b2: "\u2212$274B", b2l: "2024 balance: $443B exports, $717B imports",
      notes: ["KPI tiles for exports, imports and balance", "Dual-axis line of monthly exports and imports", "Monthly balance bars, 2022 to 2026"],
    },
    {
      img: "images/india-d2.jpg", w: 1600, h: 1280,
      alt: "India trading partners dashboard: top 10 export destinations led by the United States, top 10 import sources led by China, and a world map sized by trade value.",
      wb: "India trade workbook, dashboard 2 of 2", title: "Trading partners",
      q: "Who are India's biggest trading partners?",
      b1: "US", b1l: "top export market, about $80B",
      b2: "China", b2l: "top import source, over $100B",
      notes: ["Top 10 export and import rankings", "Proportional-symbol world map of every partner", "Ranked by trade value in USD millions"],
    },
    {
      img: "images/himalaya-d1.jpg", w: 1600, h: 1280,
      alt: "Himalayan expedition history dashboard: expeditions by peak, yearly expedition activity, expeditions per decade peaking at 3,706 in the 2010s, and success rate by decade rising to about 70 percent.",
      wb: "Himalayan expeditions workbook, dashboard 1 of 2", title: "Expedition history",
      q: "Have Himalayan expeditions become more successful?",
      b1: "~70%", b1l: "success rate in the 2020s, up from ~25%",
      b2: "3,706", b2l: "expeditions in the 2010s, the busiest decade",
      notes: ["Joins expeditions, members and peaks tables", "Time-granularity parameter on the activity line", "Decade bins for counts and success rate"],
    },
    {
      img: "images/himalaya-d2.jpg", w: 1600, h: 1280,
      alt: "Himalayan risk dashboard: member fatality rate by decade falling below 1 percent, a scatter of peak success rate against fatality sized by expedition count, and a peak ranking led by Everest with 2,329 expeditions.",
      wb: "Himalayan expeditions workbook, dashboard 2 of 2", title: "Risk and peak ranking",
      q: "Which peaks are popular, and how risky are they?",
      b1: "<1%", b1l: "member fatality rate in recent decades",
      b2: "2,329", b2l: "Everest expeditions, the most of any peak",
      notes: ["Success vs fatality scatter, sized by expedition count", "Top N, metric and minimum-expedition parameters", "Peak ranking that follows the chosen metric"],
    },
    {
      img: "images/airbnb-d1.jpg", w: 1600, h: 1017,
      alt: "Seattle Airbnb pricing dashboard: average price per bedroom count from 90.6 to 576.4 dollars, listing counts by bedrooms, a filled map and bar chart of average price by zip code, and monthly revenue for 2016.",
      wb: "Seattle Airbnb workbook", title: "Pricing overview",
      q: "How do bedrooms and neighbourhood drive nightly price?",
      b1: "$91 to $576", b1l: "average price, 1 to 6 bedrooms",
      b2: "1,530", b2l: "one-bedroom listings, the largest group",
      notes: ["Filled zip-code map labelled with average price", "Zip codes ranked by price, colour-matched to the map", "2016 revenue trend by month"],
    },
  ];

  const pts = [...document.querySelectorAll(".pt")];
  const img = $("#shot-img");
  const stage = $("#stage");
  let cur = 0;

  // Warm the cache so switching story points is instant.
  window.addEventListener("load", () => STORIES.forEach((s) => { const i = new Image(); i.src = s.img; }));

  function show(i, focus) {
    const n = STORIES.length;
    i = (i + n) % n;
    if (i === cur && !focus) return;
    cur = i;
    const s = STORIES[i];
    pts.forEach((p, j) => {
      const on = j === i;
      p.setAttribute("aria-selected", String(on));
      p.tabIndex = on ? 0 : -1;
    });
    stage.setAttribute("aria-labelledby", pts[i].id);
    if (focus) pts[i].focus();
    pts[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });

    img.classList.add("is-swapping");
    const next = new Image();
    next.onload = next.onerror = () => {
      img.src = s.img; img.width = s.w; img.height = s.h; img.alt = s.alt;
      img.classList.remove("is-swapping");
    };
    next.src = s.img;

    $("#s-wb").textContent = s.wb;
    $("#s-title").textContent = s.title;
    $("#s-q").textContent = s.q;
    $("#s-b1").textContent = s.b1; $("#s-b1l").textContent = s.b1l;
    $("#s-b2").textContent = s.b2; $("#s-b2l").textContent = s.b2l;
    const ul = $("#s-notes");
    ul.replaceChildren(...s.notes.map((t) => Object.assign(document.createElement("li"), { textContent: t })));
    $("#story-count").textContent = i + 1 + " of " + n;
  }

  pts.forEach((p, i) => p.addEventListener("click", () => show(i)));
  // Arrow keys move between story points, like a tab list.
  $("#story-nav").addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); show(cur + 1, true); }
    else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); show(cur - 1, true); }
    else if (k === "Home") { e.preventDefault(); show(0, true); }
    else if (k === "End") { e.preventDefault(); show(STORIES.length - 1, true); }
  });
  $("#prev").addEventListener("click", () => show(cur - 1));
  $("#next").addEventListener("click", () => show(cur + 1));

  // ---- Full-size viewer ----
  const lightbox = $("#lightbox");
  function openFull() {
    const big = $("img", lightbox);
    big.src = img.src; big.alt = img.alt;
    if (lightbox.showModal) lightbox.showModal(); else window.open(img.src, "_blank");
  }
  $("#shot").addEventListener("click", openFull);
  $("#full").addEventListener("click", openFull);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

  // ---- Services by tool (2 = main tool, 1 = also used) ----
  const TOOLS = ["Tableau", "Power BI", "Excel", "SQL", "Python", "R"];
  const LEVEL = ["Not used", "Also used", "Main tool"];
  const SERVICES = [
    ["Interactive dashboards", "Dashboards your team can filter and explore", [2, 2, 1, 1, 0, 0]],
    ["Data cleaning and prep", "Messy exports turned into tidy, documented tables", [0, 0, 2, 2, 2, 1]],
    ["Reporting automation", "Weekly and monthly reports that build themselves", [0, 1, 2, 1, 2, 0]],
    ["Statistical analysis and A/B tests", "Clear answers on what changed and whether it matters", [0, 0, 1, 0, 2, 2]],
    ["Financial and audit analytics", "Reconciliations, variance checks, exception reports", [1, 1, 2, 2, 1, 0]],
    ["KPI design and data modeling", "Metric definitions and models that stay consistent", [2, 2, 1, 2, 0, 0]],
  ];
  const mx = $("#mx");
  mx.tHead.rows[0].insertAdjacentHTML("beforeend", TOOLS.map((t) => '<th scope="col">' + t + "</th>").join(""));
  mx.tBodies[0].innerHTML = SERVICES.map(([name, note, use]) =>
    '<tr><th scope="row"><b>' + name + "</b><span>" + note + "</span></th>" +
    use.map((v, i) => '<td title="' + TOOLS[i] + ": " + LEVEL[v].toLowerCase() + '"><span class="dot dot-' + v +
      '"></span><span class="sr">' + LEVEL[v] + "</span></td>").join("") + "</tr>"
  ).join("");

  // ---- Process Gantt ----
  const STEPS = [
    ["Intro call and brief", "Agreed scope and timeline", 1, 1, "var(--orange)"],
    ["Data access and audit", "A list of data issues found", 1, 3, "var(--teal)"],
    ["Cleaning and modeling", "Clean, documented dataset", 3, 3, "var(--teal)"],
    ["First dashboard draft", "A working draft link", 5, 4, "var(--blue)"],
    ["Review and changes", "Changes from your feedback", 8, 3, "var(--blue)"],
    ["Handover", "Final files and a walkthrough", 10, 1, "var(--green)"],
  ];
  $("#gantt").innerHTML = STEPS.map(([name, gets, s, d, c]) =>
    '<li class="g-row"><p class="g-label"><b>' + name + "</b><span>" + gets + "</span></p>" +
    '<div class="g-track"><span class="g-bar" style="--s:' + s + ";--d:" + d + ";--c:" + c + '"></span>' +
    '<span class="sr">Day ' + s + (d > 1 ? " to " + (s + d - 1) : "") + "</span></div></li>"
  ).join("");
  $("#g-axis").innerHTML = '<span></span><div class="g-days">' +
    Array.from({ length: 10 }, (_, i) => '<span data-d="' + (i + 1) + '">Day ' + (i + 1) + "</span>").join("") + "</div>";

  $("#y").textContent = new Date().getFullYear();
})();
