/* DiLa — Digital Lab · i18n.js
 * Wybór języka (pl / en / uk / ru). Polski jest w samym HTML (działa bez JS i dla robotów),
 * pozostałe języki to słowniki w assets/i18n/<kod>.js, ładowane dopiero na żądanie.
 *
 * Znaczniki w HTML:
 *   data-i18n="klucz"                       → podmienia innerHTML (tekst może zawierać <b>, <em>, <a>…)
 *   data-i18n-attr="aria-label:klucz;..."   → podmienia atrybuty
 *   data-keeplang                           → link wewnętrzny dostaje ?lang=xx (gdy localStorage jest zablokowany)
 *   data-lang="xx" (przyciski)              → przełącznik języka
 * Brak klucza w słowniku → zostaje tekst polski (+ ostrzeżenie w konsoli).
 * Dodanie języka: nowy plik assets/i18n/<kod>.js, wpis w LANGS i przycisk w nagłówku.
 */
(function () {
  "use strict";
  var LANGS = {
    pl: { locale: "pl-PL", og: "pl_PL" },
    en: { locale: "en-GB", og: "en_GB" },
    uk: { locale: "uk-UA", og: "uk_UA" },
    ru: { locale: "ru-RU", og: "ru_RU" }
  };
  var KEY = "dila-lang";
  var root = document.documentElement;
  var dicts = (window.DILA_I18N = window.DILA_I18N || {});
  var current = "pl";
  var seq = 0; // chroni przed wyścigiem przy szybkim klikaniu

  function readStore() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function writeStore(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* tryb prywatny — trudno */ } }
  function fromUrl() { try { return new URLSearchParams(location.search).get("lang"); } catch (e) { return null; } }
  function valid(l) { return typeof l === "string" && Object.prototype.hasOwnProperty.call(LANGS, l); }

  /* Oryginalne (polskie) wartości zapamiętujemy przy pierwszym przejściu. */
  var nodes = [];
  function collect() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n],[data-i18n-attr]"), function (el) {
      var n = { el: el };
      if (el.hasAttribute("data-i18n")) {
        n.key = el.getAttribute("data-i18n");
        n.pl = el.tagName === "TITLE" ? el.textContent : el.innerHTML;
      }
      if (el.hasAttribute("data-i18n-attr")) {
        n.attrs = el.getAttribute("data-i18n-attr").split(";").map(function (p) {
          var i = p.indexOf(":");
          var name = p.slice(0, i).trim();
          return { name: name, key: p.slice(i + 1).trim(), pl: el.getAttribute(name) };
        });
      }
      nodes.push(n);
    });
  }

  function t(key, fallback) {
    var d = dicts[current];
    if (current !== "pl" && d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    return fallback;
  }

  function apply(lang) {
    var d = lang === "pl" ? null : dicts[lang];
    var missing = [];
    nodes.forEach(function (n) {
      if (n.key) {
        var v = d && Object.prototype.hasOwnProperty.call(d, n.key) ? d[n.key] : n.pl;
        if (d && v === n.pl && !Object.prototype.hasOwnProperty.call(d, n.key)) missing.push(n.key);
        if (n.el.tagName === "TITLE") n.el.textContent = v; else n.el.innerHTML = v;
        if (n.el.hasAttribute("data-i18n-optional")) n.el.hidden = !v; // element bez polskiego tekstu pokazujemy tylko w innych językach
      }
      if (n.attrs) n.attrs.forEach(function (a) {
        var v = d && Object.prototype.hasOwnProperty.call(d, a.key) ? d[a.key] : a.pl;
        if (d && !Object.prototype.hasOwnProperty.call(d, a.key)) missing.push(a.key);
        if (v != null) n.el.setAttribute(a.name, v);
      });
    });
    if (missing.length && window.console) console.warn("[i18n:" + lang + "] brak tłumaczeń: " + missing.join(", "));

    current = lang;
    root.setAttribute("lang", lang);
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute("content", LANGS[lang].og);
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    Array.prototype.forEach.call(document.querySelectorAll("a[data-keeplang]"), function (a) {
      var href = a.getAttribute("href");
      var h = href.indexOf("#"), hash = h >= 0 ? href.slice(h) : "";
      var base = (h >= 0 ? href.slice(0, h) : href).split("?")[0];
      a.setAttribute("href", base + (lang === "pl" ? "" : "?lang=" + lang) + hash);
    });
    api.lang = lang;
    api.locale = LANGS[lang].locale;
    root.classList.remove("i18n-pending");
    document.dispatchEvent(new CustomEvent("dila:lang", { detail: { lang: lang } }));
  }

  function load(lang, done) {
    if (lang === "pl" || dicts[lang]) { done(true); return; }
    var s = document.createElement("script");
    s.src = (api.base || "assets/i18n/") + lang + ".js";
    s.onload = function () { done(!!dicts[lang]); };
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }

  function set(lang, persist) {
    if (!valid(lang)) lang = "pl";
    var my = ++seq;
    load(lang, function (ok) {
      if (my !== seq) return;
      if (!ok) lang = "pl"; // słownik się nie wczytał — zostaje polski
      if (persist) writeStore(lang);
      apply(lang);
    });
  }

  var api = { lang: "pl", locale: "pl-PL", t: t, set: set, base: "assets/i18n/" };
  window.DILA = api;

  collect();
  Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) {
    b.addEventListener("click", function () { set(b.getAttribute("data-lang"), true); });
  });

  var q = fromUrl();
  var start = valid(q) ? q : (valid(readStore()) ? readStore() : "pl");
  if (valid(q)) writeStore(q);
  set(start, false);
})();
