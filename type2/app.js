const LAB_SHORT = "ISDL";

const app = document.getElementById("app");

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function splitLines(text = "") {
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
  return { key: parts[0] || "home", child: parts[1] };
}

function linkify(links) {
  if (!links) return "";
  return String(links)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((url, i) => `<a href="${esc(url)}" target="_blank" rel="noopener">Video ${i + 1}</a>`)
    .join("");
}

function withCount(label, arr) {
  return `${label} <span class="tab-count">(${arr.length})</span>`;
}

const NAV = [
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

function renderHeader(activeKey, activeChild) {
  const header = document.getElementById("site-header");

  const navItems = NAV.map((item) => {
    const active = item.key === activeKey;
    const submenu = item.children && item.children.length
      ? `<ul class="submenu">${item.children
          .map((child) => `<li class="${active && activeChild === child.label ? "active" : ""}"><a href="${child.path}">${esc(child.label)}</a></li>`)
          .join("")}</ul>`
      : "";

    return `
      <li class="${active ? "active" : ""}">
        <a class="nav-link" href="${item.path}">${esc(item.label)}</a>
        ${submenu}
      </li>
    `;
  }).join("");

  header.innerHTML = `
    <div class="nav-wrap">
      <a class="brand" href="#/home">${LAB_SHORT}</a>
      <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle navigation"><span></span></button>
      <nav class="primary-nav" id="primary-nav">
        <ul>${navItems}</ul>
      </nav>
    </div>
  `;
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  const { key: activeKey, child: activeChild } = parseHash();

  const html = NAV.map((item) => {
    const hasChildren = item.children && item.children.length > 0;
    const open = item.key === activeKey && hasChildren;
    const parentActive = item.key === activeKey && !activeChild;
    const submenu = hasChildren
      ? `<ul class="sidebar-submenu">${item.children
          .map((child) => `<li><a class="${item.key === activeKey && activeChild === child.label ? "active" : ""}" href="${child.path}">${esc(child.label)}</a></li>`)
          .join("")}</ul>`
      : "";

    return `
      <li class="${open ? "open" : ""}">
        <div class="nav-link">
          <a class="${parentActive ? "active" : ""}" href="${item.path}">${esc(item.label)}</a>
        </div>
        ${submenu}
      </li>
    `;
  }).join("");

  sidebar.innerHTML = `<ul>${html}</ul>`;
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const toggle = document.getElementById("sidebar-toggle");
  if (!sidebar || !backdrop || !toggle) return;

  const closeSidebar = () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
    toggle.classList.remove("open");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("open");
    backdrop.classList.toggle("open");
    toggle.classList.toggle("open");
  });

  backdrop.addEventListener("click", closeSidebar);

  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      closeSidebar();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeSidebar();
  });
}

function pageShell(title, bodyHtml, opts = {}) {
  const showHero = Boolean(opts.showHero);
  const hero = showHero
    ? `<section class="hero"><div class="hero-banner"><span class="mark">${LAB_SHORT}</span></div></section>`
    : "";

  return `
    ${hero}
    <main>
      ${title ? `<h1 class="page-title">${esc(title)}</h1>` : ""}
      ${bodyHtml}
    </main>
  `;
}

function renderHome() {
  const home = SITE_DATA.home;
  const greeting = home.greeting || {};
  const highlights = home.highlights || [];

  app.innerHTML = `
    <section class="hero home-hero">
      <div class="hero-banner"><span class="mark">${LAB_SHORT}</span></div>
      <div class="hero-image"><img src="hero-bg.png" alt="ISDL main visual"></div>
    </section>

    <main>
      <section class="welcome-block">
        <div class="welcome-left">
          <h2>Welcome!</h2>
          <img src="${esc(greeting.image || "../files/no image.jpg")}" alt="ISDL welcome image">
        </div>

        <div class="welcome-right">
          <div class="lang-toggle">
            <button data-lang="ko">KR</button>
            <button data-lang="en" class="active">EN</button>
          </div>
          <div class="prose" id="home-text">${esc(greeting.english || "")}</div>
        </div>
      </section>

      <section class="section-block">
        <h2>Research Highlights</h2>
        <div class="highlight-list">
          ${highlights.map((item) => `
            <a class="highlight-item" href="${esc(item.link || "#")}" target="_blank" rel="noopener noreferrer">
              <div class="highlight-thumb"><img src="${esc(item.image || "../files/no image.jpg")}" alt="${esc(item.title || "highlight")}"></div>
              <div class="highlight-content"><h3>${esc(item.title || "")}</h3></div>
            </a>
          `).join("")}
        </div>
      </section>
    </main>
  `;

  const textEl = document.getElementById("home-text");
  const langBtns = app.querySelectorAll(".lang-toggle button");

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      langBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      textEl.textContent = btn.dataset.lang === "ko" ? greeting.korean || "" : greeting.english || "";
    });
  });
}

