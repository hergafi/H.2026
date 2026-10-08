(function () {
  "use strict";

  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  var themeBtn = document.getElementById("themeToggle");
  var rootEl = document.documentElement;
  var titrelogo = document.getElementById("titrelogo");
  function setTitleSrc() {
    if (!titrelogo) return;
    titrelogo.setAttribute("src",
      rootEl.classList.contains("light")
        ? "Hamdouna afffiche/new pic/titre-hamdouna light mode.png"
        : "Hamdouna afffiche/new pic/titre-hamdouna dark mode.png"
    );
  }
  setTitleSrc();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var light = rootEl.classList.toggle("light");
      try { localStorage.setItem("hamdouna-theme", light ? "light" : "dark"); } catch (e) {}
      themeBtn.setAttribute("aria-label", light ? "Basculer le thème sombre" : "Basculer le thème clair");
      setTitleSrc();
    });
  }

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  function setMenu(open) {
    links.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      setMenu(!links.classList.contains("open"));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 700) setMenu(false);
    }, { passive: true });
  }

  var revealEls = document.querySelectorAll(".reveal");
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach(function (el) { io.observe(el); });

  document.addEventListener("DOMContentLoaded", function () {
    var bioRaf = null;
    function pinTop(el, animate) {
      var target = function () {
        return el.getBoundingClientRect().top + window.pageYOffset - 110;
      };
      if (!animate) { window.scrollTo(0, target()); return; }
      var start = performance.now();
      var dur = 560;
      (function step(now) {
        window.scrollTo(0, target());
        if (now - start < dur) { bioRaf = requestAnimationFrame(step); }
        else { bioRaf = null; }
      })(start);
    }
    [
      ["bioCollapse", "bioToggle"],
      ["bioCollapse2", "bioToggle2"]
    ].forEach(function (pair) {
      var collapse = document.getElementById(pair[0]);
      var toggle = document.getElementById(pair[1]);
      if (!collapse || !toggle) return;
      toggle.addEventListener("click", function () {
        var open = collapse.classList.toggle("open");
        toggle.textContent = open ? "Lire moins" : "Lire plus";
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        if (bioRaf) { cancelAnimationFrame(bioRaf); bioRaf = null; }
        if (!open) pinTop(collapse, !reduceMotion);
      });
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var heroImg = null;
  var hero = document.getElementById("accueil");
  if (hero) heroImg = hero.querySelector(".hero-scene");

  function setSpot(e) {
    if (!hero) return;
    var pt = e.touches ? e.touches[0] : e;
    if (!pt) return;
    var r = hero.getBoundingClientRect();
    var x = pt.clientX - r.left;
    var y = pt.clientY - r.top;
    hero.style.setProperty("--mx", x.toFixed(1) + "px");
    hero.style.setProperty("--my", y.toFixed(1) + "px");
  }
  document.addEventListener("mousemove", setSpot, { passive: true });
  document.addEventListener("touchstart", setSpot, { passive: true });
  document.addEventListener("touchmove", setSpot, { passive: true });

  var orbs = [];
  document.querySelectorAll(".orb").forEach(function (o) {
    var base = "";
    if (o.classList.contains("orb-cta")) base = "translate(-50%,-50%)";
    else if (o.classList.contains("orb-hero")) base = "translateX(-50%)";
    o.base = base;
    orbs.push(o);
  });

  if (!reduceMotion && (heroImg || orbs.length)) {
    var normX = 0, normY = 0, tX = 0, tY = 0, mraf = null;
    function mouseLoop() {
      tX += (normX - tX) * 0.08;
      tY += (normY - tY) * 0.08;
      if (heroImg) {
        heroImg.style.transform =
          "scale(1.12) translate3d(" + (-tX * 40).toFixed(2) + "px," + (-tY * 26).toFixed(2) + "px,0)";
      }
      orbs.forEach(function (o) {
        var depth = parseFloat(o.getAttribute("data-depth")) || 20;
        o.style.transform = o.base +
          " translate3d(" + (tX * depth).toFixed(2) + "px," + (tY * depth).toFixed(2) + "px,0)";
      });
      if (Math.abs(normX - tX) > 0.0001 || Math.abs(normY - tY) > 0.0001) {
        mraf = requestAnimationFrame(mouseLoop);
      } else {
        mraf = null;
      }
    }
    window.addEventListener("mousemove", function (e) {
      normX = (e.clientX / window.innerWidth - 0.5) * 2;
      normY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!mraf) mraf = requestAnimationFrame(mouseLoop);
    }, { passive: true });
    window.addEventListener("resize", function () {
      normX = 0; normY = 0;
      if (!mraf) mraf = requestAnimationFrame(mouseLoop);
    }, { passive: true });
    requestAnimationFrame(mouseLoop);
  }

  var pItems = [];
  if (!reduceMotion) {
    pItems = Array.prototype.slice.call(document.querySelectorAll(".parallax")).map(function (el) {
      var img = el.querySelector("img");
      if (!img) return null;
      return { el: el, img: img, speed: parseFloat(el.getAttribute("data-speed")) || 0.2 };
    }).filter(Boolean);
  }

  var parallaxTicking = false;
  function updateParallax() {
    if (!pItems.length) return;
    var vh = window.innerHeight;
    pItems.forEach(function (item) {
      var r = item.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var center = r.top + r.height / 2 - vh / 2;
      var maxMove = r.height * 0.06;
      var move = Math.max(-maxMove, Math.min(maxMove, -center * item.speed));
      item.img.style.transform = "scale(1.12) translate3d(0," + move.toFixed(2) + "px,0)";
    });
    parallaxTicking = false;
  }
  function requestParallax() {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(updateParallax);
  }
  if (pItems.length) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    updateParallax();
  }

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox.querySelector(".lightbox-img");
  var lightboxClose = lightbox.querySelector(".lightbox-close");

  function resetZoom() {
    lightboxImg.classList.remove("zoomed");
    lightboxImg.style.transformOrigin = "50% 50%";
  }

  document.querySelectorAll(".grid-item img").forEach(function (img) {
    img.addEventListener("click", function () {
      lightboxImg.setAttribute("src", img.getAttribute("src"));
      lightboxImg.setAttribute("alt", img.getAttribute("alt") || "");
      resetZoom();
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    resetZoom();
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxImg.addEventListener("click", function (e) {
    if (lightboxImg.classList.contains("zoomed")) { resetZoom(); return; }
    var r = lightboxImg.getBoundingClientRect();
    var px = ((e.clientX - r.left) / r.width) * 100;
    var py = ((e.clientY - r.top) / r.height) * 100;
    lightboxImg.style.transformOrigin = px + "% " + py + "%";
    lightboxImg.classList.add("zoomed");
  });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  var cdDays = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  var cdSecs = document.getElementById("cd-secs");
  if (cdDays && cdHours && cdMins && cdSecs) {
    var vernissage = new Date("2026-10-17T18:00:00");
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function updateCountdown() {
      var diff = vernissage.getTime() - Date.now();
      if (diff < 0) diff = 0;
      cdDays.textContent = pad(Math.floor(diff / 86400000));
      cdHours.textContent = pad(Math.floor(diff / 3600000) % 24);
      cdMins.textContent = pad(Math.floor(diff / 60000) % 60);
      cdSecs.textContent = pad(Math.floor(diff / 1000) % 60);
    }
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  var OEUVRES = [
    { n: "01", titre: "Trajectoires",          annee: "2026", technique: "Acrylique sur toile",  format: "",           dims: "120 × 150 cm",       prix: 1800 },
    { n: "02", titre: "L'œil du silence",      annee: "2023", technique: "Acrylique sur toile",  format: "",           dims: "150 × 120 cm",       prix: 1800 },
    { n: "03", titre: "Fragment de rêve",      annee: "2017", technique: "Acrylique sur toile",  format: "",           dims: "40 × 80 cm",         prix: 600 },
    { n: "04", titre: "Genèse",                annee: "2021", technique: "Acrylique sur toile",  format: "",           dims: "80 × 80 cm",         prix: 800 },
    { n: "05", titre: "Fureur",                annee: "2026", technique: "Acrylique sur toile",  format: "",           dims: "150 × 120 cm",       prix: 1800 },
    { n: "06", titre: "Forêt intérieure",      annee: "2024", technique: "Acrylique sur toile",  format: "",           dims: "150 × 120 cm",       prix: 1800 },
    { n: "07", titre: "Échappée",              annee: "2020", technique: "Acrylique sur toile",  format: "Triptyque", dims: "3 × 30 × 70 cm",     prix: 900 },
    { n: "08", titre: "Élan vital",            annee: "2019", technique: "Acrylique sur toile",  format: "Triptyque", dims: "3 × 49 × 70 cm",     prix: 1200 },
    { n: "09", titre: "Résonance",             annee: "2022", technique: "Acrylique sur toile",  format: "Diptyque",  dims: "2 × 75 × 40 cm",     prix: 800 },
    { n: "10", titre: "Orbites",               annee: "2021", technique: "Acrylique sur toile",  format: "Diptyque",  dims: "2 × 35 × 70 cm",     prix: 600 },
    { n: "11", titre: "Souffle d'énergie",     annee: "2024", technique: "Acrylique sur toile",  format: "",           dims: "150 × 150 cm",       prix: 3000 },
    { n: "12", titre: "Vestiges",              annee: "2023", technique: "Acrylique sur toile",  format: "",           dims: "120 × 150 cm",       prix: 1800 },
    { n: "13", titre: "Éclosion",              annee: "2021", technique: "Acrylique sur toile",  format: "",           dims: "60 × 90 cm",         prix: 900 },
    { n: "14", titre: "Lignes de vie",         annee: "2015", technique: "Acrylique sur toile",  format: "",           dims: "100 × 70 cm",        prix: 600 },
    { n: "15", titre: "La vie en mouvement",   annee: "2026", technique: "Acrylique sur toile",  format: "",           dims: "165 × 120 cm",       prix: 2000 },
    { n: "16", titre: "Après l'orage",         annee: "2021", technique: "Acrylique sur toile",  format: "",           dims: "100 × 100 cm",       prix: 1000 },
    { n: "17", titre: "L'heure du thé",        annee: "2020", technique: "Aquarelle sur papier", format: "",           dims: "52 × 40 cm",         prix: 400 },
    { n: "18", titre: "Éveil printanier",      annee: "2012", technique: "Pastel sur papier",    format: "",           dims: "45 × 52 cm",         prix: 450 },
    { n: "19", titre: "Éclosion violette",     annee: "2020", technique: "Pastel sur papier",    format: "",           dims: "42 × 51 cm",         prix: 450 },
    { n: "20", titre: "La grâce du pacifique", annee: "2020", technique: "Pastel sur papier",    format: "",           dims: "53 × 46 cm",         prix: 450 },
    { n: "21", titre: "Instant fleuri",        annee: "2017", technique: "Aquarelle sur papier", format: "",           dims: "41 × 53 cm",         prix: 450 },
    { n: "22", titre: "Paysage hivernal",      annee: "2009", technique: "Pastel sur papier",    format: "",           dims: "60 × 43 cm",         prix: 550 },
    { n: "23", titre: "Rouges en lumière",     annee: "2018", technique: "Aquarelle sur papier", format: "",           dims: "54 × 42 cm",         prix: 400 },
    { n: "24", titre: "Dans la lumière",       annee: "2017", technique: "Aquarelle sur papier", format: "",           dims: "54 × 42 cm",         prix: 400 },
    { n: "25", titre: "Éclosion",              annee: "2018", technique: "Aquarelle sur papier", format: "",           dims: "54 × 42 cm",         prix: 400 },
    { n: "26", titre: "Lumière blanche",       annee: "2018", technique: "Aquarelle sur papier", format: "",           dims: "42 × 54 cm",         prix: 400 },
    { n: "27", titre: "Dernier éclat",         annee: "2018", technique: "Aquarelle sur papier", format: "",           dims: "54 × 42 cm",         prix: 500 },
    { n: "28", titre: "Lumière du verger",     annee: "2017", technique: "Aquarelle sur papier", format: "",           dims: "54 × 42 cm",         prix: 500 },
    { n: "29", titre: "Éveil",                 annee: "2020", technique: "Aquarelle sur papier", format: "",           dims: "54 × 42 cm",         prix: 400 },
    { n: "30", titre: "Éclats de grenades",    annee: "2020", technique: "Pastel sur papier",    format: "",           dims: "45 × 40 cm",         prix: 450 },
    { n: "31", titre: "Le bonheur en bouquet", annee: "2017", technique: "Pastel sur papier",    format: "",           dims: "54 × 42 cm",         prix: 450 },
    { n: "32", titre: "Parfum d'été",          annee: "2014", technique: "Aquarelle sur papier", format: "",           dims: "44 × 36 cm",         prix: 400 },
    { n: "33", titre: "Le bruit des pensées",  annee: "2023", technique: "Acrylique sur toile",  format: "",           dims: "150 × 150 cm",       prix: 2700 },
    { n: "34", titre: "Émeraude abyssale",     annee: "2023", technique: "Acrylique sur carton", format: "",           dims: "90 × 62 cm",         prix: 1000 },
    { n: "35", titre: "Danse florale",         annee: "2003", technique: "Acrylique sur carton", format: "",           dims: "90 × 62 cm",         prix: 1000 },
    { n: "36", titre: "Floraison",             annee: "2020", technique: "Acrylique sur carton", format: "",           dims: "62 × 52 cm",         prix: 500 },
    { n: "37", titre: "Jardin secret",         annee: "2022", technique: "Acrylique sur carton", format: "",           dims: "45 × 58 cm",         prix: 500 },
    { n: "38", titre: "L'âme du jardin",       annee: "2023", technique: "Acrylique sur carton", format: "",           dims: "39 × 50 cm",         prix: 450 },
    { n: "39", titre: "Surgissement",          annee: "2018", technique: "Acrylique sur carton", format: "",           dims: "47 × 36 cm",         prix: 450 },
    { n: "40", titre: "Jardin foisonnant",     annee: "2017", technique: "Acrylique sur carton", format: "",           dims: "95 × 68 cm",         prix: 1000 },
    { n: "41", titre: "Lueurs d'automne",      annee: "2018", technique: "Acrylique sur carton", format: "",           dims: "44 × 56 cm",         prix: 450 },
    { n: "42", titre: "Rêve en bleu",          annee: "2023", technique: "Acrylique sur carton", format: "",           dims: "50 × 41 cm",         prix: 450 },
    { n: "43", titre: "Éclats en mouvement",   annee: "2019", technique: "Acrylique sur carton", format: "",           dims: "69 × 42 cm",         prix: 500 },
    { n: "44", titre: "Murmures de fleurs",    annee: "2019", technique: "Acrylique sur carton", format: "",           dims: "50 × 40 cm",         prix: 450 },
    { n: "45", titre: "Éclats nocturnes",      annee: "2021", technique: "Acrylique sur carton", format: "",           dims: "61 × 73 cm",         prix: 1000 },
    { n: "46", titre: "Paysage lunaire",       annee: "2023", technique: "Acrylique sur carton", format: "",           dims: "61 × 73 cm",         prix: 1000 }
  ];
  var IMG_DIR = "tableaux tel/oeuvres/";

  var modal = document.getElementById("oeuvres");
  if (modal && OEUVRES.length) {
    var panel = modal.querySelector(".oeuvres-panel");
    var grid = document.getElementById("oeuvresGrid");
    var filtersBar = document.getElementById("oeuvresFilters");
    var countEl = document.getElementById("oeuvresCount");
    var bodyEl = document.getElementById("oeuvresBody");
    var detail = document.getElementById("oeuvreDetail");
    var backBtn = document.getElementById("oeuvreBack");
    var prevBtn = document.getElementById("oeuvrePrev");
    var nextBtn = document.getElementById("oeuvreNext");
    var imgFull = document.getElementById("oeuvreImg");
    var elNum = document.getElementById("oeuvreNum");
    var elTitre = document.getElementById("oeuvreTitre");
    var elAnnee = document.getElementById("oeuvreAnnee");
    var elTech = document.getElementById("oeuvreTechnique");
    var elDims = document.getElementById("oeuvreDims");
    var specAnnee = document.getElementById("oeuvreSpecAnnee");
    var specTech = document.getElementById("oeuvreSpecTech");

    function techLabel(o) {
      if (o.format && o.technique) return o.format + " · " + o.technique;
      return o.format || o.technique;
    }
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }

    var current = -1;
    var lastFocus = null;

    function updateCount() {
      countEl.textContent = OEUVRES.length + (OEUVRES.length > 1 ? " œuvres" : " œuvre");
    }

    function resetZoom() {
      imgFull.classList.remove("zoomed");
      imgFull.style.transformOrigin = "50% 50%";
      var m = detail.querySelector(".oeuvre-detail-media");
      if (m) m.classList.remove("is-zoomed");
    }

    function buildGrid() {
      grid.textContent = "";
      OEUVRES.forEach(function (o) {
        var fig = el("figure", "oeuvre-card");
        fig.setAttribute("role", "button");
        fig.setAttribute("tabindex", "0");
        fig.setAttribute("aria-label", "Œuvre n° " + o.n + ", " + o.titre);
        var im = document.createElement("img");
        im.src = IMG_DIR + "n" + o.n + "-sm.jpg";
        im.alt = o.titre + " — Hamdouna";
        im.loading = "lazy";
        im.decoding = "async";
        var cap = el("figcaption", "oeuvre-card-cap");
        cap.appendChild(el("span", "oeuvre-card-num", "N° " + o.n));
        cap.appendChild(el("span", "oeuvre-card-titre", o.titre));
        cap.appendChild(el("span", "oeuvre-card-dims", o.dims));
        fig.appendChild(im);
        fig.appendChild(cap);
        fig.addEventListener("click", function () { openDetail(OEUVRES.indexOf(o)); });
        fig.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(OEUVRES.indexOf(o)); }
        });
        grid.appendChild(fig);
      });
      updateCount();
    }

    function openDetail(i) {
      if (i < 0 || i >= OEUVRES.length) return;
      current = i;
      var o = OEUVRES[i];
      resetZoom();
      imgFull.setAttribute("src", IMG_DIR + "n" + o.n + ".jpg");
      imgFull.setAttribute("alt", o.titre + " — Hamdouna");
      elNum.textContent = "N° " + o.n;
      elTitre.textContent = o.titre;
      elAnnee.textContent = o.annee;
      elTech.textContent = techLabel(o);
      elDims.textContent = o.dims;
      specAnnee.hidden = !o.annee;
      specTech.hidden = !techLabel(o);
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === OEUVRES.length - 1;
      grid.hidden = true;
      detail.hidden = false;
      panel.classList.add("is-detail");
      countEl.textContent = "Œuvre " + (i + 1) + " sur " + OEUVRES.length;
      bodyEl.scrollTop = 0;
      var media = detail.querySelector(".oeuvre-detail-media");
      media.classList.remove("is-in");
      requestAnimationFrame(function () { media.classList.add("is-in"); });
      backBtn.focus();
    }

    function closeDetail() {
      current = -1;
      resetZoom();
      detail.hidden = true;
      grid.hidden = false;
      panel.classList.remove("is-detail");
      imgFull.removeAttribute("src");
      updateCount();
    }

    function open() {
      lastFocus = document.activeElement;
      buildGrid();
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      modal.querySelector(".oeuvres-close").focus();
    }

    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      closeDetail();
      if (lastFocus) lastFocus.focus();
    }

    imgFull.addEventListener("click", function (e) {
      var media = detail.querySelector(".oeuvre-detail-media");
      if (imgFull.classList.contains("zoomed")) { resetZoom(); return; }
      var r = imgFull.getBoundingClientRect();
      var px = ((e.clientX - r.left) / r.width) * 100;
      var py = ((e.clientY - r.top) / r.height) * 100;
      imgFull.style.transformOrigin = px + "% " + py + "%";
      imgFull.classList.add("zoomed");
      media.classList.add("is-zoomed");
    });

    var openBtn = document.getElementById("oeuvresOpen");
    if (openBtn) openBtn.addEventListener("click", open);

    modal.querySelectorAll("[data-oeuvres-close]").forEach(function (b) {
      b.addEventListener("click", close);
    });
    backBtn.addEventListener("click", closeDetail);
    prevBtn.addEventListener("click", function () { openDetail(current - 1); });
    nextBtn.addEventListener("click", function () { openDetail(current + 1); });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var f = panel.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
        var list = Array.prototype.filter.call(f, function (el2) { return el2.offsetParent !== null; });
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (detail.hidden) return;
      if (e.key === "ArrowLeft") { if (current > 0) openDetail(current - 1); }
      if (e.key === "ArrowRight") { if (current < OEUVRES.length - 1) openDetail(current + 1); }
    });
  }
})();