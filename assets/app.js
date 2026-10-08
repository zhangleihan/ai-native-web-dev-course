(function () {
  const data = window.COURSE_DATA;
  const tocEl = document.getElementById("toc");
  const contentEl = document.getElementById("content");
  const crumbEl = document.getElementById("crumb");
  const layoutEl = document.getElementById("app");
  const toggleBtn = document.getElementById("toggle-sidebar");

  if (!data) {
    contentEl.innerHTML =
      "<h1>课程数据尚未生成</h1><p>请先运行 <code>python3 scripts/build_course.py</code>。</p>";
    return;
  }

  const allSections = data.parts.flatMap((part) =>
    part.sections.map((section) => ({
      ...section,
      partId: part.id,
      partTitle: part.title,
    }))
  );

  marked.setOptions({ gfm: true, breaks: false });

  function currentRoute() {
    let hash;
    try { hash = decodeURIComponent(location.hash.replace(/^#/, "") || "/"); }
    catch { return { type: "home" }; }
    const parts = hash.split("/").filter(Boolean);
    if (parts[0] !== "part") return { type: "home" };
    return { type: "page", id: parts.slice(1).join("-") };
  }

  function renderToc(activeId) {
    tocEl.innerHTML = data.parts
      .map((part) => {
        const open = part.sections.some((section) => section.id === activeId);
        return `
          <div class="part ${open ? "open active-part" : ""}" data-part="${part.id}">
            <button class="part-toggle" type="button" aria-expanded="${open}">
              <span class="part-index">${part.id === "0" ? "导读" : `第 ${part.id} 讲`}</span>
              <span class="part-title">${part.title}</span>
            </button>
            <div class="sections">
              ${part.sections
                .map(
                  (section) => `
                    <a href="#/part/${section.id.replace("-", "/")}" class="${
                      section.id === activeId ? "active" : ""
                    }">${section.title}</a>
                  `
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  }

  function pageHtml(route) {
    if (route.type === "home") {
      return `
        <section class="hero">
          <h1>${data.title}</h1>
          <p>${data.subtitle}</p>
        </section>
        <div class="hero-body">${data.intro}</div>
        <div class="part-grid">
          ${data.parts
            .map(
              (part) => `
                <a class="part-card" href="#/part/${part.id}">
                  <strong>${part.id === "0" ? "课前导读" : `第 ${part.id} 讲`} · ${part.hours ?? 2} 学时</strong>
                  ${part.title}
                </a>
              `
            )
            .join("")}
        </div>
        <p class="license">${data.attribution}</p>
      `;
    }

    const markdown = data.pages[route.id];
    const current = allSections.find((item) => item.id === route.id);
    if (!markdown || !current) {
      return "<h1>未找到该章节</h1><p>请从左侧目录重新选择。</p>";
    }

    const index = allSections.findIndex((item) => item.id === route.id);
    const prev = allSections[index - 1];
    const next = allSections[index + 1];
    const heading = `<h1>${current.partId === "0" ? "课前导读" : `第 ${current.partId} 讲`} · ${current.title}</h1>`;
    const pageLabel = (item) => `${item.partId === "0" ? "课前导读" : `第 ${item.partId} 讲`} ${item.title}`;

    return `
      ${heading}
      ${marked.parse(markdown)}
      <nav class="pager">
        ${
          prev
            ? `<a href="#/part/${prev.id.replace("-", "/")}">上一节：${pageLabel(prev)}</a>`
            : "<span></span>"
        }
        ${
          next
            ? `<a href="#/part/${next.id.replace("-", "/")}">下一节：${pageLabel(next)}</a>`
            : "<span></span>"
        }
      </nav>
    `;
  }

  function render() {
    const route = currentRoute();
    const activeId = route.type === "page" ? route.id : "";
    renderToc(activeId);
    contentEl.innerHTML = pageHtml(route);
    contentEl.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
    if (route.type === "home") {
      crumbEl.textContent = "课程内容";
      document.title = "AI 原生网络应用开发 · 32 学时教材";
    } else {
      const current = allSections.find((item) => item.id === route.id);
      crumbEl.textContent = current
        ? `${current.partId === "0" ? "课前导读" : `第 ${current.partId} 讲`} / ${current.title}`
        : "课程内容";
      document.title = current
        ? `${current.title} · AI 原生网络应用开发`
        : "AI 原生网络应用开发 · 32 学时教材";
    }
    contentEl.querySelectorAll("table").forEach(table => {
      const wrap = document.createElement("div");
      wrap.className = "table-scroll";
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-label", "可横向滚动的表格");
      table.replaceWith(wrap);
      wrap.append(table);
    });
    contentEl.focus({ preventScroll: true });
    const scroller = document.getElementById("content-scroll");
    if (scroller) scroller.scrollTop = 0;
  }

  tocEl.addEventListener("click", (event) => {
    const button = event.target.closest(".part-toggle");
    if (!button) return;
    const open = button.parentElement.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });

  const narrow = () => window.matchMedia("(max-width: 860px)").matches;
  function setCollapsed(collapsed) {
    layoutEl.classList.toggle("sidebar-collapsed", collapsed);
    toggleBtn.setAttribute("aria-expanded", String(!collapsed));
    toggleBtn.setAttribute("aria-label", collapsed ? "展开目录" : "折叠目录");
    document.getElementById("sidebar").inert = collapsed;
  }
  let preference = null;
  try { preference = localStorage.getItem("aiweb-sidebar-collapsed"); } catch {}
  setCollapsed(narrow() || preference === "1");
  toggleBtn.addEventListener("click", () => {
    const collapsed = !layoutEl.classList.contains("sidebar-collapsed");
    setCollapsed(collapsed);
    try { localStorage.setItem("aiweb-sidebar-collapsed", collapsed ? "1" : "0"); } catch {}
  });
  tocEl.addEventListener("click", event => {
    if (narrow() && event.target.closest("a")) setCollapsed(true);
  });
  window.matchMedia("(max-width: 860px)").addEventListener("change", event => {
    if (event.matches) setCollapsed(true);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && narrow()) {
      setCollapsed(true);
      toggleBtn.focus();
    }
  });
  document.getElementById("print-page").addEventListener("click", () => window.print());
  let closedAnswers = [];
  window.addEventListener("beforeprint", () => {
    closedAnswers = [...contentEl.querySelectorAll("details:not([open])")];
    closedAnswers.forEach(item => { item.open = true; });
  });
  window.addEventListener("afterprint", () => {
    closedAnswers.forEach(item => { item.open = false; });
    closedAnswers = [];
  });

  contentEl.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const match = href.match(/^\/(?:en|zh)\/part(\d+)(?:\/([^#]*))?/);
    if (!match) return;
    event.preventDefault();
    window.location.assign(`https://fullstackopen.com${href}`);
  });

  window.addEventListener("hashchange", render);
  render();
})();
