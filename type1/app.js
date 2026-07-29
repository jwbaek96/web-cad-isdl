/* ============================================================
   ISDL Lab Site — app.js
   Lightweight hash-router that renders SITE_DATA (data.js)
   into the layout, mirroring the reference site's structure.
   ============================================================ */

const LAB_NAME_KO = "시스템융합설계연구실";
const LAB_NAME_EN = "Integrated Systems Design Laboratory";
const LAB_SHORT = "ISDL";
const UNIV_KO = "중앙대학교 기계공학부";
const UNIV_EN = "School of Mechanical Engineering, Chung-Ang University";

const app = document.getElementById("app");
const toggle = document.getElementById('sidebar-toggle');
/* ---------- helpers ---------- */

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function initials(name) {
  const clean = String(name).split("/")[0].trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function linkify(links) {
  if (!links) return "";
  return String(links)
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => `<a href="${esc(l)}" target="_blank" rel="noopener">Video ${i + 1}</a>`)
    .join("");
}

/* ---------- nav submenu data (derived from SITE_DATA) ---------- */

const NAV = [
  { key: "home", label: "Home", path: "#/home" },
  {
    key: "members",
    label: "Members",
    path: "#/members",
    children: Object.keys(SITE_DATA.members).map((k) => ({
      label: k,
      path: `#/members/${encodeURIComponent(k)}`,
    })),
  },
  {
    key: "research",
    label: "Research",
    path: "#/research",
    children: Object.keys(SITE_DATA.research).map((k) => ({
      label: k,
      path: `#/research/${encodeURIComponent(k)}`,
    })),
  },
  {
    key: "publications",
    label: "Publications",
    path: "#/publications",
    children: Object.keys(SITE_DATA.publications).map((k) => ({
      label: k,
      path: `#/publications/${encodeURIComponent(k)}`,
    })),
  },
  {
    key: "ips",
    label: "IPs",
    path: "#/ips",
    children: Object.keys(SITE_DATA.ips).map((k) => ({
      label: k,
      path: `#/ips/${encodeURIComponent(k)}`,
    })),
  },
  { key: "lecture", label: "Lecture", path: "#/lecture" },
  {
    key: "news-award",
    label: "News/Award",
    path: "#/news-award",
    children: Object.keys(SITE_DATA.news_award).map((k) => ({
      label: k,
      path: `#/news-award/${encodeURIComponent(k)}`,
    })),
  },
];

/* ---------- header / nav rendering ---------- */