function renderMembers(activeTab) {
  const groups = SITE_DATA.members;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabs = `<div class="tab-bar">${keys
    .map((k) => `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(k)}">${esc(k)}</button>`)
    .join("")}</div>`;

  const panels = keys.map((k) => {
    const people = groups[k] || [];

    let html = "";
    if (!people.length) {
      html = '<p class="empty-note">등록된 인원이 없습니다.</p>';
    } else if (k === "Director") {
      html = people.map((p) => {
        const education = splitLines(p.Education).map((line) => `<li>${esc(line)}</li>`).join("");
        const experiences = splitLines(p["Professional experiences"]).map((line) => `<li>${esc(line)}</li>`).join("");
        const services = splitLines(p["Professional Services"]).map((line) => `<li>${esc(line)}</li>`).join("");
        const awards = splitLines(p.Award).map((line) => `<li>${esc(line)}</li>`).join("");

        return `
          <article class="director-profile">
            <div class="director-left">
              <img class="director-photo" src="${esc(p.image || "../files/no image.jpg")}" alt="${esc(p["이름"] || "Director")}">
            </div>
            <div class="director-right">
              <h2 class="member-name">${esc(p["이름"] || "")}</h2>
              <a class="director-cv" href="${esc(p.CV || "#")}" target="_blank" rel="noopener noreferrer">[CV]</a>
              ${p.office ? `<p class="meta-line"><strong>Office:</strong> ${esc(p.office)}</p>` : ""}
              ${p["E-mail"] ? `<p class="meta-line"><strong>E-mail:</strong> <a href="mailto:${esc(p["E-mail"])}">${esc(p["E-mail"])}</a></p>` : ""}

              ${education ? `<section class="info-section"><h3>Education</h3><ul>${education}</ul></section>` : ""}
              ${experiences ? `<section class="info-section"><h3>Professional experiences</h3><ul>${experiences}</ul></section>` : ""}
              ${services ? `<section class="info-section"><h3>Professional Services</h3><ul>${services}</ul></section>` : ""}
            </div>
            </article>
            <div class="director-down">
              ${awards ? `<section class="info-section"><h3>Award</h3><ul>${awards}</ul></section>` : ""}
            </div>
        `;
      }).join("");
    } else {
      html = people.map((p) => `
        <article class="person-card">
          <img class="director-photo" src="${esc(p.image || "../files/no image.jpg")}" alt="${esc(p["이름"] || "member")}">
          <div class="person-body">
            <h3>${esc(p["이름"] || "")}</h3>
            <div class="role">${esc(p["직책"] || p["학위"] || "")}</div>
            ${p["E-mail"] ? `<p><strong>Email</strong><br><a href="mailto:${esc(p["E-mail"])}">${esc(p["E-mail"])}</a></p>` : ""}
            ${p.Education ? `<p><strong>Education</strong><br>${esc(p.Education)}</p>` : ""}
            ${p["Research area"] ? `<p><strong>Research Area</strong><br>${esc(p["Research area"])}</p>` : ""}
            ${p["졸업 후 진로"] ? `<p><strong>Career after graduation</strong><br>${esc(p["졸업 후 진로"])}</p>` : ""}
          </div>
        </article>
      `).join("");
    }

    return `<section class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(k)}">${html}</section>`;
  }).join("");

  app.innerHTML = pageShell("MEMBERS", tabs + panels);
  wireTabs("members");
}

