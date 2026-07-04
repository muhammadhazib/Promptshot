/* ============================================================
   PromptShot — prompt builder engine
   Everything runs client-side. No requests, no tracking.
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Generator links.
     TODO BEFORE LAUNCH: replace `affiliate: null` with your real
     affiliate/referral URLs (ImagineArt, Freepik, etc.). When
     `affiliate` is null the plain product URL is used.
     `prefill(prompt)` — if the tool supports prompt prefill via
     URL, return a URL; otherwise null (we copy + open instead).
     ---------------------------------------------------------- */
  var GENERATORS = [
    {
      id: "imagineart",
      name: "ImagineArt",
      label: "ImagineArt ↗",
      url: "https://www.imagine.art/",
      affiliate: null, // TODO: ImagineArt affiliate URL
      prefill: null,
      tagline: "All-in-one AI image & video generator with strong product-shot quality and simple credit pricing.",
      bestFor: "Fast product shots & UGC-style stills"
    },
    {
      id: "freepik",
      name: "Freepik",
      label: "Freepik ↗",
      url: "https://www.freepik.com/ai/image-generator",
      affiliate: null, // TODO: Freepik affiliate URL
      prefill: null,
      tagline: "AI image generation inside a full design suite — stock photos, mockups and templates included.",
      bestFor: "Ad creatives + design assets in one place"
    },
    {
      id: "gptimage",
      name: "GPT Image",
      label: "GPT Image ↗",
      url: "https://chatgpt.com/",
      affiliate: null,
      prefill: function (prompt) {
        return "https://chatgpt.com/?q=" + encodeURIComponent("Create this image: " + prompt);
      },
      tagline: "OpenAI's image model inside ChatGPT — best-in-class prompt understanding and readable on-image text.",
      bestFor: "Complex scenes & accurate text on packshots"
    },
    {
      id: "midjourney",
      name: "Midjourney",
      label: "Midjourney ↗",
      url: "https://www.midjourney.com/imagine",
      affiliate: null,
      prefill: null,
      tagline: "The reference for photorealism, lighting and premium visual style — use PromptShot's Midjourney mode.",
      bestFor: "Hero shots & high-polish brand imagery"
    }
  ];

  /* ---------------------------------------------------------
     Recipe data. Fragments are written to chain into one prompt:
     opener + subject + detail | scene | lighting | camera |
     platform composition | quality tail.
     --------------------------------------------------------- */
  var PRODUCT_TYPES = [
    {
      id: "apparel", icon: "👕", label: "Apparel",
      fallback: "your apparel piece",
      detail: "fabric weave, stitching and natural drape rendered with tactile clarity, colors true to the real garment"
    },
    {
      id: "accessories", icon: "🧢", label: "Accessories",
      fallback: "your accessory",
      detail: "material finish rendered precisely — metal with controlled reflections, leather grain, clean seams and edge detail"
    },
    {
      id: "beauty", icon: "💄", label: "Beauty",
      fallback: "your beauty product",
      detail: "label crisp and legible, glass and plastic catching soft specular highlights, product texture looking fresh and untouched"
    },
    {
      id: "gadgets", icon: "🎧", label: "Gadgets",
      fallback: "your gadget",
      detail: "clean fingerprint-free surfaces, precise seams and port detail, matte and gloss finishes clearly differentiated"
    },
    {
      id: "food", icon: "🥤", label: "Food & Drink",
      fallback: "your food or drink product",
      detail: "appetizing and fresh, natural vibrant color, honest texture — condensation, steam or crumb detail where it fits"
    },
    {
      id: "home", icon: "🕯️", label: "Home Goods",
      fallback: "your home goods product",
      detail: "honest materials — ceramic glaze, wood grain or textile weave clearly rendered, proportions true to scale"
    }
  ];

  var PLATFORMS = [
    {
      id: "tiktok", icon: "🎵", label: "TikTok ad", ar: "9:16",
      composition: "Vertical 9:16 TikTok ad composition: product large in the upper two-thirds of the frame so the hook reads instantly, bottom quarter and right edge kept uncluttered where TikTok's caption, CTA button and engagement icons overlay"
    },
    {
      id: "reel", icon: "🎬", label: "Instagram Reel", ar: "9:16",
      composition: "Vertical 9:16 Instagram Reel composition: key subject center-frame, top 12% and bottom 20% free of critical detail so username and caption overlays never cover it"
    },
    {
      id: "story", icon: "📱", label: "Story", ar: "9:16",
      composition: "Vertical 9:16 Story composition with generous margins — roughly the top 15% and bottom 20% left clear so the profile header and link sticker never sit on the product"
    },
    {
      id: "feed", icon: "🖼️", label: "Feed post", ar: "4:5",
      composition: "Portrait 4:5 Instagram feed composition: balanced framing with breathing room, all key content safe inside the center square so the 1:1 grid crop still reads"
    },
    {
      id: "marketplace", icon: "🛒", label: "Marketplace listing", ar: "1:1",
      composition: "Square 1:1 marketplace listing composition: product centered and filling about 85% of the frame",
      forceWhite: true,
      whiteScene: "On a pure white seamless background (RGB 255,255,255) with only a soft natural contact shadow — no props, no text, no graphics, marketplace main-image compliant",
      whiteSceneMJ: "On a pure white seamless background (RGB 255,255,255) with only a soft natural contact shadow, marketplace main-image compliant"
    }
  ];

  var STYLES = [
    {
      id: "studio", icon: "💡", label: "Clean studio",
      opener: "Professional studio product photograph",
      scene: "Set against a seamless charcoal-to-black gradient sweep with a soft, controlled floor reflection",
      lighting: "Three-point softbox lighting: key light at 45 degrees, a subtle rim light tracing the silhouette, soft fill keeping shadows clean and intentional",
      camera: "Shot on an 85mm lens at f/8, tack-sharp across the entire product"
    },
    {
      id: "lifestyle", icon: "🌿", label: "Lifestyle scene",
      opener: "Editorial lifestyle product photograph",
      scene: "Placed naturally in a believable real-world scene that matches how the product is actually used, styled but lived-in",
      lighting: "Warm natural window light with soft directional shadows and a golden-hour tone",
      camera: "35mm lens at f/2.8 — shallow depth of field melts the background while the product stays tack-sharp"
    },
    {
      id: "flatlay", icon: "🔲", label: "Flat lay",
      opener: "Top-down flat lay product photograph",
      scene: "Arranged on a textured neutral surface with two or three complementary props and deliberate negative space",
      lighting: "Even, diffused overhead light with minimal soft shadows",
      camera: "Shot directly overhead at 90 degrees on a 50mm lens, everything in crisp focus"
    },
    {
      id: "macro", icon: "🔍", label: "Macro detail",
      opener: "Extreme macro detail photograph",
      scene: "Background falls away into a clean blur so every bit of attention lands on the product's surface",
      lighting: "Raking side light that exaggerates texture and micro-detail",
      camera: "100mm macro lens with a razor-thin focus plane locked on the product's most premium detail"
    },
    {
      id: "splash", icon: "💦", label: "Splash shot",
      opener: "High-speed splash product photograph",
      scene: "Dynamic liquid and droplets frozen mid-air around the product against a deep, dark backdrop",
      lighting: "Dramatic rim lighting with flash-frozen motion, every droplet crisp",
      camera: "High-speed capture on a 70mm lens, the product perfectly sharp at the center of the action"
    },
    {
      id: "ugc", icon: "🤳", label: "UGC handheld",
      opener: "Authentic UGC-style photo with a shot-on-iPhone look",
      scene: "A casual, believable real-home setting — kitchen counter, desk or car seat — slightly imperfect on purpose",
      lighting: "Unedited natural daylight, soft and honest, no studio polish",
      camera: "Smartphone camera perspective with a natural handheld feel, focus locked on the product"
    }
  ];

  var QUALITY_TAIL = "High-end commercial e-commerce advertising photography, ultra-detailed, physically accurate materials, color-accurate, no text, no watermark";
  /* Midjourney reads negative words in prose as attractors — strip them
     from the tail and rely on the --no flag instead. */
  var QUALITY_TAIL_MJ = "High-end commercial e-commerce advertising photography, ultra-detailed, physically accurate materials, color-accurate";

  /* Styles whose scene fights marketplace white-background rules */
  var MARKETPLACE_CONFLICTS = ["lifestyle", "flatlay", "splash", "ugc"];

  /* ---------------------------------------------------------
     Product-photo reference mode.
     The photo is analyzed on a canvas in the browser — it is
     never uploaded anywhere. We extract dominant colors and
     write a color story into the prompt; the prompt itself
     switches to "restage the attached product" language.
     --------------------------------------------------------- */
  var COLOR_ANCHORS = [
    ["black", 10, 10, 10], ["charcoal", 54, 57, 63], ["slate gray", 112, 128, 144],
    ["gray", 128, 128, 128], ["silver", 192, 192, 192], ["white", 250, 250, 250],
    ["cream", 245, 240, 225], ["beige", 217, 199, 167], ["tan", 200, 161, 101],
    ["caramel brown", 160, 106, 60], ["brown", 123, 74, 45], ["chocolate brown", 78, 46, 30],
    ["maroon", 94, 26, 36], ["crimson", 142, 30, 47], ["red", 192, 57, 43],
    ["orange", 230, 126, 34], ["amber", 243, 156, 18], ["gold", 212, 175, 55],
    ["yellow", 241, 196, 15], ["khaki", 183, 169, 122], ["olive", 107, 142, 35],
    ["green", 39, 174, 96], ["forest green", 30, 86, 49], ["teal", 22, 134, 124],
    ["cyan", 41, 182, 216], ["sky blue", 116, 185, 232], ["blue", 47, 109, 208],
    ["navy blue", 26, 42, 86], ["purple", 108, 63, 160], ["violet", 142, 108, 201],
    ["magenta", 194, 57, 155], ["pink", 232, 143, 180], ["rose", 217, 106, 126]
  ];

  function nameColor(r, g, b) {
    var best = COLOR_ANCHORS[0], bestDist = Infinity;
    for (var i = 0; i < COLOR_ANCHORS.length; i++) {
      var c = COLOR_ANCHORS[i];
      var d = (r - c[1]) * (r - c[1]) + (g - c[2]) * (g - c[2]) + (b - c[3]) * (b - c[3]);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    return best[0];
  }

  function toHex(r, g, b) {
    function h(n) { var s = n.toString(16); return s.length === 1 ? "0" + s : s; }
    return "#" + h(r) + h(g) + h(b);
  }

  /* Dominant colors from an <img>: downscale to a small canvas,
     skip transparent + near-white background pixels, bucket the
     rest, return up to 3 uniquely-named colors by frequency. */
  function extractPalette(imgEl) {
    var SIZE = 48;
    try {
      var canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);
      var data = ctx.getImageData(0, 0, SIZE, SIZE).data;

      var buckets = {};
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 200) continue;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        var sat = max === 0 ? 0 : (max - min) / max;
        if (lum > 242 && sat < 0.1) continue; // near-white studio background
        var key = (r >> 5) + "," + (g >> 5) + "," + (b >> 5);
        var bk = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
        bk.n++; bk.r += r; bk.g += g; bk.b += b;
      }

      var sorted = Object.keys(buckets)
        .map(function (k) { return buckets[k]; })
        .sort(function (x, y) { return y.n - x.n; });

      var palette = [], seen = {};
      for (var j = 0; j < sorted.length && palette.length < 3; j++) {
        var bkt = sorted[j];
        var ar = Math.round(bkt.r / bkt.n), ag = Math.round(bkt.g / bkt.n), ab = Math.round(bkt.b / bkt.n);
        var name = nameColor(ar, ag, ab);
        if (seen[name]) continue;
        seen[name] = true;
        palette.push({ name: name, hex: toHex(ar, ag, ab) });
      }
      return palette;
    } catch (e) {
      return []; // analysis is best-effort; prompt still works without it
    }
  }

  /* --------------------------- state --------------------------- */
  var state = {
    product: "accessories",
    platform: "tiktok",
    style: "studio",
    desc: "",
    mjMode: false,
    refImage: null // { name, url, palette: [{name, hex}] } when a product photo is added
  };

  /* --------------------------- dom --------------------------- */
  var els = {
    productPills: document.getElementById("product-pills"),
    platformPills: document.getElementById("platform-pills"),
    stylePills: document.getElementById("style-pills"),
    desc: document.getElementById("product-desc"),
    output: document.getElementById("prompt-output"),
    aspectChip: document.getElementById("aspect-chip"),
    wordCount: document.getElementById("word-count"),
    copyBtn: document.getElementById("copy-btn"),
    generateBtns: document.getElementById("generate-btns"),
    compatNote: document.getElementById("compat-note"),
    mjMode: document.getElementById("mj-mode"),
    year: document.getElementById("year"),
    dropzone: document.getElementById("dropzone"),
    photoInput: document.getElementById("product-photo"),
    dropzoneHint: document.getElementById("dropzone-hint"),
    dropzonePreview: document.getElementById("dropzone-preview"),
    refThumb: document.getElementById("ref-thumb"),
    refName: document.getElementById("ref-name"),
    refSwatches: document.getElementById("ref-swatches"),
    refRemove: document.getElementById("ref-remove"),
    attachNote: document.getElementById("attach-note")
  };

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  function sentenceCase(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ------------------------ prompt assembly ------------------------ */
  function buildPrompt() {
    var product = findById(PRODUCT_TYPES, state.product);
    var platform = findById(PLATFORMS, state.platform);
    var style = findById(STYLES, state.style);

    var subject = state.desc.trim() || product.fallback;
    var scene = style.scene;
    if (platform.forceWhite) {
      scene = state.mjMode ? platform.whiteSceneMJ : platform.whiteScene;
    }

    /* Reference mode: a product photo is attached and the target tool can
       see it alongside the text (Midjourney can't — it takes the image as
       an Omni-Reference instead, so its prompt stays descriptive). */
    var referenceMode = !!state.refImage && !state.mjMode;

    var parts;
    if (referenceMode) {
      var desc = state.desc.trim();
      parts = [
        style.opener + " restaging the exact product from the attached reference photo" + (desc ? " — " + desc : ""),
        "Preserve complete fidelity to the reference product: identical shape and proportions, exact materials, colors and textures, label text and logo placement unchanged — do not redesign the product or invent new details",
        sentenceCase(product.detail),
        scene,
        style.lighting,
        style.camera,
        platform.composition
      ];
      if (state.refImage.palette.length > 1) {
        parts.push("Color story: scene tones chosen to complement the product's dominant " +
          state.refImage.palette[0].name + " and " + state.refImage.palette[1].name +
          " so it pops cleanly against the backdrop");
      } else if (state.refImage.palette.length === 1) {
        parts.push("Color story: scene tones chosen to complement the product's dominant " +
          state.refImage.palette[0].name + " so it pops cleanly against the backdrop");
      }
      parts.push(QUALITY_TAIL);
    } else {
      parts = [
        style.opener + " of " + subject + ", " + product.detail,
        scene,
        style.lighting,
        style.camera,
        platform.composition,
        state.mjMode ? QUALITY_TAIL_MJ : QUALITY_TAIL
      ];
    }

    var prompt = parts.join(". ") + ".";

    if (state.mjMode) {
      var noList = "text, watermark" + (platform.forceWhite ? ", props, graphics" : "");
      prompt += " --ar " + platform.ar + " --style raw --no " + noList;
    }
    return prompt;
  }

  function update() {
    var platform = findById(PLATFORMS, state.platform);
    var prompt = buildPrompt();

    els.output.textContent = prompt;
    els.aspectChip.textContent = platform.ar;
    els.wordCount.textContent = prompt.split(/\s+/).length + " words";

    /* marketplace × scene-style conflict note */
    if (platform.forceWhite && MARKETPLACE_CONFLICTS.indexOf(state.style) !== -1) {
      els.compatNote.textContent =
        "Marketplace main images require a pure white background — PromptShot locked the scene to a compliant white sweep and kept your style's lighting & camera language.";
      els.compatNote.hidden = false;
    } else {
      els.compatNote.hidden = true;
    }

    /* photo reference reminder */
    if (state.refImage) {
      els.attachNote.textContent = state.mjMode
        ? "📎 Midjourney can't see attachments in text prompts — drag your photo into the imagine bar as an Omni-Reference (--oref) so the exact product is preserved, and raise --ow if it drifts."
        : "📎 This prompt references your photo — attach the same image in the AI tool when you run it.";
      els.attachNote.hidden = false;
    } else {
      els.attachNote.hidden = true;
    }
  }

  /* ------------------------ pill rendering ------------------------ */
  function renderPills(container, items, stateKey) {
    items.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill";
      btn.dataset.id = item.id;
      btn.setAttribute("aria-pressed", String(state[stateKey] === item.id));
      btn.innerHTML = '<span class="pill-icon" aria-hidden="true">' + item.icon + "</span>" + item.label;
      btn.addEventListener("click", function () {
        state[stateKey] = item.id;
        var pills = container.querySelectorAll(".pill");
        for (var i = 0; i < pills.length; i++) {
          pills[i].setAttribute("aria-pressed", String(pills[i].dataset.id === item.id));
        }
        update();
      });
      container.appendChild(btn);
    });
  }

  /* ------------------------ clipboard ------------------------ */
  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () {
        legacyCopy(text);
        onDone();
      });
    } else {
      legacyCopy(text);
      onDone();
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* best effort */ }
    document.body.removeChild(ta);
  }

  /* ------------------------ wire up ------------------------ */
  renderPills(els.productPills, PRODUCT_TYPES, "product");
  renderPills(els.platformPills, PLATFORMS, "platform");
  renderPills(els.stylePills, STYLES, "style");

  els.desc.addEventListener("input", function () {
    state.desc = els.desc.value;
    update();
  });

  els.mjMode.addEventListener("change", function () {
    state.mjMode = els.mjMode.checked;
    update();
  });

  /* ---------------- product photo handling ---------------- */
  function setRefImage(file) {
    if (!file || file.type.indexOf("image/") !== 0) return;
    clearRefImage();

    var url = URL.createObjectURL(file);
    var probe = new Image();
    probe.onload = function () {
      state.refImage = { name: file.name || "pasted image", url: url, palette: extractPalette(probe) };

      els.refThumb.src = url;
      els.refName.textContent = state.refImage.name;
      els.refSwatches.innerHTML = "";
      state.refImage.palette.forEach(function (c) {
        var dot = document.createElement("i");
        dot.style.background = c.hex;
        dot.title = c.name;
        els.refSwatches.appendChild(dot);
      });
      if (state.refImage.palette.length === 0) {
        els.refSwatches.textContent = "—";
      }

      els.dropzoneHint.hidden = true;
      els.dropzonePreview.hidden = false;
      update();
    };
    probe.onerror = function () { URL.revokeObjectURL(url); };
    probe.src = url;
  }

  function clearRefImage() {
    if (state.refImage) {
      URL.revokeObjectURL(state.refImage.url);
      state.refImage = null;
    }
    els.photoInput.value = "";
    els.dropzoneHint.hidden = false;
    els.dropzonePreview.hidden = true;
  }

  els.dropzone.addEventListener("click", function (e) {
    if (e.target === els.refRemove) return;
    els.photoInput.click();
  });
  els.dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      els.photoInput.click();
    }
  });
  els.photoInput.addEventListener("change", function () {
    if (els.photoInput.files && els.photoInput.files[0]) setRefImage(els.photoInput.files[0]);
  });

  ["dragover", "dragenter"].forEach(function (evt) {
    els.dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      els.dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    els.dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      els.dropzone.classList.remove("dragover");
    });
  });
  els.dropzone.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setRefImage(e.dataTransfer.files[0]);
    }
  });

  /* Paste an image anywhere on the page (text pastes are untouched) */
  document.addEventListener("paste", function (e) {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files[0] &&
        e.clipboardData.files[0].type.indexOf("image/") === 0) {
      e.preventDefault();
      setRefImage(e.clipboardData.files[0]);
      els.dropzone.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  els.refRemove.addEventListener("click", function () {
    clearRefImage();
    update();
  });

  els.copyBtn.addEventListener("click", function () {
    copyText(buildPrompt(), function () {
      els.copyBtn.classList.add("copied");
      els.copyBtn.textContent = "Copied ✓";
      setTimeout(function () {
        els.copyBtn.classList.remove("copied");
        els.copyBtn.textContent = "Copy prompt";
      }, 1600);
    });
  });

  /* Generate buttons: copy the prompt, then open the tool
     (affiliate URL if configured, prefill URL if supported). */
  GENERATORS.forEach(function (gen) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gen-btn";
    btn.textContent = gen.label;
    btn.title = "Copies your prompt, then opens " + gen.label.replace(" ↗", "");
    btn.addEventListener("click", function () {
      var prompt = buildPrompt();
      var target = gen.prefill ? gen.prefill(prompt) : (gen.affiliate || gen.url);
      copyText(prompt, function () {
        var original = gen.label;
        btn.textContent = "Copied ✓ opening…";
        setTimeout(function () { btn.textContent = original; }, 1800);
        window.open(target, "_blank", "noopener");
      });
    });
    els.generateBtns.appendChild(btn);
  });

  /* AI tools directory (#ai-tools) — rendered from the same GENERATORS
     config so affiliate URLs only ever need updating in one place. */
  var toolsGrid = document.getElementById("ai-tools-grid");
  if (toolsGrid) {
    GENERATORS.forEach(function (gen) {
      var card = document.createElement("article");
      card.className = "tool-card";

      var h3 = document.createElement("h3");
      h3.textContent = gen.name;

      var tagline = document.createElement("p");
      tagline.className = "tool-tagline";
      tagline.textContent = gen.tagline;

      var best = document.createElement("p");
      best.className = "tool-best";
      best.innerHTML = "<strong>Best for:</strong> ";
      best.appendChild(document.createTextNode(gen.bestFor));

      var cta = document.createElement("a");
      cta.className = "btn btn-primary btn-sm tool-cta";
      cta.href = gen.affiliate || gen.url;
      cta.target = "_blank";
      cta.rel = "sponsored noopener";
      cta.textContent = "Try " + gen.name + " ↗";

      card.appendChild(h3);
      card.appendChild(tagline);
      card.appendChild(best);
      card.appendChild(cta);
      toolsGrid.appendChild(card);
    });
  }

  if (els.year) els.year.textContent = String(new Date().getFullYear());

  update();
})();