function renderHeader(activeKey, activeChild) {
  const header = document.getElementById("site-header");
  const navList = NAV.map((item) => {
    const isActive = item.key === activeKey;
    const hasChildren = item.children && item.children.length;
    const childList = hasChildren
      ? `<ul class="submenu">${item.children
          .map(
            (c) =>
              `<li class="${
                isActive && activeChild === c.label ? "active" : ""
              }"><a href="${c.path}">${esc(c.label)}</a></li>`
          )
          .join("")}</ul>`
      : "";
    return `<li class="${isActive ? "active" : ""}">
        <a class="nav-link" href="${item.path}">${esc(item.label)}</a>
        ${childList}
      </li>`;
  }).join("");

  header.innerHTML = `
    <div class="nav-wrap">
       <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar"><span></span></button>
      <nav class="primary-nav" id="primary-nav">
        <ul>${navList}</ul>
      </nav>
    </div>
  `;
}


/* ---------- Sidebar rendering ---------- */
function renderSidebar() {
    console.log("renderSidebar");
    const sidebar = document.getElementById("sidebar");
    const { key: activeKey, child: activeChild } = parseHash();

    const menuHtml = NAV.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      const isParentActive = item.key === activeKey && !activeChild;
      const isSectionActive = item.key === activeKey;

      // 부모 또는 자식 페이지라면 펼침
      let isOpen = hasChildren && isSectionActive;

      const childHtml = hasChildren ? `
            <ul class="sidebar-submenu">
                ${item.children.map(c => {
                    const isChildActive = item.key === activeKey && activeChild === c.label;

                    return `
                        <li>
                            <a href="${c.path}" class="${isChildActive ? 'active' : ''}">
                                ${esc(c.label)}
                            </a>
                        </li>
                    `;
                }).join('')}
            </ul>
        ` : '';

        return `
            <li class="${isOpen ? 'open' : ''}">
                <div class="nav-link">
                  <span class="dropdown-icon-container">
                  ${hasChildren ? '<span class="dropdown-icon"></span>' : ''}
                  </span>
                    <a href="${item.path}" class="${isParentActive ? 'active' : ''}">
                        ${esc(item.label)}
                    </a>
                </div>
                ${childHtml}
            </li>
        `;
  }).join('');

  sidebar.innerHTML = `<ul>${menuHtml}</ul>`;
}


function initSidebar() {
    console.log("initSidebar");
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggle = document.getElementById('sidebar-toggle');

    const siteHeader = document.getElementById('site-header');

    function closeSidebar() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
        toggle.classList.remove('open');
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('open');
        toggle.classList.toggle('open');
        siteHeader.classList.toggle('open');
    });

    backdrop.addEventListener('click', closeSidebar);

    sidebar.addEventListener('click', (e) => {
        // Close sidebar if a link is clicked
        if (e.target.closest('a')) {
            closeSidebar();
            return; // Exit to prevent dropdown logic from running
        }

        // Handle dropdown toggle
        const dropdownIcon = e.target.closest('.dropdown-icon');
        if (dropdownIcon) {
            dropdownIcon.closest('li').classList.toggle('open');
        }
    });
    // ESC 키로 사이드바 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}


/* ---------- page renderers ---------- */

function pageShell(title, bodyHtml, showHero) {
  const hero = showHero
    ? `<div class="hero">
         <div class="hero-banner"><span class="mark">${LAB_SHORT}</span><span class="mark">${LAB_NAME_EN}</span></div>
       </div>`
    : "";
  return `${hero}<main>${title ? `<h1 class="page-title">${esc(title)}</h1>` : ""}${bodyHtml}</main>`;
}

function renderHome() {
  const home = SITE_DATA.home;
  const mainImage = home.greeting.image || "";
  const koText = home.greeting.korean;
  const enText = home.greeting.english;
  const highlights = home.highlights || [];

  app.innerHTML = `
    <div class="hero">
      <div class="hero-banner"><span class="mark">${LAB_SHORT}</span><span class="mark">${LAB_NAME_EN}</span></div>
      <div class="hero-image"><img src="${esc(mainImage)}" alt="Hero Image"></div>
      </div>
      
    <main>

      <div class="hero-inner">
        <h1>${LAB_NAME_KO} (${LAB_SHORT})</h1>
        <p class="subtitle">${UNIV_KO} · ${UNIV_EN}</p>
        <div class="lang-toggle">
          <button data-lang="ko">한국어</button>
          <button data-lang="en" class="active">English</button>
        </div>
      </div>

      <div class="prose" id="home-text">${esc(enText)}</div>

      <div class="section-block">
        <h2>Research Highlights</h2>
      
        <div class="highlight-list">
          ${highlights.map((h) => `
            <a class="highlight-item"
              href="${esc(h.link)}"
              target="_blank"
              rel="noopener noreferrer">
      
              <div class="highlight-thumb">
                <img src="${esc(h.image)}" alt="${esc(h.title)}">
              </div>
      
              <div class="highlight-content">
                <h3>${esc(h.title)}</h3>
              </div>
      
            </a>
          `).join("")}
        </div>
      </div>
    </main>
  `;

  const buttons = app.querySelectorAll(".lang-toggle button");
  const textEl = document.getElementById("home-text");
  buttons.forEach((b) => {
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      textEl.textContent = b.dataset.lang === "en" ? enText : koText;
    });
  });
}

function renderMembers(activeTab) {
  const makeList = (text = "") =>
  text
    .split("\n")
    .filter(v => v.trim())
    .map(v => `<li>${esc(v)}</li>`)
    .join("");
  const groups = SITE_DATA.members;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabBar = `<div class="tab-bar">
    ${keys
      .map(
        (k) =>
          `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(
            k
          )}">${esc(k)}</button>`
      )
      .join("")}
  </div>`;

  const panels = keys
    .map((k) => {
      const people = groups[k];
      let inner;
      if (k === "Director") {
        inner = people
          .map(
      (p) => `
      <div class="director-profile">
      
        <div class="director-left">
          <img class="director-photo"
            src="${esc(p.image || "files/no image.jpg")}"
            alt="${esc((p["이름"] || "").split("/")[0])}"
          />
          <div class="director-name">
            ${esc((p["이름"] || ""))}
            ${
              p.cvlink
                ? `<a href="${esc(p.cvlink)}" target="_blank" style="text-decoration: none; color:#000;">[CV]</a>`
                : ""
            }
          </div>
        </div>
      
        <div class="director-right">
          ${
            p.office
              ? `
            <div class="info-block">
              <strong>Office:</strong>
              ${esc(p.office)}
            </div>
          `
              : ""
          }
      
          ${
            p["E-mail"]
              ? `
            <div class="info-block">
              <strong>E-mail:</strong>
              <a href="mailto:${esc(p["E-mail"])}">${esc(p["E-mail"])}</a>
            </div>
          `
              : ""
          }
      
          ${
            p.Education
              ? `
            <div class="info-section">
              <h3>Education</h3>
              <ul>
                ${makeList(p.Education)}
              </ul>
            </div>
          `
              : ""
          }
      
          ${
            p["Professional experiences"]
              ? `
            <div class="info-section">
              <h3>Professional experiences</h3>
              <ul>
                ${makeList(p["Professional experiences"])}
              </ul>
            </div>
          `
              : ""
          }
        </div>
      </div>
      <div class="director-down">
        ${
          p["Professional Services"]
            ? `
          <div class="info-section">
            <h3>Professional Services</h3>
            <ul>
              ${makeList(p["Professional Services"])}
            </ul>
          </div>
        `
            : ""
        }
    
        ${
          p.Award
            ? `
          <div class="info-section">
            <h3>Award</h3>
            <ul>
              ${makeList(p.Award)}
            </ul>
          </div>
        `
            : ""
        }      
      </div>
      `
          )
          .join("");
      } else {
        inner = `<div>${people
          .map(
            (p) => `
          <div class="person-card">
            <img class="director-photo"
              src="${esc(p.image || "files/no image.jpg")}"
              alt="${esc((p["이름"] || ""))}"
            />
            <dl>
              <h3>${esc((p["이름"] || ""))}</h3>
              <div class="role">${esc(p["직책"] || p["학위"] || "")}</div>
              ${p["E-mail"] ? `<dt>Email</dt><dd>${esc(p["E-mail"])}</dd>` : ""}
              ${p.Education ? `<dt>Education</dt><dd>${esc(p.Education)}</dd>` : ""}
              ${p["Research area"] ? `<dt>Research Area</dt><dd>${esc(p["Research area"])}</dd>` : ""}
              ${p["졸업 후 진로"] ? `<dt>Career after graduation</dt><dd>${esc(p["졸업 후 진로"])}</dd>` : ""}
            </dl>
          </div>`
          )
          .join("")}</div>`;
      }
      return `<div class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(
        k
      )}">${inner || '<p class="empty-note">등록된 인원이 없습니다.</p>'}</div>`;
    })
    .join("");

  app.innerHTML = pageShell("Members", tabBar + panels, true);
  wireTabs("members");
}

