/* Shared calculator for the spoke pages.
   Two modes, chosen with data-calc-mode on the <form>:
     "akademik" - each row has jumlah soal + jumlah benar -> nilai = benar/soal*100
     "bobot"    - each row has a nilai + a bobot (percent) -> weighted average
   Rows are marked data-calc-row; the page supplies the markup, this file only
   fills in the numbers, so the page is complete without JavaScript. */
(function () {
  "use strict";
  var form = document.querySelector("[data-calc-mode]");
  if (!form) return;
  var mode = form.getAttribute("data-calc-mode");
  var panel = document.getElementById("res-panel");
  var outMain = document.getElementById("res-main");
  var outSub = document.getElementById("res-sub");
  var verdict = document.getElementById("res-verdict");

  function num(el) {
    if (!el || el.value === "") return null;
    var v = Number(el.value);
    return isNaN(v) ? null : v;
  }

  function rows() {
    return Array.prototype.slice.call(form.querySelectorAll("[data-calc-row]"));
  }

  function visible(row) {
    // a jalur switch can hide rows that do not apply
    return !row.hasAttribute("hidden");
  }

  function update() {
    var jalur = form.querySelector('input[name="jalur"]:checked');
    if (jalur) {
      rows().forEach(function (row) {
        var only = row.getAttribute("data-only");
        if (only) row.toggleAttribute("hidden", only !== jalur.value);
      });
    }

    var live = rows().filter(visible);
    var total = 0, weightSum = 0, counted = 0, incomplete = false;

    live.forEach(function (row) {
      var score = row.querySelector("[data-calc-score]");
      var nilai = null;

      if (mode === "akademik") {
        var benar = num(row.querySelector("[data-calc-benar]"));
        var soal = num(row.querySelector("[data-calc-soal]"));
        if (benar !== null && soal) {
          nilai = Math.max(0, Math.min(100, Math.round((benar / soal) * 1000) / 10));
        }
      } else {
        nilai = num(row.querySelector("[data-calc-nilai]"));
        if (nilai !== null) nilai = Math.max(0, Math.min(100, nilai));
      }

      if (score) score.textContent = nilai === null ? "–" : String(nilai).replace(".", ",");
      if (nilai === null) { incomplete = true; return; }

      var w = 1;
      var wEl = row.querySelector("[data-calc-bobot]");
      if (wEl) {
        var wv = num(wEl);
        w = wv === null ? 0 : wv;
      }
      total += nilai * w;
      weightSum += w;
      counted++;
    });

    if (!counted || !weightSum) {
      panel.dataset.state = "empty";
      outMain.textContent = "–";
      outSub.textContent = "–";
      verdict.textContent = "Isi semua baris untuk melihat nilai akhir.";
      return;
    }

    var avg = Math.round((total / weightSum) * 100) / 100;
    outMain.textContent = String(avg).replace(".", ",");
    outSub.textContent = mode === "akademik"
      ? counted + " mata uji"
      : Math.round(weightSum) + "%";
    panel.dataset.state = incomplete ? "partial" : "done";
    verdict.textContent = incomplete
      ? "Nilai sementara dari baris yang sudah diisi. Lengkapi sisanya untuk hasil penuh."
      : (mode === "akademik"
          ? "Nilai akademik rata-rata dari seluruh mata uji."
          : "Nilai akhir tertimbang dari seluruh tahapan yang Anda isi.");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  var reset = document.getElementById("calc-reset");
  if (reset) reset.addEventListener("click", function () { form.reset(); update(); });
  update();
})();
