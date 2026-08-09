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
const SITE_DATA_URL = window.SITE_DATA_SOURCE_URL || "";

const app = document.getElementById("app");
const toggle = document.getElementById('sidebar-toggle');
let NAV = [];
let IS_READY = false;
let HOME_HERO_AUTOPLAY_ID = null;

function stopHomeHeroSlider() {
  if (HOME_HERO_AUTOPLAY_ID !== null) {
    window.clearInterval(HOME_HERO_AUTOPLAY_ID);
    HOME_HERO_AUTOPLAY_ID = null;
  }
}

function renderSkeleton() {
  const { key } = parseHash();

  const heroBanner = `
    <div class="hero">
      <div class="hero-banner">
        <span class="mark">${LAB_SHORT}</span>
        <span class="mark">${LAB_NAME_EN}</span>
      </div>
    </div>`;

  if (!key || key === "home") {
    app.innerHTML = `
      ${heroBanner}
      <main>
        <div class="hero-inner">
          <h1>${LAB_NAME_KO} (${LAB_SHORT})</h1>
          <p class="subtitle">${UNIV_KO} · ${UNIV_EN}</p>
        </div>
        <div class="skeleton-block skeleton-hero-image"></div>
        <div class="skeleton-block skeleton-prose"></div>
        <div class="section-block">
          <h2>Research Highlights</h2>
          <div class="highlight-list">
            ${Array(4).fill('<div class="skeleton-block skeleton-card"></div>').join("")}
          </div>
        </div>
      </main>
    `;
    return;
  }

  if (key === "lecture") {
    app.innerHTML = `
      ${heroBanner}
      <main>
        <div class="skeleton-block skeleton-page-title"></div>
        <div class="skeleton-block skeleton-prose" style="height:120px;margin-top:24px;"></div>
      </main>
    `;
    return;
  }

  // Tab-based pages: members, research, publications, ips, news-award
  app.innerHTML = `
    ${heroBanner}
    <main>
      <div class="skeleton-block skeleton-page-title"></div>
      <div class="skeleton-tab-bar">
        ${Array(4).fill('<div class="skeleton-block skeleton-tab"></div>').join("")}
      </div>
      <div class="skeleton-card-list">
        ${Array(5).fill('<div class="skeleton-block skeleton-card"></div>').join("")}
      </div>
    </main>
  `;
}

const DEFAULT_MENU = ["Home", "Members", "Research", "Publications", "IPs", "Lecture", "NewsAward"];

function menuLabelToRouteKey(label) {
  const normalized = String(label || "").trim().toLowerCase();
  if (normalized === "newsaward" || normalized === "news/award" || normalized === "news-award") return "news-award";
  if (normalized === "ips") return "ips";
  return normalized;
}

function buildNav() {
  const menuLabels = Array.isArray(SITE_DATA.menu) && SITE_DATA.menu.length ? SITE_DATA.menu : DEFAULT_MENU;

  NAV = [
    ...menuLabels.map((label) => {
      const key = menuLabelToRouteKey(label);

      if (key === "members") {
        return {
          key,
          label,
          path: "#/members",
          children: Object.keys(SITE_DATA.members).map((k) => ({
            label: k,
            path: `#/members/${encodeURIComponent(k)}`,
          })),
        };
      }

      if (key === "research") {
        return {
          key,
          label,
          path: "#/research",
          children: Object.keys(SITE_DATA.research).map((k) => ({
            label: k,
            path: `#/research/${encodeURIComponent(k)}`,
          })),
        };
      }

      if (key === "publications") {
        return {
          key,
          label,
          path: "#/publications",
          children: Object.keys(SITE_DATA.publications).map((k) => ({
            label: k,
            path: `#/publications/${encodeURIComponent(k)}`,
          })),
        };
      }

      if (key === "ips") {
        return {
          key,
          label,
          path: "#/ips",
          children: Object.keys(SITE_DATA.ips).map((k) => ({
            label: k,
            path: `#/ips/${encodeURIComponent(k)}`,
          })),
        };
      }

      if (key === "news-award") {
        return {
          key,
          label,
          path: "#/news-award",
          children: Object.keys(SITE_DATA.news_award).map((k) => ({
            label: k,
            path: `#/news-award/${encodeURIComponent(k)}`,
          })),
        };
      }

      return { key, label, path: `#/${key}` };
    }),
  ];
}

function mergeSiteData(remoteData) {
  if (!remoteData || typeof remoteData !== "object") return;
  Object.keys(remoteData).forEach((key) => {
    SITE_DATA[key] = remoteData[key];
  });
}

