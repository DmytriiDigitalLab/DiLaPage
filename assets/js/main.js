/* DiLa — Digital Lab · main.js
 * Bez zależności. Strona działa także bez JS (treść, formularz kontaktowy przez e-mail bezpośredni).
 */

/* ======================================================================
   KONFIGURACJA — jedno miejsce do podmiany danych kontaktowych.
   Wartości w HTML są tylko zapasowe (dla wyłączonego JS); po zmianie tutaj
   warto je też podmienić w index.html i polityka-prywatnosci.html.
   ====================================================================== */
const CONFIG = {
  name: "Dmytro Honcharov",                 // TODO: sprawdzić pisownię imienia i nazwiska
  email: "kontakt@twojadomena.pl",          // TODO: adres na własnej domenie
  phone: "+48 000 000 000",                 // TODO
  linkedin: "https://www.linkedin.com/",    // TODO: link do profilu
  nip: "0000000000",                        // TODO
  bookingUrl: ""                            // opcjonalnie: link do Calendly / Cal.com / Google Calendar
};

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dane z konfiguracji ---------- */
  $$('[data-cfg]').forEach((el) => {
    const key = el.dataset.cfg;
    const val = CONFIG[key];
    if (!val) return;
    const label = el.querySelector("span") || el;
    if (key === "email") { el.setAttribute("href", "mailto:" + val); label.textContent = val; }
    else if (key === "phone") { el.setAttribute("href", "tel:" + val.replace(/\s+/g, "")); label.textContent = val; }
    else if (key === "linkedin") { el.setAttribute("href", val); }
    else { el.textContent = val; }
  });
  if (CONFIG.bookingUrl) {
    $$('a[href="#kontakt"]').forEach((a) => { a.href = CONFIG.bookingUrl; a.target = "_blank"; a.rel = "noopener"; });
  }
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: tło po przewinięciu ---------- */
  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobilne ---------- */
  const toggle = $(".nav-toggle");
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* ---------- Pojawianie się sekcji ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Demo na żywo ---------- */
  const SCENARIOS = [
    {
      avatar: "MK", from: "Marta Kowalczyk · Agencja eventowa", meta: "dziś, 08:12", lang: "PL",
      subject: "Wycena — torby bawełniane z logo",
      text: "Dzień dobry, potrzebujemy 500 toreb bawełnianych z nadrukiem logo (1 kolor) na konferencję 12 marca. Ile to będzie kosztować i czy zdążycie?",
      steps: [
        ["Rozpoznano", 'Zapytanie o wycenę · <span class="num">500 szt.</span> · termin 12.03'],
        ["Cena z cennika", '<span class="num">2&nbsp;450,00 zł</span> netto (4,90 zł/szt.)'],
        ["Termin", 'Realizacja 7 dni roboczych — <span class="num">zdążymy</span>'],
        ["Odpowiedź", "Szkic po polsku gotowy w skrzynce"],
        ["CRM", "Utworzono szansę „Torby 500 szt.”"]
      ],
      time: 28, human: "<b>Twoja decyzja:</b> sprawdź szkic i wyślij", warn: -1
    },
    {
      avatar: "JW", from: "Jonas Weber · Eventagentur, Berlin", meta: "dziś, 09:03", lang: "DE",
      subject: "Anfrage: 1.000 Silikonarmbänder mit Logo",
      text: "Guten Tag, wir benötigen 1.000 Silikonarmbänder mit unserem Logo (einfarbig), Lieferung nach Berlin. Was würde das kosten?",
      steps: [
        ["Rozpoznano", 'Zapytanie o wycenę · <span class="num">DE</span> · 1000 szt.'],
        ["Cena z cennika", '<span class="num">2&nbsp;050,00 zł</span> netto (2,05 zł/szt.)'],
        ["Dostawa", '<span class="num">Do handlowca:</span> koszt wysyłki do Niemiec, VAT-UE'],
        ["Odpowiedź", "Szkic po niemiecku — bez ceny dostawy"],
        ["CRM", "Utworzono szansę „Armbänder 1000 — Berlin”"]
      ],
      time: 34, human: "<b>Oznaczono dla handlowca:</b> uzupełnij dostawę", warn: 2
    }
  ];

  const demo = $("#demo");
  if (demo) {
    const el = {
      avatar: $("#demo-avatar"), from: $("#demo-from"), meta: $("#demo-meta"), lang: $("#demo-lang"),
      subject: $("#demo-subject"), text: $("#demo-text"), steps: $("#demo-steps"), time: $("#demo-time"),
      human: $("#demo-human"), mail: $("#demo-mail")
    };
    const dots = $$("#demo-switch button");
    let current = 0, timers = [], visible = true, paused = false;

    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

    function render(i, finalState) {
      const s = SCENARIOS[i];
      el.avatar.textContent = s.avatar; el.from.textContent = s.from; el.meta.textContent = s.meta;
      el.lang.textContent = s.lang; el.subject.textContent = s.subject; el.text.textContent = s.text;
      el.human.innerHTML = s.human;
      el.steps.innerHTML = s.steps.map((st, k) =>
        `<li class="step-live${k === s.warn ? " is-warn" : ""}${finalState ? " is-done" : ""}"><span class="step-live__icon"></span><span><span class="step-live__k">${st[0]}</span><br><span class="step-live__v">${st[1]}</span></span></li>`
      ).join("");
      el.time.textContent = finalState ? fmt(s.time) : "0:00";
      demo.classList.toggle("is-ready", !!finalState);
      dots.forEach((d, k) => d.setAttribute("aria-pressed", String(k === i)));
    }

    function play(i) {
      clear();
      current = i;
      if (reduceMotion) { render(i, true); return; }
      const s = SCENARIOS[i];
      el.mail.style.opacity = "0"; el.mail.style.transform = "translateY(8px)";
      render(i, false);
      later(() => { el.mail.style.opacity = "1"; el.mail.style.transform = "none"; }, 120);

      const items = $$(".step-live", el.steps);
      const start = 900, stepMs = 900;
      // licznik czasu: symulowane sekundy rozłożone na całą animację
      const total = start + items.length * stepMs;
      const ticks = s.time;
      for (let t = 1; t <= ticks; t++) later(() => { el.time.textContent = fmt(t); }, start + (total - start) * (t / ticks));

      items.forEach((item, k) => {
        later(() => item.classList.add("is-active"), start + k * stepMs);
        later(() => { item.classList.remove("is-active"); item.classList.add("is-done"); }, start + k * stepMs + stepMs * 0.8);
      });
      later(() => demo.classList.add("is-ready"), total + 100);
      later(() => { if (!paused && visible) play((current + 1) % SCENARIOS.length); }, total + 4800);
    }

    dots.forEach((d, k) => d.addEventListener("click", () => play(k)));
    demo.addEventListener("mouseenter", () => { paused = true; });
    demo.addEventListener("mouseleave", () => {
      paused = false;
      if (demo.classList.contains("is-ready")) { clear(); later(() => play((current + 1) % SCENARIOS.length), 2500); }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          const was = visible; visible = en.isIntersecting;
          if (visible && !was) play(current);
          if (!visible) clear();
        });
      }, { threshold: 0.2 }).observe(demo);
    }
    play(0);
  }

  /* ---------- Kalkulator ---------- */
  const calc = $("#calc");
  if (calc) {
    const q = $("#c-q"), m = $("#c-m"), r = $("#c-r");
    const nf = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
    const nf1 = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    const DAYS = 21, FTE = 168, SHARE = 0.6;
    const paint = (input) => {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty("--pct", pct + "%");
    };
    function update() {
      [q, m, r].forEach(paint);
      const hours = (q.value * m.value * DAYS) / 60;
      const cost = hours * r.value;
      $("#o-q").textContent = q.value;
      $("#o-m").textContent = m.value + " min";
      $("#o-r").textContent = r.value + " zł";
      $("#r-hours").textContent = nf.format(hours);
      $("#r-cost").textContent = nf.format(cost) + " zł";
      $("#r-fte").textContent = nf1.format(hours / FTE);
      $("#r-shours").textContent = nf.format(hours * SHARE) + " h";
      $("#r-scost").textContent = nf.format(cost * SHARE) + " zł";
    }
    [q, m, r].forEach((i) => i.addEventListener("input", update));
    update();
  }

  /* ---------- Formularz → e-mail ----------
     Strona statyczna nie ma serwera, więc formularz składa wiadomość i otwiera program pocztowy.
     Aby zbierać zgłoszenia bez programu pocztowego, podłącz np. Formspree / Netlify Forms (patrz README). */
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = $("#form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const v = (id) => ($("#" + id).value || "").trim();
      const subject = `Rozmowa o automatyzacji — ${v("f-company")}`;
      const body = [
        `Imię i nazwisko: ${v("f-name")}`,
        `Firma: ${v("f-company")}`,
        `E-mail: ${v("f-email")}`,
        `Telefon: ${v("f-phone") || "—"}`,
        `Osób w zespole: ${v("f-volume")}`,
        "",
        "Co zajmuje najwięcej czasu:",
        v("f-msg") || "—"
      ].join("\n");
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = `Otwieramy Twój program pocztowy. Jeśli nic się nie stało, napisz bezpośrednio na ${CONFIG.email}.`;
      status.classList.add("is-visible");
    });
  }
})();
