/* Website forms: sponsor inquiry, call for papers, volunteer application, village proposal.
   Each <form data-form="..."> starts switched off (its fields are disabled) and this
   script switches it on when forms-config.js has an endpoint and today is inside the
   form's open dates. On submit it checks the answers, sends them to the Apps Script
   endpoint, which saves them to Notion, and shows a thank-you message. */
(function () {
  "use strict";
  var config = window.BSP_FORMS || { endpoint: "", forms: {} };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Today's date in Phoenix (Arizona has no daylight saving time) as YYYY-MM-DD */
  function phoenixToday() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      return get("year") + "-" + get("month") + "-" + get("day");
    } catch (e) {
      return new Date(Date.now() - 7 * 3600 * 1000).toISOString().slice(0, 10);
    }
  }
  function longDate(iso) {
    var d = new Date(iso + "T12:00:00Z");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  function formState(key) {
    var f = (config.forms && config.forms[key]) || {};
    var today = phoenixToday();
    if (f.opens && today < f.opens) return { open: false, text: "This form opens " + longDate(f.opens) + "." };
    if (f.closes && today > f.closes) return { open: false, text: "This form closed on " + longDate(f.closes) + "." };
    if (!config.endpoint) return { open: false, text: null };
    return { open: true };
  }

  function fieldWrap(el) { return el.closest(".field") || el.closest("fieldset"); }

  function setError(target, message) {
    var wrap = fieldWrap(target);
    if (!wrap) return;
    var err = wrap.querySelector(".field__error");
    var inputs = wrap.querySelectorAll("input, select, textarea");
    if (message) {
      err.textContent = message;
      err.hidden = false;
      inputs.forEach(function (i) { i.setAttribute("aria-invalid", "true"); });
    } else {
      err.textContent = "";
      err.hidden = true;
      inputs.forEach(function (i) { i.removeAttribute("aria-invalid"); });
    }
  }

  function labelText(wrap) {
    var l = wrap.querySelector(".field__label, legend");
    return l ? l.textContent.replace(/\(required\)/i, "").replace(/\*/g, "").trim() : "This field";
  }

  /* Returns a list of {el, message} for every problem in the form */
  function validate(form) {
    var problems = [];
    form.querySelectorAll(".field, fieldset.field").forEach(function (wrap) {
      if (wrap.closest("[hidden]")) return;
      var group = wrap.matches("fieldset") ? wrap : null;
      var name = labelText(wrap);
      if (group && group.hasAttribute("data-required")) {
        if (!group.querySelector("input:checked")) {
          problems.push({ el: group.querySelector("input"), message: group.getAttribute("data-required") || ("Choose at least one option for " + name.toLowerCase() + ".") });
        }
        return;
      }
      var input = wrap.querySelector("input, select, textarea");
      if (!input || input.type === "radio") return;
      var v = input.type === "checkbox" ? (input.checked ? "on" : "") : input.value.trim();
      if (input.required && !v) {
        problems.push({ el: input, message: input.getAttribute("data-required") || ("Enter " + name.toLowerCase() + ".") });
      } else if (v && input.type === "email" && !EMAIL.test(v)) {
        problems.push({ el: input, message: "Enter an email address like name@example.com." });
      } else if (v && input.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) {
        problems.push({ el: input, message: "Enter a web address starting with https://" });
      } else if (v && input.type === "number" && (isNaN(Number(v)) || Number(v) < Number(input.min || 0) || Number(v) > Number(input.max || 1e9))) {
        problems.push({ el: input, message: "Enter a number from " + (input.min || 0) + " to " + input.max + "." });
      }
    });
    return problems;
  }

  function showSummary(form, problems) {
    var box = form.querySelector(".form__errors");
    var list = box.querySelector("ul");
    list.textContent = "";
    problems.forEach(function (p) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + p.el.id;
      a.textContent = p.message;
      a.addEventListener("click", function (e) { e.preventDefault(); p.el.focus(); });
      li.appendChild(a);
      list.appendChild(li);
    });
    box.hidden = false;
    box.focus();
  }

  function clearErrors(form) {
    form.querySelectorAll(".field__error").forEach(function (e) { setError(e, null); });
    var box = form.querySelector(".form__errors");
    if (box) box.hidden = true;
  }

  function setupShowIf(form) {
    form.querySelectorAll("[data-show-if]").forEach(function (block) {
      var rule = block.getAttribute("data-show-if").split(":");
      var inputs = form.querySelectorAll('input[name="' + rule[0] + '"]');
      var update = function () {
        var on = Array.prototype.some.call(inputs, function (i) { return i.checked && i.value === rule[1]; });
        block.hidden = !on;
      };
      inputs.forEach(function (i) { i.addEventListener("change", update); });
      update();
    });
  }

  function init(form) {
    var key = form.getAttribute("data-form");
    var fields = form.querySelector("[data-form-fields]");
    var notice = form.parentNode.querySelector("[data-form-notice]");
    var status = form.querySelector(".form__status");
    var button = form.querySelector('button[type="submit"]');
    var started = Date.now();
    var state = formState(key);

    setupShowIf(form);
    if (!state.open) {
      if (state.text && notice) notice.querySelector("[data-notice-text]").textContent = state.text;
      return;
    }
    if (notice) notice.hidden = true;
    fields.disabled = false;
    form.action = config.endpoint;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);
      var problems = validate(form);
      if (problems.length) {
        problems.forEach(function (p) { setError(p.el, p.message); });
        showSummary(form, problems);
        return;
      }
      var body = new URLSearchParams(new FormData(form));
      body.set("form", key);
      body.set("ajax", "1");
      body.set("elapsed", String(Math.round((Date.now() - started) / 1000)));
      body.set("return_to", location.href.split("#")[0]);
      button.disabled = true;
      status.textContent = "Sending…";
      fetch(config.endpoint, { method: "POST", body: body })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error((res && res.error) || "failed");
          var done = form.parentNode.querySelector("[data-form-done]");
          form.hidden = true;
          done.hidden = false;
          done.focus();
        })
        .catch(function (err) {
          button.disabled = false;
          status.textContent = "";
          var box = form.querySelector(".form__errors");
          var list = box.querySelector("ul");
          list.textContent = "";
          var li = document.createElement("li");
          li.textContent = err && /closed|not open/.test(err.message)
            ? "This form isn't taking submissions right now."
            : "Your answers weren't sent. Check your connection and try again. Your answers are still here.";
          list.appendChild(li);
          box.hidden = false;
          box.focus();
        });
    });

    /* Clear a field's error as soon as it's fixed */
    form.addEventListener("change", function (e) {
      var wrap = fieldWrap(e.target);
      if (wrap && wrap.querySelector('[aria-invalid="true"]')) {
        var stillBad = validate(form).some(function (p) { return fieldWrap(p.el) === wrap; });
        if (!stillBad) setError(e.target, null);
      }
    });
  }

  function start() { document.querySelectorAll("form[data-form]").forEach(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