async function initializeData() {
  if (SITE_DATA_URL) {
    try {
      const remoteData = await loadRemoteSiteDataJsonp();
      console.log("Apps Script JSON data:", remoteData);
      mergeSiteData(remoteData);
    } catch (error) {
      console.warn("Failed to load remote sheet data, using local data.js fallback.", error);
    }
  }

  IS_READY = true;
  buildNav();
  route();
}

function loadRemoteSiteDataJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `__isdlSiteData_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const separator = SITE_DATA_URL.includes("?") ? "&" : "?";
    const url = `${SITE_DATA_URL}${separator}callback=${callbackName}`;
    let timeoutId = null;

    function cleanup() {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (script.parentNode) script.parentNode.removeChild(script);
      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP load failed"));
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("JSONP load timed out"));
    }, 15000);

    script.src = url;
    document.head.appendChild(script);
  });
}

function normalizeImageList(imageData) {
  if (Array.isArray(imageData)) {
    return imageData.map((v) => String(v || "").trim()).filter(Boolean);
  }

  if (typeof imageData === "string") {
    return imageData
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function getNewsGalleryArrowSvg(direction) {
  const isPrev = direction === "prev";
  const path = isPrev
    ? "M44.16,73.16c16.016,0,29-12.984,29-29s-12.984-29-29-29-29,12.984-29,29,12.984,29,29,29ZM48.058,31.228l3.508,3.508-10.108,10.108,10.108,10.108-3.508,3.508-13.616-13.616,13.616-13.616Z"
    : "M44.16,15.16c-16.016,0-29,12.984-29,29s12.984,29,29,29,29-12.984,29-29-12.984-29-29-29ZM40.262,57.092l-3.508-3.508,10.108-10.108-10.108-10.108,3.508-3.508,13.616,13.616-13.616,13.616Z";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88.32 88.32" aria-hidden="true" focusable="false">
      <g opacity="0.75">
        <path fill="#938e8e" d="${path}"/>
      </g>
    </svg>
  `;
}

function setupHomeHeroSlider() {
  const slider = document.getElementById("home-hero-slider");
  if (!slider) return;

  const track = slider.querySelector(".hero-slider-track");
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".news-modal-gallery-pagination .dot"));
  const prevBtn = slider.querySelector(".news-modal-gallery-prev");
  const nextBtn = slider.querySelector(".news-modal-gallery-next");

  if (!track || slides.length <= 1) return;

  let currentIndex = 0;
  const total = slides.length;

  const updateSlider = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });
  };

  const goNext = () => {
    currentIndex = (currentIndex + 1) % total;
    updateSlider();
  };

  const goPrev = () => {
    currentIndex = (currentIndex - 1 + total) % total;
    updateSlider();
  };

  if (prevBtn) prevBtn.addEventListener("click", goPrev);
  if (nextBtn) nextBtn.addEventListener("click", goNext);

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      currentIndex = idx;
      updateSlider();
    });
  });

  stopHomeHeroSlider();
  HOME_HERO_AUTOPLAY_ID = window.setInterval(goNext, 3000);

  slider.addEventListener("mouseenter", stopHomeHeroSlider);
  slider.addEventListener("mouseleave", () => {
    stopHomeHeroSlider();
    HOME_HERO_AUTOPLAY_ID = window.setInterval(goNext, 3000);
  });

  updateSlider();
}
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
  const imageList = normalizeImageList(home.greeting.image);
  const slides = imageList.length ? imageList : ["../files/no image.jpg"];
  const koText = home.greeting.korean;
  const enText = home.greeting.english;
  const highlights = home.highlights || [];

  app.innerHTML = `
    <div class="hero">
      <div class="hero-banner"><span class="mark">${LAB_SHORT}</span><span class="mark">${LAB_NAME_EN}</span></div>
      <div class="hero-image hero-slider" id="home-hero-slider">
        <div class="hero-slider-track">
          ${slides
            .map(
              (src, idx) => `
            <div class="hero-slide" data-index="${idx}">
              <img src="${esc(src)}" alt="Hero Image ${idx + 1}">
            </div>`
            )
            .join("")}
        </div>
        ${
          slides.length > 1
            ? `<button class="news-modal-gallery-prev" aria-label="Previous image">${getNewsGalleryArrowSvg("prev")}</button>
        <button class="news-modal-gallery-next" aria-label="Next image">${getNewsGalleryArrowSvg("next")}</button>
        <div class="news-modal-gallery-pagination">
          ${slides
            .map(
              (_, idx) => `<div class="dot ${idx === 0 ? "active" : ""}" data-index="${idx}" aria-label="Go to image ${idx + 1}"></div>`
            )
            .join("")}
        </div>`
            : ""
        }
      </div>
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

  setupHomeHeroSlider();
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
                ? `<a href="${esc((p.cvlink))}" target="_blank" style="text-decoration: none; color:#000;">[CV]</a>`
                : ""
            }
          </div>
        </div>
      
        <div class="director-right">
          <div class="director-name">
            ${esc((p["이름"] || ""))}
            ${
              p.cvlink
                ? `<a href="${esc((p.cvlink))}" target="_blank" style="text-decoration: none; color:#000;">[CV]</a>`
                : ""
            }
          </div>
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
              <div class="research-links">
                <a href="${esc(it.File)}" target="_blank" rel="noopener">Paper</a>
                ${linkify(it.Link)}
              </div>
              
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

  app.innerHTML = pageShell("Publications", tabBar + panels, true);
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

  app.innerHTML = pageShell("IPs", tabBar + panels, true);
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
                (it, index) => `
                  <div class="news-card" data-category="${esc(k)}" data-index="${index}">
                    <div class="news-thumb">
                      <img src="${esc(it["Main Image"] || "../files/no image.jpg")}" alt="${esc(it.Title)}" />
                    </div>
                    <div class="news-body">
                      <div class="news-date">${esc(it.Date)}</div>
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

  app.innerHTML = pageShell("News / Award", tabBar + `<div id="news-panels">${panels}</div>`, true);

  const newsContainer = document.getElementById('news-panels');
  newsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.news-card');
    if (card) {
      const category = card.dataset.category;
      const index = parseInt(card.dataset.index, 10);
      const item = SITE_DATA.news_award[category]?.[index];
      if (item) {
        openNewsModal(item);
      }
    }
  });

  wireTabs("news-award");
}

