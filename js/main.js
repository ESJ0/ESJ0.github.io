(function () {
  "use strict";

  // Menú móvil
  var btn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  // Marca en la navegación la sección que se está visitando
  var sectionLinks = document.querySelectorAll('#menu a[href^="#"]');
  var linkedSections = Array.from(sectionLinks).map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  if ("IntersectionObserver" in window) {
    var navigationObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-30% 0px -60%", threshold: 0 });
    linkedSections.forEach(function (section) { navigationObserver.observe(section); });
  }

  // Año del footer
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Selector visual de las capas del stack
  document.querySelectorAll("[data-stack-layer]").forEach(function (layer) {
    layer.addEventListener("click", function () {
      document.querySelectorAll("[data-stack-layer]").forEach(function (item) {
        item.classList.toggle("is-active", item === layer);
      });
    });
  });

  // Carpetas desplegables de habilidades
  var skillFolderButtons = document.querySelectorAll("[data-skill-folder]");
  skillFolderButtons.forEach(function (folderButton) {
    folderButton.addEventListener("click", function () {
      var selectedFolder = folderButton.closest(".skill-folder");
      var shouldOpen = !selectedFolder.classList.contains("is-open");

      skillFolderButtons.forEach(function (button) {
        var folder = button.closest(".skill-folder");
        var content = folder.querySelector(".skill-folder-content");
        var open = folder === selectedFolder && shouldOpen;
        folder.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
        content.setAttribute("aria-hidden", String(!open));
      });
    });
  });
  if (window.location.hash) {
    var requestedSkillFolder = document.querySelector(window.location.hash);
    if (requestedSkillFolder && requestedSkillFolder.classList.contains("skill-folder-content")) {
      requestedSkillFolder.closest(".skill-folder").querySelector("[data-skill-folder]").click();
    }
  }

  // Copia el correo desde la sección de contacto
  var copyEmail = document.querySelector("[data-copy-email]");
  if (copyEmail) {
    copyEmail.addEventListener("click", function () {
      var email = "abril.jose1019@gmail.com";
      function confirmCopy() {
        var original = copyEmail.textContent;
        copyEmail.textContent = "Correo copiado ✓";
        window.setTimeout(function () { copyEmail.textContent = original; }, 1800);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(confirmCopy).catch(function () {
          window.location.href = "mailto:" + email;
        });
        return;
      }
      var temporaryInput = document.createElement("textarea");
      temporaryInput.value = email;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";
      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      document.execCommand("copy");
      temporaryInput.remove();
      confirmCopy();
    });
  }

  // Animación de aparición al hacer scroll
  var targets = document.querySelectorAll(".section-title, .about-text, .about-strengths, .stats li, .skill-folder, .project");
  targets.forEach(function (el) { el.classList.add("reveal"); });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Escribe el titular al cargar sin duplicar el texto para lectores de pantalla
  var typewriterHeading = document.querySelector("[data-typewriter]");
  if (typewriterHeading && !reduce) {
    var typewriterSegments = Array.from(typewriterHeading.querySelectorAll(".type-segment"));
    var typewriterTexts = typewriterSegments.map(function (segment) { return segment.textContent; });
    var typewriterCaret = typewriterHeading.querySelector(".typing-caret");
    var typewriterSegment = 0;
    var typewriterCharacter = 0;

    typewriterSegments.forEach(function (segment) { segment.textContent = ""; });

    function typeNextCharacter() {
      if (typewriterSegment >= typewriterSegments.length) {
        if (typewriterCaret) typewriterCaret.classList.add("is-done");
        return;
      }

      var text = typewriterTexts[typewriterSegment];
      if (typewriterCharacter < text.length) {
        var character = text.charAt(typewriterCharacter);
        typewriterSegments[typewriterSegment].textContent += character;
        typewriterCharacter += 1;
        window.setTimeout(typeNextCharacter, character === " " ? 24 : 43);
        return;
      }

      typewriterSegment += 1;
      typewriterCharacter = 0;
      window.setTimeout(typeNextCharacter, typewriterSegment === 2 ? 180 : 70);
    }

    window.setTimeout(typeNextCharacter, 320);
  }

  // Vista de proyectos: cinta por defecto y cuadrícula como alternativa
  var projectsStage = document.querySelector("[data-projects-stage]");
  var projectsTrack = document.getElementById("projectsTrack");
  var viewOptions = document.querySelectorAll("[data-project-view]");
  var previousProject = document.querySelector(".carousel-prev");
  var nextProject = document.querySelector(".carousel-next");
  var projectsWindow = document.querySelector(".projects-window");
  var tabsContainer = document.querySelector(".project-tabs");

  if (projectsStage && projectsTrack) {
    var projectCards = Array.from(projectsTrack.children);
    var currentProject = 0;
    var touchStartX = 0;

    projectCards.forEach(function (card, index) {
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "diapositiva");
      card.setAttribute("aria-label", (index + 1) + " de " + projectCards.length);

      var tab = document.createElement("button");
      var projectNumber = String(index + 1).padStart(2, "0");
      tab.type = "button";
      tab.className = "project-tab";
      tab.innerHTML = '<span class="mono">' + projectNumber + '</span> ' + card.dataset.projectName;
      tab.setAttribute("aria-label", "Ir al proyecto " + card.dataset.projectName);
      tab.addEventListener("click", function () { showProject(index); });
      tabsContainer.appendChild(tab);
    });

    var projectTabs = tabsContainer.querySelectorAll(".project-tab");

    function showProject(index) {
      currentProject = (index + projectCards.length) % projectCards.length;
      if (projectsStage.dataset.view === "carousel") {
        projectsTrack.style.transform = "translateX(-" + (currentProject * 100) + "%)";
      }
      projectCards.forEach(function (card, cardIndex) {
        var isCurrent = cardIndex === currentProject;
        card.setAttribute("aria-hidden", String(projectsStage.dataset.view === "carousel" && !isCurrent));
        card.querySelectorAll("a, button").forEach(function (control) {
          if (projectsStage.dataset.view === "carousel" && !isCurrent) control.setAttribute("tabindex", "-1");
          else control.removeAttribute("tabindex");
        });
      });
      projectTabs.forEach(function (tab, tabIndex) {
        var isCurrent = tabIndex === currentProject;
        tab.classList.toggle("is-active", isCurrent);
        tab.setAttribute("aria-current", isCurrent ? "true" : "false");
      });
    }

    function setProjectsView(view) {
      projectsStage.dataset.view = view;
      if (view === "carousel") {
        projectsWindow.setAttribute("tabindex", "0");
        projectsWindow.setAttribute("aria-roledescription", "carrusel");
      } else {
        projectsWindow.removeAttribute("tabindex");
        projectsWindow.removeAttribute("aria-roledescription");
      }
      viewOptions.forEach(function (option) {
        var selected = option.dataset.projectView === view;
        option.classList.toggle("is-active", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      if (view === "grid") projectsTrack.style.transform = "none";
      showProject(currentProject);
    }

    viewOptions.forEach(function (option) {
      option.addEventListener("click", function () { setProjectsView(option.dataset.projectView); });
    });
    previousProject.addEventListener("click", function () { showProject(currentProject - 1); });
    nextProject.addEventListener("click", function () { showProject(currentProject + 1); });
    projectsWindow.addEventListener("keydown", function (event) {
      if (projectsStage.dataset.view !== "carousel") return;
      if (event.key === "ArrowLeft") { event.preventDefault(); showProject(currentProject - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); showProject(currentProject + 1); }
    });
    projectsWindow.addEventListener("touchstart", function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    projectsWindow.addEventListener("touchend", function (event) {
      var distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) < 45) return;
      showProject(currentProject + (distance < 0 ? 1 : -1));
    }, { passive: true });

    setProjectsView("carousel");
  }

  function countUp(el) {
    var to = parseInt(el.dataset.to, 10) || 0;
    if (reduce) { el.textContent = to; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll(".count").forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".count").forEach(countUp);
  }
})();
