const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
const CLARITY_PROJECT_ID = "xxxxxxxxxx";

if (GA_MEASUREMENT_ID !== "G-XXXXXXXXXX") {
  const ga = document.createElement("script");
  ga.async = true;
  ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}

if (CLARITY_PROJECT_ID !== "xxxxxxxxxx") {
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
}

const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");

if (nav && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const page = document.body.dataset.page;
if (nav && page) {
  const map = {
    home: "index.html",
    categories: "categories.html",
    blog: "blog.html",
    contact: "contact.html"
  };
  const activeHref = map[page];
  if (activeHref) {
    nav.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("href") === activeHref) {
        link.classList.add("is-active");
      }
    });
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const yearTarget = document.querySelector("[data-year]");
if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

const NEWS_KEY = "technova_newsletter_signup";
const SHIFT_KEY = "technova_newsletter_time_shift_hours";

const sequence = [
  { title: "Welcome", delayHours: 0, subject: "Witamy w TechNova Market" },
  { title: "Poradnik", delayHours: 48, subject: "Jak wybrac sprzet pod Twoj budzet" },
  { title: "Oferta", delayHours: 120, subject: "Rabat 10% na pierwszy zakup" }
];

function getSignup() {
  const raw = localStorage.getItem(NEWS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getTimeShiftHours() {
  const value = Number(localStorage.getItem(SHIFT_KEY) || "0");
  return Number.isFinite(value) ? value : 0;
}

function renderAutomation() {
  const listEls = document.querySelectorAll("[data-automation-list]");
  if (!listEls.length) return;

  const signup = getSignup();
  if (!signup) {
    listEls.forEach((list) => {
      list.innerHTML = "<li>Zapisz adres e-mail, aby uruchomic automatyzacje.</li>";
    });
    return;
  }

  const now = new Date(Date.now() + getTimeShiftHours() * 60 * 60 * 1000);
  const signedAt = new Date(signup.signedAt);

  const rows = sequence.map((step) => {
    const planned = new Date(signedAt.getTime() + step.delayHours * 60 * 60 * 1000);
    const sent = now >= planned;
    const status = sent ? "Wyslano" : "Zaplanowano";
    const when = planned.toLocaleString("pl-PL");
    return `<li><strong>${step.title}</strong> - ${step.subject} - ${status} (${when})</li>`;
  });

  listEls.forEach((list) => {
    list.innerHTML = rows.join("");
  });
}

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = form.querySelector('input[name="email"]');
    const msg = form.parentElement.querySelector("[data-newsletter-msg]");
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) return;

    const payload = { email, signedAt: new Date().toISOString() };
    localStorage.setItem(NEWS_KEY, JSON.stringify(payload));
    localStorage.setItem(SHIFT_KEY, "0");
    emailInput.value = "";

    if (msg) {
      msg.textContent = "Zapisano. Uruchomiono automatyzacje: welcome, poradnik, oferta.";
    }

    renderAutomation();
  });
});

document.querySelectorAll("[data-automation-advance]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const signup = getSignup();
    if (!signup) return;
    const shift = getTimeShiftHours() + 48;
    localStorage.setItem(SHIFT_KEY, String(shift));
    renderAutomation();
  });
});

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const msg = document.querySelector("[data-contact-msg]");
    if (msg) {
      msg.textContent = "Dziekujemy. Formularz testowy zostal wyslany poprawnie.";
    }
    contactForm.reset();
  });
}

renderAutomation();
