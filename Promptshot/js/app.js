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

  /* --------------------------- state --------------------------- */
  var state = {
    product: "accessories",
    platform: "tiktok",
    style: "studio",
    desc: "",
    mjMode: false
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
    year: document.getElementById("year")
  };

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
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

    var parts = [
      style.opener + " of " + subject + ", " + product.detail,
      scene,
      style.lighting,
      style.camera,
      platform.composition,
      state.mjMode ? QUALITY_TAIL_MJ : QUALITY_TAIL
    ];

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
