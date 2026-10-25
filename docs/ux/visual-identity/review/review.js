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

  $("#meta").textContent =
    `${M.iteration} · ${M.concepts.length} concept · aggiornata il ${M.updated}`;
  M.concepts.forEach((c) =>
    $("#concept-tabs").append(
      h("a", { href: `#concept/${c.id}`, text: c.name }),
    ),
  );

  // ---------------------------------------------------------------- overview
  M.concepts.forEach((c) => {
    $("#overview").append(
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
          h("h3", { text: c.name }),
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
            h("a", { href: `#concept/${c.id}`, text: "Tutte le schermate →" }),
            h("a", { href: `${c.id}/README.md`, text: "Documentazione" }),
          ]),
        ]),
      ]),
    );
  });

  // ---------------------------------------------------------------- scenarios side by side
  let currentScenario = M.scenarios[0].id;
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

  function renderColumns() {
    picker
      .querySelectorAll("button")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.id === currentScenario),
        ),
      );
    const s = scenarioById(currentScenario);
    const zoom = $("#zoom").value;
    const cols = $("#columns");
    cols.style.setProperty("--n", M.concepts.length);
    cols.replaceChildren(
      ...M.concepts.map((c) => {
        const img = h("img", {
          src: src(c.id, s),
          alt: `${c.name}, ${s.title}`,
          onclick: () => openViewer(c.id, s.id),
        });
        if (zoom !== "fit") img.style.width = `${s.size[0] * Number(zoom)}px`;
        return h("div", { class: "column" }, [
          h("header", {}, [
            h("strong", { text: c.name }),
            h("button", {
              type: "button",
              text: "Ingrandisci",
              onclick: () => openViewer(c.id, s.id),
            }),
          ]),
          h("div", { class: `scroller${zoom === "fit" ? " fit" : ""}` }, img),
        ]);
      }),
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
    $("#concept-detail").replaceChildren(
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
                h("span", {
                  text: `${c.id}/${s.file} · ${s.size[0]} × ${s.size[1]}`,
                }),
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
      text: "Palette, tipografia, componenti, rappresentazione dei veicoli e serie dei grafici di ogni concept.",
    }),
    h(
      "div",
      { class: "screens" },
      M.concepts.map((c) =>
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
  );
  M.concepts.forEach((c) =>
    $("#assessment").append(
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
  );

  // ---------------------------------------------------------------- viewer
  const viewer = $("#viewer");
  const stage = $("#viewer-stage");
  const vimg = $("#viewer-img");
  let vState = { concept: null, scenario: null, zoom: "fit" };

  function openViewer(concept, scenario) {
    vState = { ...vState, concept, scenario };
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    renderViewer(true);
  }
  function renderViewer(resetScroll) {
    const c = conceptById(vState.concept);
    const s = scenarioById(vState.scenario);
    $("#viewer-title").textContent = `${c.name} — ${s.title}`;
    vimg.src = src(c.id, s);
    vimg.alt = `${c.name}, ${s.title}`;
    $("#viewer-open").href = src(c.id, s);
    stage.classList.toggle("fit", vState.zoom === "fit");
    vimg.style.width =
      vState.zoom === "fit" ? "" : `${s.size[0] * Number(vState.zoom)}px`;
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
  viewer.addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    const zoom = e.target.dataset.zoom;
    if (act === "close") closeViewer();
    if (act === "prev-concept") {
      vState.concept = step(M.concepts, vState.concept, -1);
      renderViewer(false);
    }
    if (act === "next-concept") {
      vState.concept = step(M.concepts, vState.concept, 1);
      renderViewer(false);
    }
    if (zoom) {
      vState.zoom = zoom;
      renderViewer(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (viewer.hidden) return;
    const keys = {
      Escape: closeViewer,
      ArrowLeft: () => {
        vState.concept = step(M.concepts, vState.concept, -1);
        renderViewer(false);
      },
      ArrowRight: () => {
        vState.concept = step(M.concepts, vState.concept, 1);
        renderViewer(false);
      },
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
  function route() {
    const hash = location.hash.slice(1) || "panoramica";
    const [view, arg] = hash.split("/");
    const name =
      view === "concept"
        ? "concept"
        : ["panoramica", "scenari", "identita", "valutazione"].includes(view)
          ? view
          : "panoramica";
    document
      .querySelectorAll(".view")
      .forEach((v) => (v.hidden = v.id !== `view-${name}`));
    document
      .querySelectorAll(".tabs a")
      .forEach((a) =>
        a.toggleAttribute(
          "aria-current",
          a.getAttribute("href") === `#${hash}`,
        ),
      );
    document
      .querySelectorAll(".tabs a[aria-current]")
      .forEach((a) => a.setAttribute("aria-current", "page"));
    if (name === "scenari") renderColumns();
    if (name === "concept") renderConcept(arg);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
