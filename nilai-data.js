// GENERATED FILE - do not edit. Source: _partials/nilai_anchors.json
// Regenerate with: python3 _partials/gen_nilai.py
(function (global) {
  "use strict";
  var ANCHORS = {
    "lari": {
      "pria": {
        "at100": 3444,
        "at0": 1328
      },
      "wanita": {
        "at100": 3095,
        "at0": 978
      }
    },
    "pullup": {
      "pria": {
        "at100": 17,
        "at0": 0
      },
      "wanita": {
        "at100": 72,
        "at0": 0
      }
    },
    "situp": {
      "pria": {
        "at100": 40,
        "at0": 5
      },
      "wanita": {
        "at100": 50,
        "at0": 16
      }
    },
    "pushup": {
      "pria": {
        "at100": 42,
        "at0": 5
      },
      "wanita": {
        "at100": 37,
        "at0": 5
      }
    },
    "shuttle": {
      "pria": {
        "at100": 16.2,
        "at0": 21.69
      },
      "wanita": {
        "at100": 17.6,
        "at0": 27.5
      }
    },
    "renang": {
      "pria": {
        "at100": 14,
        "at0": 40
      },
      "wanita": {
        "at100": 20,
        "at0": 50
      }
    }
  };
  var META = {
    "lari": {
      "label": "Lari 12 menit",
      "unit": "meter",
      "group": "A",
      "direction": "higher",
      "step": 50
    },
    "pullup": {
      "label": "Pull up / chinning",
      "unit": "kali",
      "group": "B",
      "direction": "higher",
      "step": 1
    },
    "situp": {
      "label": "Sit up (1 menit)",
      "unit": "kali",
      "group": "B",
      "direction": "higher",
      "step": 1
    },
    "pushup": {
      "label": "Push up (1 menit)",
      "unit": "kali",
      "group": "B",
      "direction": "higher",
      "step": 1
    },
    "shuttle": {
      "label": "Shuttle run 6 x 10 m",
      "unit": "detik",
      "group": "B",
      "direction": "lower",
      "step": 0.1
    },
    "renang": {
      "label": "Renang 25 m",
      "unit": "detik",
      "group": "R",
      "direction": "lower",
      "step": 0.5
    }
  };
  var BANDS = [
    {
      "min": 81,
      "max": 100,
      "label": "Baik sekali"
    },
    {
      "min": 61,
      "max": 80,
      "label": "Baik"
    },
    {
      "min": 41,
      "max": 60,
      "label": "Sedang"
    },
    {
      "min": 31,
      "max": 40,
      "label": "Kurang"
    },
    {
      "min": 0,
      "max": 30,
      "label": "Kurang sekali"
    }
  ];
  var NBL = 41;

  // One item: raw result -> nilai 0..100, linear between the published anchors.
  function nilaiItem(key, gender, value) {
    var a = ANCHORS[key] && ANCHORS[key][gender];
    if (!a || value === null || value === "" || isNaN(value)) return null;
    var span = a.at100 - a.at0;
    if (span === 0) return null;
    var n = ((Number(value) - a.at0) / span) * 100;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function band(nilai) {
    for (var i = 0; i < BANDS.length; i++) {
      if (nilai >= BANDS[i].min && nilai <= BANDS[i].max) return BANDS[i].label;
    }
    return "";
  }

  // Nilai A = lari. Nilai B = average of the four kesamaptaan B items.
  // NKJ = (A + B) / 2. Renang is reported separately and only folded in
  // when the caller asks for it, because not every intake scores it.
  function hitung(gender, input, includeRenang) {
    var out = { items: {}, nilaiA: null, nilaiB: null, nkj: null,
                renang: null, band: "", lulus: null, gugur: [] };
    Object.keys(META).forEach(function (k) {
      out.items[k] = nilaiItem(k, gender, input[k]);
    });
    out.nilaiA = out.items.lari;
    var bKeys = ["pullup", "situp", "pushup", "shuttle"];
    var got = bKeys.filter(function (k) { return out.items[k] !== null; });
    if (got.length === bKeys.length) {
      out.nilaiB = Math.round(bKeys.reduce(function (s, k) {
        return s + out.items[k];
      }, 0) / bKeys.length);
    }
    out.renang = out.items.renang;
    // An item scored 0 fails the whole test on its own, but only count
    // renang when this intake actually scores it.
    Object.keys(out.items).forEach(function (k) {
      if (k === "renang" && !includeRenang) return;
      if (out.items[k] === 0) out.gugur.push(META[k].label);
    });
    if (out.nilaiA !== null && out.nilaiB !== null) {
      var parts = [out.nilaiA, out.nilaiB];
      if (includeRenang && out.renang !== null) parts.push(out.renang);
      out.nkj = Math.round((parts.reduce(function (s, v) { return s + v; }, 0) / parts.length) * 100) / 100;
      out.band = band(out.nkj);
      out.lulus = out.nkj >= NBL && out.gugur.length === 0;
    }
    return out;
  }

  global.NilaiPolri = { anchors: ANCHORS, meta: META, bands: BANDS, nbl: NBL,
                        nilaiItem: nilaiItem, band: band, hitung: hitung };
})(window);
