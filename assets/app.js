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
    const hash = decodeURIComponent(location.hash.replace(/^#/, "") || "/");
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
            <button class="part-toggle" type="button">
              <span class="part-index">第 ${part.id} 讲</span>
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
                  <strong>第 ${part.id} 讲 · ${part.hours || 2} 学时</strong>
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
    const heading = `<h1>第 ${current.partId} 讲 · ${current.title}</h1>`;
    const pageLabel = (item) => `第 ${item.partId} 讲 ${item.title}`;

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
        ? `第 ${current.partId} 讲 / ${current.title}`
        : "课程内容";
      document.title = current
        ? `${current.title} · AI 原生网络应用开发`
        : "AI 原生网络应用开发 · 32 学时教材";
    }
    contentEl.focus({ preventScroll: true });
    const scroller = document.getElementById("content-scroll");
    if (scroller) scroller.scrollTop = 0;
  }

  tocEl.addEventListener("click", (event) => {
    const button = event.target.closest(".part-toggle");
    if (!button) return;
    button.parentElement.classList.toggle("open");
  });

  toggleBtn.addEventListener("click", () => {
    layoutEl.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "aiweb-sidebar-collapsed",
      layoutEl.classList.contains("sidebar-collapsed") ? "1" : "0"
    );
  });

  if (localStorage.getItem("aiweb-sidebar-collapsed") === "1") {
    layoutEl.classList.add("sidebar-collapsed");
  }

  contentEl.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const match = href.match(/^\/(?:en|zh)\/part(\d+)(?:\/([^#]*))?/);
    if (!match) return;
    event.preventDefault();
    const part = match[1];
    location.hash = `#/part/${part}`;
  });

  window.addEventListener("hashchange", render);
  render();
})();