function renderResearch(activeTab) {
  const groups = SITE_DATA.research;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabs = `<div class="tab-bar">${keys
    .map((k) => `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(k)}">${esc(k)}</button>`)
    .join("")}</div>`;

  const panels = keys.map((k) => {
    const items = groups[k] || [];
    const html = items.length
      ? items.map((it) => `
          <article class="research-item">
            <div class="research-thumb"><img src="${esc(it.Thumb || "../files/no image.jpg")}" alt="${esc(it.Title || "research")}"></div>
            <div class="body">
              <h3>${esc(it.Title || "")}</h3>
              <div class="research-links">
                <a href="${esc(it.File || "#")}" target="_blank" rel="noopener">Paper</a>
                ${linkify(it.Link)}
              </div>
            </div>
          </article>
        `).join("")
      : '<p class="empty-note">등록된 항목이 없습니다.</p>';

    return `<section class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(k)}">${html}</section>`;
  }).join("");

  app.innerHTML = pageShell("RESEARCH", tabs + panels);
  wireTabs("research");
}

function renderPublications(activeTab) {
  const groups = SITE_DATA.publications;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabs = `<div class="tab-bar">${keys
    .map((k) => `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(k)}">${withCount(esc(k.toUpperCase()), groups[k])}</button>`)
    .join("")}</div>`;

  const panels = keys.map((k) => {
    const items = groups[k] || [];
    const html = items.length
      ? `<ol class="pub-list">${items.map((it) => `<li>${esc(it.Title || "")}${it.Link ? ` <a href="${esc(it.Link.trim())}" target="_blank" rel="noopener">↗</a>` : ""}</li>`).join("")}</ol>`
      : '<p class="empty-note">등록된 항목이 없습니다.</p>';

    return `<section class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(k)}">${html}</section>`;
  }).join("");

  app.innerHTML = pageShell("PUBLICATIONS", tabs + panels);
  wireTabs("publications");
}

function renderIPs(activeTab) {
  const groups = SITE_DATA.ips;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabs = `<div class="tab-bar">${keys
    .map((k) => `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(k)}">${esc(k)}</button>`)
    .join("")}</div>`;

  const panels = keys.map((k) => {
    const items = groups[k] || [];
    const html = items.length
      ? `<ul class="ip-list">${items.map((it) => `<li>${esc(it.Title || "")}</li>`).join("")}</ul>`
      : '<p class="empty-note">등록된 항목이 없습니다.</p>';
    return `<section class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(k)}">${html}</section>`;
  }).join("");

  app.innerHTML = pageShell("IPs", tabs + panels);
  wireTabs("ips");
}

function renderLecture() {
  const lecture = SITE_DATA.lecture || {};
  app.innerHTML = pageShell(
    "LECTURE",
    `<section class="placeholder-box"><span class="status">${esc(lecture.status || "")}</span><p>${esc(lecture.message || "")}</p></section>`
  );
}

let currentModal = null;

function closeModal() {
  if (!currentModal) return;
  currentModal.classList.remove("is-visible");
  document.body.classList.remove("news-modal-open");
  const modalToRemove = currentModal;
  currentModal = null;
  modalToRemove.addEventListener("transitionend", () => {
    modalToRemove.remove();
  }, { once: true });
}