function renderResearch(activeTab) {
  const groups = SITE_DATA.research;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabBar = `<div class="tab-bar">
    ${keys
      .map(
        (k) =>
          `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(
            k
          )}">${esc(k)}</button>`
      )
      .join("")}
  </div>`;

  const panels = keys
    .map((k) => {
      const items = groups[k];
      const inner =
        items.length === 0
          ? '<p class="empty-note">등록된 항목이 없습니다.</p>'
          : items
              .map(
                (it) => `
          <div class="research-item">
            <div class="research-thumb">
              <img src="${esc(it.Thumb || "../files/no image.jpg")}" alt="${esc(it.Title)}" />
            </div>
            <div class="body">
              <h3>${esc(it.Title)}</h3>
              <a href="${esc(it.File)}" target="_blank" rel="noopener" class="view-research">View Research</a>
              <div class="research-links">${linkify(it.Link)}</div>
            </div>
          </div>`
              )
              .join("");
      return `<div class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(
        k
      )}">${inner}</div>`;
    })
    .join("");

  app.innerHTML = pageShell("Research", tabBar + panels, true);
  wireTabs("research");
}

function renderPublications(activeTab) {
  const groups = SITE_DATA.publications;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabBar = `<div class="tab-bar">
    ${keys
      .map(
        (k) =>
          `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(
            k
          )}">${esc(k)} <span style="opacity:.6">(${groups[k].length})</span></button>`
      )
      .join("")}
  </div>`;

  const panels = keys
    .map((k) => {
      const items = groups[k];
      const inner =
        items.length === 0
          ? '<p class="empty-note">등록된 항목이 없습니다.</p>'
          : `<ul class="pub-list">${items
              .map(
                (it) =>
                  `<li>${esc(it.Title)}${
                    it.Link ? `<a href="${esc(it.Link.trim())}" target="_blank" rel="noopener">↗</a>` : ""
                  }</li>`
              )
              .join("")}</ul>`;
      return `<div class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(
        k
      )}">${inner}</div>`;
    })
    .join("");

  app.innerHTML = pageShell("Publications", tabBar + panels, false);
  wireTabs("publications");
}

