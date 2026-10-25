// Review page for the visual identity exploration. No build step and no dependencies:
// everything is rendered from manifest.js; SVGs are referenced, never copied.
(function () {
  const M = window.VI_MANIFEST;
  const HASH = window.VI_ASSETS || {};
  const $ = (sel) => document.querySelector(sel);
  const h = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    [].concat(children).forEach((c) => c && el.append(c));
    return el;
  };

  const src = (conceptId, scenario) => {
    const path = `${conceptId}/${scenario.file}`;
    return HASH[path] ? `${path}?v=${HASH[path]}` : path;
  };
  const scenarioById = (id) => M.scenarios.find((s) => s.id === id);
  const conceptById = (id) => M.concepts.find((c) => c.id === id);
  // Latest iteration first.
  const iterations = [...M.iterations].sort((a, b) => b.id - a.id);
  const conceptsOf = (it) => M.concepts.filter((c) => c.iteration === it.id);

  const D = M.decision;
  const chosen = conceptById(D.selected);
  const isChosen = (c) => c.id === D.selected;
  const statusChip = (c) =>
    c.status
      ? h("span", {
          class: `status${isChosen(c) ? " selected" : ""}`,
          text: c.status,
        })
      : null;
  $("#meta").textContent =
    `${D.title} · ${M.concepts.length} concept · aggiornata il ${M.updated}`;
  $(".selected-tab").setAttribute("href", `#concept/${chosen.id}`);
  // The selected concept has its own tab; the others follow as history.
  M.concepts
    .filter((c) => !isChosen(c))
    .forEach((c) =>
      $("#concept-tabs").append(
        h("a", { href: `#concept/${c.id}`, text: c.name }),
      ),
    );

  // ---------------------------------------------------------------- decision
  const list = (items) =>
    h(
      "ul",
      {},
      items.map((t) => h("li", { text: t })),
    );
  const decisionBanner = (withThumb) =>
    h("article", { class: "decision" }, [
      withThumb
        ? h(
            "button",
            {
              class: "thumb",
              type: "button",
              title: "Ingrandisci",
              onclick: () => openViewer(chosen.id, "landing"),
            },
            h("img", {
              src: src(chosen.id, scenarioById("landing")),
              alt: `${chosen.name}, landing`,
            }),
          )
        : null,
      h("div", { class: "body" }, [
        h("div", { class: "title-row" }, [
          h("h2", { text: D.title }),
          statusChip(chosen),
        ]),
        h("p", { text: D.summary }),
        h("div", { class: "links" }, [
          h("a", {
            href: `#concept/${chosen.id}`,
            text: "Tutte le schermate →",
          }),
          h("a", {
            href: "#",
            text: "Identity sheet",
            onclick: (e) => {
              e.preventDefault();
              openViewer(chosen.id, "identity");
            },
          }),
          h("a", { href: "#decisioni", text: "Stato delle decisioni" }),
          h("a", { href: D.docs, text: "Documentazione" }),
        ]),
      ]),
    ]);

  $("#decisions").append(
    h("h2", { text: "Decisioni" }),
    h("p", {
      class: "lead",
      text: `${chosen.name} selezionata il ${D.date}. Documentazione completa nel README del concept; razionale della selezione nel confronto dell’iterazione 3.`,
    }),
    h("p", { class: "note" }, [
      h("a", { href: D.docs, text: `${chosen.name} — README` }),
      " · ",
      h("a", { href: D.rationale, text: D.rationale }),
    ]),
    h("div", { class: "assessment-grid" }, [
      h("article", {}, [
        h("h3", { text: "Consolidate" }),
        h("p", {
          class: "note",
          text: "Approvate; baseline per il frontend.",
        }),
        list(D.consolidated),
      ]),
      h("article", {}, [
        h("h3", { text: "Provvisorie" }),
        h("p", {
          class: "note",
          text: "Da verificare durante l’implementazione, partendo da quanto disegnato.",
        }),
        list(D.provisional),
      ]),
      h("article", {}, [
        h("h3", { text: "Attività future" }),
        h("p", { class: "note", text: "Non ancora progettate o risolte." }),
        list(D.future),
      ]),
    ]),
    h("p", { class: "note", text: D.note }),
    h("h2", { class: "iteration", text: "Storico delle decisioni" }),
    h(
      "ol",
      { class: "history" },
      D.history.map((d) => {
        const it = M.iterations.find((x) => x.id === d.iteration);
        return h("li", {}, [
          h("strong", { text: it.title }),
          h("span", { text: ` ${d.outcome} ` }),
          h("a", { href: d.doc, text: d.doc }),
          h("span", { text: " · " }),
          h("a", {
            href: "#",
            text: "Schermate a confronto",
            onclick: (e) => {
              e.preventDefault();
              selected = conceptsOf(it).map((c) => c.id);
              if (location.hash === "#scenari") route();
              else location.hash = "#scenari";
            },
          }),
        ]);
      }),
    ),
  );

  // ---------------------------------------------------------------- overview
  $("#overview").append(
    decisionBanner(true),
    h("h2", { class: "iteration", text: "Storico dell’esplorazione" }),
    h("p", {
      class: "lead",
      text: "Tutti i concept, dall’ultima iterazione alla prima. Restano consultabili come storico; non sono alternative in valutazione.",
    }),
  );
  iterations.forEach((it) => {
    $("#overview").append(
      h("h3", { class: "iteration", text: it.title }),
      h("p", { class: "lead", text: it.summary }),
      h(
        "div",
        { class: "concepts" },
        conceptsOf(it).map((c) =>
          h("article", { class: "concept-card" }, [
            h(
              "button",
              {
                class: "thumb",
                type: "button",
                title: "Ingrandisci",
                onclick: () => openViewer(c.id, "landing"),
              },
              h("img", {
                src: src(c.id, scenarioById("landing")),
                alt: `${c.name}, landing`,
                loading: "lazy",
              }),
            ),
            h("div", { class: "body" }, [
              h("div", { class: "title-row" }, [
                h("h3", { text: c.name }),
                statusChip(c),
              ]),
              h("p", { class: "tagline", text: c.tagline }),
              h("p", { text: c.summary }),
              h(
                "div",
                { class: "swatches", "aria-label": "Palette" },
                c.swatches.map((hex) =>
                  h("span", { style: `background:${hex}`, title: hex }),
                ),
              ),
              h("div", { class: "fonts", text: c.fonts }),
              h("div", { class: "links" }, [
                h("a", {
                  href: `#concept/${c.id}`,
                  text: "Tutte le schermate →",
                }),
                h("a", { href: `${c.id}/README.md`, text: "Documentazione" }),
              ]),
            ]),
          ]),
        ),
      ),
    );
  });

  // ---------------------------------------------------------------- scenarios side by side
  let currentScenario = M.scenarios[0].id;
  let selected = [...M.presets[0].concepts];
  const picker = $("#scenario-picker");
  M.scenarios.forEach((s) =>
    picker.append(
      h("button", {
        type: "button",
        "data-id": s.id,
        text: s.title,
        onclick: () => {
          currentScenario = s.id;
          renderColumns();
        },
      }),
    ),
  );
  M.presets.forEach((p) =>
    $("#preset-picker").append(
      h("button", {
        type: "button",
        "data-id": p.id,
        text: p.label,
        onclick: () => {
          selected = [...p.concepts];
          renderColumns();
        },
      }),
    ),
  );
  M.concepts.forEach((c) =>
    $("#concept-picker").append(
      h("label", { class: "check" }, [
        h("input", {
          type: "checkbox",
          value: c.id,
          onchange: (e) => {
            selected = M.concepts
              .map((x) => x.id)
              .filter((id) =>
                id === c.id ? e.target.checked : selected.includes(id),
              );
            renderColumns();
          },
        }),
        c.name,
      ]),
    ),
  );

  function renderColumns() {
    picker
      .querySelectorAll("button")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.id === currentScenario),
        ),
      );
    $("#preset-picker")
      .querySelectorAll("button")
      .forEach((b) => {
        const p = M.presets.find((x) => x.id === b.dataset.id);
        b.setAttribute(
          "aria-pressed",
          String(p.concepts.join() === selected.join()),
        );
      });
    $("#concept-picker")
      .querySelectorAll("input")
      .forEach((i) => (i.checked = selected.includes(i.value)));
    const s = scenarioById(currentScenario);
    const zoom = $("#zoom").value;
    const cols = $("#columns");
    const shown = selected.map(conceptById);
    cols.style.setProperty("--n", Math.max(1, shown.length));
    cols.replaceChildren(
      ...shown.map((c) => {
        const img = h("img", {
          src: src(c.id, s),
          alt: `${c.name}, ${s.title}`,
          onclick: () => openViewer(c.id, s.id, selected),
        });
        if (zoom !== "fit") img.style.width = `${s.width * Number(zoom)}px`;
        return h("div", { class: "column" }, [
          h("header", {}, [
            h("span", { class: "title-row" }, [
              h("strong", { text: c.name }),
              isChosen(c) ? statusChip(c) : null,
            ]),
            h("button", {
              type: "button",
              text: "Ingrandisci",
              onclick: () => openViewer(c.id, s.id, selected),
            }),
          ]),
          h("div", { class: `scroller${zoom === "fit" ? " fit" : ""}` }, img),
        ]);
      }),
    );
    if (!shown.length)
      cols.append(
        h("p", { class: "note", text: "Nessun concept selezionato." }),
      );
    const scrollers = [...cols.querySelectorAll(".scroller")];
    let lock = false;
    scrollers.forEach((sc) =>
      sc.addEventListener("scroll", () => {
        if (!$("#sync").checked || lock) return;
        lock = true;
        const ry =
          sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight);
        const rx = sc.scrollLeft / Math.max(1, sc.scrollWidth - sc.clientWidth);
        scrollers.forEach((o) => {
          if (o === sc) return;
          o.scrollTop = ry * (o.scrollHeight - o.clientHeight);
          o.scrollLeft = rx * (o.scrollWidth - o.clientWidth);
        });
        requestAnimationFrame(() => (lock = false));
      }),
    );
  }
  $("#zoom").addEventListener("change", renderColumns);

  // ---------------------------------------------------------------- concept detail
  function renderConcept(id) {
    const c = conceptById(id);
    if (!c) return;
    const it = M.iterations.find((x) => x.id === c.iteration);
    $("#concept-detail").replaceChildren(
      isChosen(c)
        ? decisionBanner(false)
        : h("p", { class: "history-note" }, [
            `Storico dell’esplorazione · ${it.title}${c.status ? ` · ${c.status}` : ""}. `,
            h("a", {
              href: `#concept/${chosen.id}`,
              text: `Identità selezionata: ${chosen.name} →`,
            }),
          ]),
      h("h2", { text: c.name }),
      h("p", { class: "lead", text: `${c.tagline} ${c.summary}` }),
      h("p", { class: "note" }, [
        h("a", {
          href: `${c.id}/README.md`,
          text: "Documentazione del concept",
        }),
      ]),
      h(
        "div",
        { class: "screens" },
        M.scenarios.map((s) =>
          h(
            "div",
            { class: "screen" },
            h("figure", {}, [
              h("figcaption", {}, [
                h("strong", { text: s.title }),
                h("span", { text: `${c.id}/${s.file}` }),
              ]),
              h(
                "button",
                {
                  type: "button",
                  title: "Ingrandisci",
                  onclick: () => openViewer(c.id, s.id),
                },
                h("img", {
                  src: src(c.id, s),
                  alt: `${c.name}, ${s.title}`,
                  loading: "lazy",
                }),
              ),
            ]),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------- identity and assessment
  const idScenario = scenarioById("identity");
  $("#identity").append(
    h("h2", { text: "Elementi di identità" }),
    h("p", {
      class: "lead",
      text: "Palette, sistema cromatico, tipografia, componenti, rappresentazione dei veicoli e serie dei grafici di ogni concept.",
    }),
  );
  iterations.forEach((it) =>
    $("#identity").append(
      h("h2", { class: "iteration", text: it.title }),
      h(
        "div",
        { class: "screens" },
        conceptsOf(it).map((c) =>
          h(
            "div",
            { class: "screen" },
            h("figure", {}, [
              h("figcaption", {}, [
                h("strong", { text: c.name }),
                h("span", { text: c.fonts }),
              ]),
              h(
                "button",
                {
                  type: "button",
                  title: "Ingrandisci",
                  onclick: () => openViewer(c.id, "identity"),
                },
                h("img", {
                  src: src(c.id, idScenario),
                  alt: `${c.name}, identity sheet`,
                  loading: "lazy",
                }),
              ),
            ]),
          ),
        ),
      ),
    ),
  );
  iterations.forEach((it) =>
    $("#assessment").append(
      h("h2", { class: "iteration", text: it.title }),
      h(
        "div",
        { class: "assessment-grid" },
        conceptsOf(it).map((c) =>
          h("article", {}, [
            h("h3", { text: c.name }),
            h("p", { class: "note", text: c.tagline }),
            h("h4", { text: "Punti di forza" }),
            h(
              "ul",
              {},
              c.strengths.map((s) => h("li", { text: s })),
            ),
            h("h4", { text: "Limiti e rischi" }),
            h(
              "ul",
              {},
              c.limits.map((s) => h("li", { text: s })),
            ),
          ]),
        ),
      ),
    ),
  );

  // ---------------------------------------------------------------- viewer
  const viewer = $("#viewer");
  const stage = $("#viewer-stage");
  const vimg = $("#viewer-img");
  // `pool`: the concepts ← → move through (the side-by-side selection, or all).
  let vState = { concept: null, scenario: null, zoom: "fit", pool: [] };

  function openViewer(concept, scenario, pool) {
    vState = {
      ...vState,
      concept,
      scenario,
      pool: (pool && pool.length ? pool : M.concepts.map((c) => c.id)).map(
        (id) => ({ id }),
      ),
    };
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    renderViewer(true);
  }
  function renderViewer(resetScroll) {
    const c = conceptById(vState.concept);
    const s = scenarioById(vState.scenario);
    $("#viewer-title").textContent =
      `${c.name}${isChosen(c) ? " (selezionata)" : ""} — ${s.title}`;
    vimg.src = src(c.id, s);
    vimg.alt = `${c.name}, ${s.title}`;
    $("#viewer-open").href = src(c.id, s);
    stage.classList.toggle("fit", vState.zoom === "fit");
    vimg.style.width =
      vState.zoom === "fit" ? "" : `${s.width * Number(vState.zoom)}px`;
    viewer
      .querySelectorAll("[data-zoom]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.zoom === vState.zoom)),
      );
    if (resetScroll) stage.scrollTo(0, 0);
  }
  function closeViewer() {
    viewer.hidden = true;
    document.body.style.overflow = "";
  }
  const step = (list, id, d) =>
    list[(list.findIndex((x) => x.id === id) + d + list.length) % list.length]
      .id;
  const moveConcept = (d) => {
    vState.concept = step(vState.pool, vState.concept, d);
    renderViewer(false);
  };
  viewer.addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    const zoom = e.target.dataset.zoom;
    if (act === "close") closeViewer();
    if (act === "prev-concept") moveConcept(-1);
    if (act === "next-concept") moveConcept(1);
    if (zoom) {
      vState.zoom = zoom;
      renderViewer(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (viewer.hidden) return;
    const keys = {
      Escape: closeViewer,
      ArrowLeft: () => moveConcept(-1),
      ArrowRight: () => moveConcept(1),
      ArrowUp: () => {
        vState.scenario = step(M.scenarios, vState.scenario, -1);
        renderViewer(true);
      },
      ArrowDown: () => {
        vState.scenario = step(M.scenarios, vState.scenario, 1);
        renderViewer(true);
      },
      f: () => {
        vState.zoom = "fit";
        renderViewer(false);
      },
      1: () => {
        vState.zoom = "1";
        renderViewer(false);
      },
      2: () => {
        vState.zoom = "2";
        renderViewer(false);
      },
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  });

  // ---------------------------------------------------------------- routing
  // #scenari/<preset> opens the side-by-side view with a preset, e.g. #scenari/livrea.
  function route() {
    const hash = location.hash.slice(1) || "panoramica";
    const [view, arg] = hash.split("/");
    const name =
      view === "concept"
        ? "concept"
        : [
              "panoramica",
              "decisioni",
              "scenari",
              "identita",
              "valutazione",
            ].includes(view)
          ? view
          : "panoramica";
    document
      .querySelectorAll(".view")
      .forEach((v) => (v.hidden = v.id !== `view-${name}`));
    const tabs = [...document.querySelectorAll(".tabs a")];
    const exact = tabs.some((a) => a.getAttribute("href") === `#${hash}`);
    tabs.forEach((a) =>
      a.toggleAttribute(
        "aria-current",
        a.getAttribute("href") === `#${hash}` ||
          (!exact &&
            name === "scenari" &&
            a.getAttribute("href") === "#scenari"),
      ),
    );
    document
      .querySelectorAll(".tabs a[aria-current]")
      .forEach((a) => a.setAttribute("aria-current", "page"));
    if (name === "scenari") {
      const preset = M.presets.find((p) => p.id === arg);
      if (preset) selected = [...preset.concepts];
      renderColumns();
    }
    if (name === "concept") renderConcept(arg);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