function openNewsModal(item) {
  if (currentModal) return;

  const images = Array.isArray(item.Image) ? item.Image : [item.Image || "../files/no image.jpg"];
  let index = 0;

  const modal = document.createElement("div");
  modal.className = "news-modal-backdrop";
  modal.innerHTML = `
    <div class="news-modal-container" role="dialog" aria-modal="true">
      <button class="news-modal-close-btn" aria-label="Close dialog">x</button>
      <div class="news-modal-content">
        <div class="news-modal-gallery">
          <button class="news-modal-gallery-prev" aria-label="Previous image">&lt;</button>
          <div class="news-modal-gallery-track">${images.map((img) => `<img src="${esc(img)}" alt="${esc(item.Title || "news")}">`).join("")}</div>
          <button class="news-modal-gallery-next" aria-label="Next image">&gt;</button>
          <div class="news-modal-gallery-pagination">${images.map((_, i) => `<button class="dot ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`).join("")}</div>
        </div>
        <div class="news-modal-details">
          <h3>${esc(item.Title || "")}</h3>
          <p class="news-modal-date">${esc(item.Date || "")}</p>
          <p>${esc(item.Text || "")}</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("news-modal-open");
  currentModal = modal;

  const track = modal.querySelector(".news-modal-gallery-track");
  const dots = Array.from(modal.querySelectorAll(".dot"));
  const prev = modal.querySelector(".news-modal-gallery-prev");
  const next = modal.querySelector(".news-modal-gallery-next");

  const updateGallery = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    prev.style.visibility = index === 0 ? "hidden" : "visible";
    next.style.visibility = index === images.length - 1 ? "hidden" : "visible";
  };

  if (images.length <= 1) {
    prev.style.display = "none";
    next.style.display = "none";
    modal.querySelector(".news-modal-gallery-pagination").style.display = "none";
  } else {
    prev.addEventListener("click", (e) => {
      e.stopPropagation();
      if (index > 0) index -= 1;
      updateGallery();
    });
    next.addEventListener("click", (e) => {
      e.stopPropagation();
      if (index < images.length - 1) index += 1;
      updateGallery();
    });
    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        index = Number(dot.dataset.index) || 0;
        updateGallery();
      });
    });
  }

  modal.querySelector(".news-modal-close-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", function onEsc(e) {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", onEsc);
    }
  });

  requestAnimationFrame(() => {
    modal.classList.add("is-visible");
    updateGallery();
  });
}

function renderNewsAward(activeTab) {
  const groups = SITE_DATA.news_award;
  const keys = Object.keys(groups);
  const current = keys.includes(activeTab) ? activeTab : keys[0];

  const tabs = `<div class="tab-bar">${keys
    .map((k) => `<button class="tab-btn ${k === current ? "active" : ""}" data-tab="${esc(k)}">${esc(k)}</button>`)
    .join("")}</div>`;

  const panels = keys.map((k) => {
    const items = groups[k] || [];
    const html = items.length
      ? items.map((it, idx) => `
          <article class="news-card" data-category="${esc(k)}" data-index="${idx}">
            <div class="news-thumb"><img src="${esc(it["Main Image"] || "../files/no image.jpg")}" alt="${esc(it.Title || "news")}"></div>
            <div class="news-body">
              <h3>${esc(it.Title || "")}</h3>
              <p class="news-date">${esc(it.Date || "")}</p>
              <p>${esc(it.Text || "")}</p>
            </div>
          </article>
        `).join("")
      : '<p class="empty-note">등록된 소식이 없습니다.</p>';

    return `<section class="tab-panel ${k === current ? "active" : ""}" data-panel="${esc(k)}">${html}</section>`;
  }).join("");

  app.innerHTML = pageShell("NEWS/AWARD", tabs + `<div id="news-panels">${panels}</div>`);

  const container = document.getElementById("news-panels");
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".news-card");
    if (!card) return;

    const category = card.dataset.category;
    const index = Number(card.dataset.index);
    const item = SITE_DATA.news_award[category]?.[index];
    if (item) openNewsModal(item);
  });

  wireTabs("news-award");
}

function wireTabs(routeKey) {
  const buttons = app.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      location.hash = `#/${routeKey}/${encodeURIComponent(tab)}`;
    });
  });
}

function activatePlaceholderLinks() {
  const links = document.querySelectorAll("a[href='#']");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      alert("저장된 링크/페이지로 이동합니다.\n(후반 DB 연동하면서 진행될 작업)");
    });
  });
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
      break;
  }

  initSidebar();
  activatePlaceholderLinks();
  window.scrollTo({ top: 0, behavior: "auto" });
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/home";
  route();
});

window.addEventListener("scroll", () => {
  const header = document.getElementById("site-header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 6);
});
