const DEFAULT_GA_ID = "G-XXXXXXXXXX";
const DEFAULT_CLARITY_ID = "xxxxxxxxxx";
const analyticsConfig = window.TECHNOVA_ANALYTICS || {};
const GA_MEASUREMENT_ID = (analyticsConfig.gaMeasurementId || "").trim();
const CLARITY_PROJECT_ID = (analyticsConfig.clarityProjectId || "").trim();

let gaReady = false;
let clarityReady = false;

function initGa4() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === DEFAULT_GA_ID) return;
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
  gaReady = true;
}

function initClarity() {
  if (!CLARITY_PROJECT_ID || CLARITY_PROJECT_ID === DEFAULT_CLARITY_ID) return;
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
  clarityReady = true;
}

function trackEvent(eventName, params) {
  if (gaReady && typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
  if (clarityReady && typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}

initGa4();
initClarity();
if (!gaReady || !clarityReady) {
  console.warn("Uzupelnij analytics-config.js, aby aktywowac GA4 i Clarity.");
}

const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");

if (nav && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    trackEvent("menu_toggle", { open: isOpen });
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

if ("IntersectionObserver" in window) {
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
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

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
  let raw = null;
  try {
    raw = localStorage.getItem(NEWS_KEY);
  } catch {
    raw = null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getTimeShiftHours() {
  let rawValue = "0";
  try {
    rawValue = localStorage.getItem(SHIFT_KEY) || "0";
  } catch {
    rawValue = "0";
  }
  const value = Number(rawValue);
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
    try {
      localStorage.setItem(NEWS_KEY, JSON.stringify(payload));
      localStorage.setItem(SHIFT_KEY, "0");
    } catch {
      if (msg) {
        msg.textContent = "Nie udalo sie zapisac danych lokalnie. Sprawdz ustawienia przegladarki.";
      }
      return;
    }
    emailInput.value = "";

    if (msg) {
      msg.textContent = "Zapisano. Uruchomiono automatyzacje: welcome, poradnik, oferta.";
    }

    trackEvent("newsletter_signup", { form: "newsletter", page });
    renderAutomation();
  });
});

document.querySelectorAll("[data-automation-advance]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const signup = getSignup();
    if (!signup) return;
    const shift = getTimeShiftHours() + 48;
    try {
      localStorage.setItem(SHIFT_KEY, String(shift));
    } catch {
      return;
    }
    trackEvent("automation_advance_48h", { shift_hours: shift, page });
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
    trackEvent("contact_form_submit", { form: "contact" });
    contactForm.reset();
  });
}

renderAutomation();
