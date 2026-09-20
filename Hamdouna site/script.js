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
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var light = rootEl.classList.toggle("light");
      try { localStorage.setItem("hamdouna-theme", light ? "light" : "dark"); } catch (e) {}
      themeBtn.setAttribute("aria-label", light ? "Basculer le thème sombre" : "Basculer le thème clair");
    });
  }

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
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

  document.querySelectorAll(".grid-item img").forEach(function (img) {
    img.addEventListener("click", function () {
      lightboxImg.setAttribute("src", img.getAttribute("src"));
      lightboxImg.setAttribute("alt", img.getAttribute("alt") || "");
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
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
})();