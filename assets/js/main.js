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
  /* Teksty zależne od języka: słownik z assets/i18n/<kod>.js, a gdy go brak — polski domyślnik z tego pliku. */
  const t = (key, fallback) => (window.DILA ? window.DILA.t(key, fallback) : fallback);
  const locale = () => (window.DILA ? window.DILA.locale : "pl-PL");

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
  /* Pola scenariusza: title (pasek okna), avatar/from/meta/lang/subject/text (karta wejścia),
     steps (kroki), time (sekundy), human (stopka), btn (etykieta przycisku),
     auto: true = AI wykonał wszystko sam (stopka „zrobione”), false = czeka na człowieka,
     warn: indeks kroku wyróżnionego ostrzeżeniem (-1 = brak). Dla en/uk/ru te same pola w słownikach. */
  const SCENARIOS_PL = [
    {
      title: "skrzynka / zapytania",
      avatar: "OG", from: "Oliver Grant · Street Food Fest, Kraków", meta: "dziś, 07:41", lang: "EN",
      subject: "Tote bags for our festival: is this doable?",
      text: "Hi! We're running a street food festival in Kraków on 14 June and need about 400 tote bags with our logo. Problem: all we have is a phone photo of an old sticker. Our budget is 2,000 PLN net and we need everything a few days before. Can you make this work?",
      steps: [
        ["Rozpoznano", 'Zapytanie o wycenę · <span class="num">EN</span> · ~400 szt. · budżet 2&nbsp;000 zł'],
        ["Nietypowy przypadek", "Logo tylko ze zdjęcia: czytelne, druk 1 kolor możliwy po wektoryzacji"],
        ["Cena z cennika", '400 szt. = <span class="num">2&nbsp;080 zł</span>, ponad budżet. 380 szt. = <span class="num">1&nbsp;976 zł</span>'],
        ["Termin", 'Realizacja 7 dni roboczych — <span class="num">zdążymy</span> z zapasem przed 14.06'],
        ["Odpowiedź", "Wysłana po angielsku: wariant 380 szt. w budżecie, wektoryzacja logo w cenie"],
        ["CRM", "Utworzono szansę „Street Food Fest — torby”"]
      ],
      time: 41, human: "<b>Wysłano automatycznie</b> · kwota poniżej limitu autoodpowiedzi (5&nbsp;000 zł)", btn: "Wysłano", auto: true, warn: -1
    },
    {
      title: "skrzynka / zapytania",
      avatar: "JW", from: "Jonas Weber · Eventagentur, Berlin", meta: "dziś, 09:03", lang: "DE",
      subject: "Anfrage: 5.000 Silikonarmbänder mit Logo",
      text: "Guten Tag, für unser Firmenevent im Mai benötigen wir 5.000 Silikonarmbänder mit unserem Logo in zwei Farben, Lieferung nach Berlin. Können Sie uns ein Angebot machen?",
      steps: [
        ["Rozpoznano", 'Zapytanie o wycenę · <span class="num">DE</span> · 5000 szt. · 2 kolory'],
        ["Cena z cennika", '<span class="num">9&nbsp;400,00 zł</span> netto (1,88 zł/szt.)'],
        ["Limit autoodpowiedzi", '<span class="num">Powyżej limitu 5&nbsp;000 zł</span> — pełna obsługa zamiast wysyłki'],
        ["Doprecyzowanie", "Zapytał klienta o Pantone, adres dostawy i termin próbki — odpowiedzi zebrane"],
        ["Odpowiedź", "Kompletna oferta po niemiecku gotowa do wysłania"],
        ["CRM", "Szansa „Armbänder 5000 — Berlin” z notatkami i danymi od klienta"]
      ],
      time: 63, human: "<b>Powyżej limitu:</b> sprawdź ofertę i wyślij", btn: "Wyślij", auto: false, warn: 2
    },
    {
      title: "zamówienia / realizacja",
      avatar: "AL", from: "Allegro · nowe zamówienie #4817", meta: "dziś, 10:26", lang: "AUTO",
      subject: "2× bluza z haftem logo, rozmiary M i L",
      text: "Płatność potwierdzona. Dostawa: InPost Paczkomat. W wiadomości do zamówienia klient prosi o dodatkowy haft imienia „Kasia” na jednej z bluz.",
      steps: [
        ["Rozpoznano", 'Zamówienie opłacone · 2 pozycje · <span class="num">1 personalizacja</span>'],
        ["Zlecenie produkcyjne", "Utworzone dla hafciarni: plik haftu z imieniem, termin 3 dni"],
        ["Faktura", "Wystawiona w Fakturowni i wysłana do klienta"],
        ["Wysyłka", "Paczka InPost zaplanowana po zakończeniu haftu, numer śledzenia zapisany"],
        ["Allegro", "Status zamówienia i numer śledzenia zaktualizowane"]
      ],
      time: 19, human: "<b>Bez Twojej interwencji.</b> Wyjątki trafiają do kolejki", btn: "Zrealizowano", auto: true, warn: -1
    },
    {
      title: "linia / kontrola jakości",
      avatar: "KJ", from: "Linia pakowania · partia B-221", meta: "dziś, 13:15", lang: "AUTO",
      subject: "Kubki z nadrukiem, 300 szt.",
      text: "Zdjęcia kontrolne z linii: próbka 12 sztuk. Wzór zatwierdzony przez klienta, tolerancja położenia nadruku: 1 mm.",
      steps: [
        ["Odebrano", '12 zdjęć próbki · partia <span class="num">300 szt.</span>'],
        ["Porównanie", "Ze wzorem klienta: kolor, położenie, ostrość nadruku"],
        ["Odchyłka", '<span class="num">2 z 12</span> sztuk: nadruk przesunięty o 3 mm (tolerancja 1 mm)'],
        ["Zgodnie z progiem", "Próg: więcej niż 1 odchyłka w próbce — partia wstrzymana"],
        ["Powiadomienie", "Kierownik zmiany dostał zdjęcia z zaznaczoną odchyłką"]
      ],
      time: 23, human: "<b>Wstrzymano zgodnie z Twoim progiem:</b> sprawdź zdjęcia i zdecyduj", btn: "Zwolnij partię", auto: false, warn: 2
    }
  ];

  const scenarios = () => t("demo", SCENARIOS_PL);

  const demo = $("#demo");
  if (demo) {
    const el = {
      avatar: $("#demo-avatar"), from: $("#demo-from"), meta: $("#demo-meta"), lang: $("#demo-lang"),
      subject: $("#demo-subject"), text: $("#demo-text"), steps: $("#demo-steps"), time: $("#demo-time"),
      human: $("#demo-human"), mail: $("#demo-mail"), title: $("#demo-title"), btn: $("#demo-btn")
    };
    const dots = $$("#demo-switch button");
    const HOLD_MS = 9600; // jak długo gotowy przykład wisi przed przejściem do następnego (było 4800)
    let current = 0, timers = [], visible = true, paused = false;

    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

    function render(i, finalState) {
      const s = scenarios()[i];
      el.avatar.textContent = s.avatar; el.from.textContent = s.from; el.meta.textContent = s.meta;
      el.lang.textContent = s.lang; el.subject.textContent = s.subject; el.text.textContent = s.text;
      el.human.innerHTML = s.human;
      el.title.textContent = s.title; el.btn.textContent = s.btn;
      demo.classList.toggle("is-auto", !!s.auto);
      el.steps.innerHTML = s.steps.map((st, k) =>
        `<li class="step-live${k === s.warn ? " is-warn" : ""}${finalState ? " is-done" : ""}"><span class="step-live__icon"></span><span><span class="step-live__k">${st[0]}</span><br><span class="step-live__v">${st[1]}</span></span></li>`
      ).join("");
      el.time.textContent = finalState ? fmt(s.time) : "0:00";
      demo.classList.toggle("is-ready", !!finalState);
      dots.forEach((d, k) => d.setAttribute("aria-pressed", String(k === i)));
    }

    /* Rezerwuje wysokość pod najwyższy przykład, żeby przy zmianie przykładu strona się nie przesuwała.
       Mierzy każdy scenariusz w bieżącym języku i szerokości okna; wołać przed play(). */
    function reserve() {
      demo.style.minHeight = "";
      let max = 0;
      for (let k = 0; k < scenarios().length; k++) {
        render(k, false);
        max = Math.max(max, demo.offsetHeight);
      }
      demo.style.minHeight = max + "px";
    }

    function play(i) {
      clear();
      current = i;
      if (reduceMotion) { render(i, true); return; }
      const s = scenarios()[i];
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
      later(() => { if (!paused && visible) play((current + 1) % scenarios().length); }, total + HOLD_MS);
    }

    dots.forEach((d, k) => d.addEventListener("click", () => play(k)));
    demo.addEventListener("mouseenter", () => { paused = true; });
    demo.addEventListener("mouseleave", () => {
      paused = false;
      if (demo.classList.contains("is-ready")) { clear(); later(() => play((current + 1) % scenarios().length), 2500); }
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
    document.addEventListener("dila:lang", () => { reserve(); play(current); });
    let rz, lastW = window.innerWidth; // zmiana szerokości okna zmienia zawijanie tekstu, więc wysokość liczymy od nowa (tylko przy zmianie szerokości, nie paska adresu na telefonie)
    window.addEventListener("resize", () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(rz); rz = setTimeout(() => { reserve(); play(current); }, 250);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { reserve(); play(current); });
    reserve();
    play(0);
  }

  /* ---------- Kalkulator ---------- */
  const calc = $("#calc");
  if (calc) {
    const q = $("#c-q"), m = $("#c-m"), r = $("#c-r");
    const DAYS = 21, FTE = 168, SHARE = 0.6;
    const paint = (input) => {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty("--pct", pct + "%");
    };
    function update() {
      const nf = new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 });
      const nf1 = new Intl.NumberFormat(locale(), { maximumFractionDigits: 1, minimumFractionDigits: 1 });
      [q, m, r].forEach(paint);
      const hours = (q.value * m.value * DAYS) / 60;
      const cost = hours * r.value;
      $("#o-q").textContent = q.value;
      $("#o-m").textContent = m.value + " " + t("calc.min", "min");
      $("#o-r").textContent = r.value + " zł";
      $("#r-hours").textContent = nf.format(hours);
      $("#r-cost").textContent = nf.format(cost) + " zł";
      $("#r-fte").textContent = nf1.format(hours / FTE);
      $("#r-shours").textContent = nf.format(hours * SHARE) + " " + t("calc.h", "h");
      $("#r-scost").textContent = nf.format(cost * SHARE) + " zł";
    }
    [q, m, r].forEach((i) => i.addEventListener("input", update));
    document.addEventListener("dila:lang", update); // teksty z #r-cost itd. wróciły do HTML — przelicz od nowa
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
      const subject = `${t("form.subject", "Rozmowa o automatyzacji")} — ${v("f-company")}`;
      const body = [
        `${t("form.name", "Imię i nazwisko")}: ${v("f-name")}`,
        `${t("form.company", "Firma")}: ${v("f-company")}`,
        `E-mail: ${v("f-email")}`,
        `${t("form.phone", "Telefon")}: ${v("f-phone") || "—"}`,
        `${t("form.team", "Osób w zespole")}: ${v("f-volume")}`,
        "",
        t("form.msg", "Co zajmuje najwięcej czasu:"),
        v("f-msg") || "—"
      ].join("\n");
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = t("form.status", "Otwieramy Twój program pocztowy. Jeśli nic się nie stało, napisz bezpośrednio na {email}.").replace("{email}", CONFIG.email);
      status.classList.add("is-visible");
    });
  }
})();