/* ---------- News Modal ---------- */
let currentNewsModal = null;
let isModalClosing = false;

function createNewsModal(item) {
  const images = Array.isArray(item.Image) ? item.Image : [item.Image || "../files/no image.jpg"];
  const galleryTrack = images.map(img => `<img src="${esc(img)}" alt="${esc(item.Title)}">`).join('');
  const pagination = images.length > 1 
    ? `<div class="news-modal-gallery-pagination">${images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}</div>` 
    : '';

  const galleryControls = images.length > 1
    ? `
      <button class="news-modal-gallery-prev" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Layer_1" data-name="Layer 1" viewBox="0 0 88.32 88.32" data-hwp-extension="rhwp" data-hwp-extension-version="0.8.2">
          <defs>
            <style>
              .cls-1 {
                fill: #fff;
              }

              .cls-2 {
                opacity: .75;
              }
            </style>
          </defs>
          <g class="cls-2">
            <image width="368" height="368" transform="translate(88.32 88.32) rotate(-180) scale(.24)" xlink:href="data:image/png;base64,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"/>
            <path class="cls-1" d="M44.16,73.16c16.016,0,29-12.984,29-29s-12.984-29-29-29-29,12.984-29,29,12.984,29,29,29ZM48.058,31.228l3.508,3.508-10.108,10.108,10.108,10.108-3.508,3.508-13.616-13.616,13.616-13.616Z"/>
          </g>
        <script xmlns=""/></svg>
      </button>
      <button class="news-modal-gallery-next">
       <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Layer_1" data-name="Layer 1" viewBox="0 0 88.32 88.32" data-hwp-extension="rhwp" data-hwp-extension-version="0.8.2">
          <defs>
            <style>
              .cls-1 {
                fill: #fff;
              }

              .cls-2 {
                opacity: .75;
              }
            </style>
          </defs>
          <g class="cls-2">
            <image width="368" height="368" transform="scale(.24)" xlink:href="data:image/png;base64,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"/>
            <path class="cls-1" d="M44.16,15.16c-16.016,0-29,12.984-29,29s12.984,29,29,29,29-12.984,29-29-12.984-29-29-29ZM40.262,57.092l-3.508-3.508,10.108-10.108-10.108-10.108,3.508-3.508,13.616,13.616-13.616,13.616Z"/>
          </g>
        <script xmlns=""/></svg>
      </button>
    `
    : '';

  return `
    <div class="news-modal-backdrop">
      <button class="news-modal-close-btn" aria-label="Close dialog">&times;</button>
      <div class="news-modal-container" role="dialog" aria-modal="true">
        <div class="news-modal-content">
          <div class="news-modal-gallery">
            ${galleryControls}
            <div class="news-modal-gallery-track">${galleryTrack}</div>
            ${pagination}
          </div>
          <div class="news-modal-details">
          <h3>${esc(item.Title)}</h3>
            <!--<p class="news-modal-date">${esc(item.Date)}</p>-->
            <p>${esc(item.Text)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openNewsModal(item) {
  if (currentNewsModal) return;
  isModalClosing = false;

  const modalHtml = createNewsModal(item);
  const modalFragment = document.createRange().createContextualFragment(modalHtml);
  currentNewsModal = modalFragment.querySelector('.news-modal-backdrop');
  
  document.body.appendChild(currentNewsModal);
  document.body.classList.add('news-modal-open');

  setTimeout(() => {
    currentNewsModal.classList.add('is-visible');
  }, 10);
  
  history.pushState({ modal: 'news' }, '', '#news');

  const closeBtn = currentNewsModal.querySelector('.news-modal-close-btn');
  closeBtn.addEventListener('click', closeModal);
  currentNewsModal.addEventListener('click', (e) => {
    if (e.target === currentNewsModal) {
      closeModal();
    }
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  
  const handlePopState = () => {
    closeModal(true);
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('popstate', handlePopState);

  // Gallery Logic
  const images = Array.isArray(item.Image) ? item.Image : [item.Image || "files/no image.jpg"];
  const numImages = images.length;
  if (numImages > 1) {
    const track = currentNewsModal.querySelector('.news-modal-gallery-track');
    const dots = currentNewsModal.querySelectorAll('.news-modal-gallery-pagination .dot');
    const prevBtn = currentNewsModal.querySelector('.news-modal-gallery-prev');
    const nextBtn = currentNewsModal.querySelector('.news-modal-gallery-next');
    
    let currentIndex = 0;

    const updateGallery = () => {
      track.scrollTo({ left: currentIndex * track.clientWidth, behavior: 'smooth' });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
      nextBtn.style.display = currentIndex === numImages - 1 ? 'none' : 'flex';
    };

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateGallery();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < numImages - 1) {
        currentIndex++;
        updateGallery();
      }
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        currentIndex = parseInt(dot.dataset.index, 10);
        updateGallery();
      });
    });
    
    // Initial state check for next button
    if (numImages === 1) {
        nextBtn.style.display = 'none';
    }
  }

  currentNewsModal.dataset.cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('popstate', handlePopState);
  };
}

function closeModal(isFromPopState = false) {
  if (!currentNewsModal || isModalClosing) return;
  isModalClosing = true;

  if (typeof currentNewsModal.dataset.cleanup === 'function') {
    currentNewsModal.dataset.cleanup();
  }

  currentNewsModal.classList.remove('is-visible');

  // Wait for CSS transition to finish before removing
  currentNewsModal.addEventListener('transitionend', function onTransitionEnd() {
    this.removeEventListener('transitionend', onTransitionEnd);
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
    currentNewsModal = null;
    isModalClosing = false;
  });

  document.body.classList.remove('news-modal-open');

  if (!isFromPopState && location.hash === '#news') {
    history.back();
  }
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

/* ---------- a태그 href 값이 #인 것들 ---------- */
function aherfisshop() {
  const links = document.querySelectorAll("a");

  links.forEach(link => {
    if (link.getAttribute("href") === "#") {
      link.addEventListener("click", function (event) {
        event.preventDefault(); // 기본 동작 막기
        alert("저장된 링크/페이지로 이동합니다.\n(후반 DB 연동하면서 진행될 작업)");
      });
    }
  });
}
/* ---------- router ---------- */

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
  return { key: parts[0] || "home", child: parts[1] };
}

function route() {
  if (!IS_READY) return;
  stopHomeHeroSlider();
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
  aherfisshop();
  updateFabButtons(key);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function updateFabButtons(pageKey) {
  const youtubeBtn = document.getElementById("youtube-btn");
  if (!youtubeBtn) return;
  const url = (SITE_DATA.home && SITE_DATA.home.youtube_url) || "";
  const show = pageKey === "home" && /^https?:\/\//.test(url);
  youtubeBtn.href = show ? url : "#";
  youtubeBtn.classList.toggle("visible", show);
}

window.addEventListener("hashchange", () => {
  if (IS_READY) route();
});
window.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.addEventListener("animationend", () => loader.remove(), { once: true });
  }

  buildNav();
  if (!location.hash) location.hash = "#/home";
  const { key, child } = parseHash();
  renderHeader(key, child);
  renderSidebar();
  initSidebar();
  renderSkeleton();
  initializeData();
});

const header = document.getElementById("site-header");
const scrollTopBtn = document.getElementById("scroll-top-btn");

if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
  scrollTopBtn?.classList.toggle("visible", window.scrollY > 200);
});