function renderIPs(activeTab) {
  const groups = SITE_DATA.ips;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabBar = `<div class="tab-bar">
    ${keys
      .map(
        (k) =>
          `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(
            k
          )}">${esc(k)}</button>`
      )
      .join("")}
  </div>`;

  const panels = keys
    .map((k) => {
      const items = groups[k];
      const inner =
        !items || items.length === 0
          ? '<p class="empty-note">등록된 항목이 없습니다.</p>'
          : `<ul class="ip-list">${items.map((it) => `<li>${esc(it.Title)}</li>`).join("")}</ul>`;
      return `<div class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(
        k
      )}">${inner}</div>`;
    })
    .join("");

  app.innerHTML = pageShell("IPs", tabBar + panels, false);
  wireTabs("ips");
}

function renderLecture() {
  const d = SITE_DATA.lecture;
  app.innerHTML = pageShell(
    "Lecture",
    `<div class="placeholder-box">
       <span class="status">${esc(d.status || "")}</span>
       <p>${esc(d.message || "")}</p>
     </div>`,
    true
  );
}

function renderNewsAward(activeTab) {
  const groups = SITE_DATA.news_award;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabBar = `<div class="tab-bar">
    ${keys
      .map(
        (k) =>
          `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(
            k
          )}">${esc(k)}</button>`
      )
      .join("")}
  </div>`;

  const panels = keys
    .map((k) => {
      const items = groups[k];
      const inner =
        !items || items.length === 0
          ? '<p class="empty-note">등록된 소식이 없습니다.</p>'
          : items
              .map(
                (it) => `
          <div class="news-card">
            <div class="news-thumb">Image</div>
            <div class="news-body">
              <h3>${esc(it.Title)}</h3>
              <p>${esc(it.Text)}</p>
            </div>
          </div>`
              )
              .join("");
      return `<div class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(
        k
      )}">${inner}</div>`;
    })
    .join("");

  app.innerHTML = pageShell("News / Award", tabBar + panels, false);
  wireTabs("news-award");
}

/* ---------- tab wiring (shared) ---------- */

function wireTabs(routeKey) {
  const btns = app.querySelectorAll(".tab-btn");
  btns.forEach((b) => {
    b.addEventListener("click", () => {
      const tab = b.dataset.tab;
      location.hash = `#/${routeKey}/${encodeURIComponent(tab)}`;
    });
  });
}

/* ---------- router ---------- */

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
  return { key: parts[0] || "home", child: parts[1] };
}

function route() {
  const { key, child } = parseHash();
  renderHeader(key, child);
  renderSidebar();

  switch (key) {
    case "home":
      renderHome();
      break;
    case "members":
      renderMembers(child);
      break;
    case "research":
      renderResearch(child);
      break;
    case "publications":
      renderPublications(child);
      break;
    case "ips":
      renderIPs(child);
      break;
    case "lecture":
      renderLecture();
      break;
    case "news-award":
      renderNewsAward(child);
      break;
    default:
      renderHome();
  }
  initSidebar();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/home";
  route();
  // initSidebar();
});

const header = document.getElementById("site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});