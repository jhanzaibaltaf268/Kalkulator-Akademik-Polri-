/* Kalkulator jasmani Polri — UI only. The scoring itself lives in
   nilai-data.js, which is generated from _partials/nilai_anchors.json.
   The form is in the HTML, so the page is complete without this file;
   this only fills in the numbers. */
(function () {
  "use strict";
  var N = window.NilaiPolri;
  var form = document.getElementById("calc-form");
  if (!N || !form) return;

  var KEYS = ["lari", "pullup", "situp", "pushup", "shuttle", "renang"];
  var out = {
    a: document.getElementById("res-a"),
    b: document.getElementById("res-b"),
    nkj: document.getElementById("res-nkj"),
    band: document.getElementById("res-band"),
    verdict: document.getElementById("res-verdict"),
    note: document.getElementById("res-note"),
    panel: document.getElementById("res-panel")
  };
  var renangToggle = document.getElementById("calc-renang-toggle");
  var pullLabel = document.getElementById("label-pullup");

  function gender() {
    var r = form.querySelector('input[name="jk"]:checked');
    return r ? r.value : "pria";
  }

  function fmt(n) {
    return n === null || n === undefined ? "–" : String(n).replace(".", ",");
  }

  function update() {
    var g = gender();
    var input = {};
    KEYS.forEach(function (k) {
      var el = document.getElementById("in-" + k);
      input[k] = el && el.value !== "" ? Number(el.value) : null;
    });

    // the arm-strength item changes name with the candidate
    if (pullLabel) {
      pullLabel.textContent = g === "pria"
        ? "Pull up (1 menit)" : "Chinning (1 menit)";
    }

    var r = N.hitung(g, input, renangToggle && renangToggle.checked);

    KEYS.forEach(function (k) {
      var cell = document.getElementById("nilai-" + k);
      if (!cell) return;
      var v = r.items[k];
      cell.textContent = v === null ? "–" : v;
      cell.classList.toggle("is-zero", v === 0);
      cell.classList.toggle("is-set", v !== null && v > 0);
    });

    out.a.textContent = fmt(r.nilaiA);
    out.b.textContent = fmt(r.nilaiB);
    out.nkj.textContent = fmt(r.nkj);
    out.band.textContent = r.band || "–";

    if (r.nkj === null) {
      out.panel.dataset.state = "empty";
      out.verdict.textContent = "Lengkapi lari 12 menit dan keempat item kesamaptaan B untuk melihat nilai akhir.";
      out.note.textContent = "";
      return;
    }
    if (r.gugur.length) {
      out.panel.dataset.state = "fail";
      out.verdict.textContent = "Tidak memenuhi syarat";
      out.note.textContent = "Ada item bernilai 0: " + r.gugur.join(", ") +
        ". Satu item bernilai 0 menggugurkan keseluruhan, berapa pun nilai akhirnya.";
      return;
    }
    out.panel.dataset.state = r.lulus ? "pass" : "fail";
    out.verdict.textContent = r.lulus ? "Memenuhi syarat" : "Tidak memenuhi syarat";
    out.note.textContent = r.lulus
      ? "Nilai akhir " + fmt(r.nkj) + " berada di atas nilai batas lulus " + N.nbl + "."
      : "Nilai akhir " + fmt(r.nkj) + " masih di bawah nilai batas lulus " + N.nbl + ".";
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); update(); });

  var reset = document.getElementById("calc-reset");
  if (reset) {
    reset.addEventListener("click", function () {
      form.reset();
      update();
    });
  }

  // the form is usable without JS; only reveal the live result panel once
  // the script has actually run
  document.getElementById("calc-root").classList.add("calc-ready");
  update();
})();
