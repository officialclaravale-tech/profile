// ── Page always starts at top on every load/refresh ──────────────────────────
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const resetPagePosition = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
resetPagePosition();
const resetAfterNavigation = () => {
  resetPagePosition();
  window.setTimeout(resetPagePosition, 100);
  window.setTimeout(resetPagePosition, 500);
};
window.addEventListener("pageshow", resetAfterNavigation);
window.addEventListener("load", resetAfterNavigation);

// ── Contact form ──────────────────────────────────────────────────────────────
const form = document.querySelector("#contact-form");
const thankyouCard = document.querySelector("#form-thankyou");

// Budget slider
const budgetInput = document.querySelector("#budget-range");
const budgetValue = document.querySelector("#budget-value");

function formatBudget(value) {
  const amount = Number(value);
  return `$${amount.toLocaleString()}${amount >= 2500 ? "+" : ""}`;
}

function updateBudgetValue() {
  if (!budgetInput) return;
  if (budgetValue) budgetValue.textContent = formatBudget(budgetInput.value);
  const progress = ((Number(budgetInput.value) - Number(budgetInput.min)) / (Number(budgetInput.max) - Number(budgetInput.min))) * 100;
  budgetInput.style.setProperty("--budget-progress", `${progress}%`);
  const budgetField = budgetInput.closest(".field");
  budgetField.classList.remove("invalid");
  const errEl = budgetField.querySelector(".error-message");
  if (errEl) errEl.textContent = "";
}

if (budgetInput) {
  budgetInput.addEventListener("input", updateBudgetValue);
  updateBudgetValue();
}

const validators = {
  name: (value) => value.trim() ? "" : "Please enter your name.",
  email: (value) => {
    if (!value.trim()) return "Please enter your email address.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address.";
  },
  "budget-range": (value) => value ? "" : "Please choose a budget range.",
  message: (value) => value.trim() ? "" : "Please tell me a little about your project."
};

function validateField(field) {
  const error = validators[field.name](field.value);
  const wrapper = field.closest(".field");
  if (!wrapper) return !error;
  wrapper.classList.toggle("invalid", Boolean(error));
  field.setAttribute("aria-invalid", Boolean(error));
  const errEl = wrapper.querySelector(".error-message");
  if (errEl) errEl.textContent = error;
  return !error;
}

if (form) {
  form.querySelectorAll("input:not([type=hidden]), textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) validateField(field);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll("input:not([type=hidden]), textarea")];
    const valid = fields.map(validateField);
    // Also validate budget
    const budgetValid = validators["budget-range"](budgetInput ? budgetInput.value : "");
    if (budgetValid) {
      const budgetField = budgetInput ? budgetInput.closest(".field") : null;
      if (budgetField) {
        budgetField.classList.add("invalid");
        const errEl = budgetField.querySelector(".error-message");
        if (errEl) errEl.textContent = budgetValid;
      }
      valid.push(false);
    }
    const firstInvalid = fields[valid.indexOf(false)];
    if (firstInvalid || budgetValid) {
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus({ preventScroll: true });
      }
      return;
    }
    const status = form.querySelector(".form-status");
    if (status) status.textContent = "";

    let response;
    try {
      response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
    } catch (error) {
      if (status) status.textContent = "Something went wrong — please try again or email me directly at samratdhakal727@gmail.com";
      return;
    }

    if (!response.ok) {
      if (status) status.textContent = "Something went wrong — please try again or email me directly at samratdhakal727@gmail.com";
      return;
    }

    form.reset();
    updateBudgetValue();
    form.style.transition = "opacity .35s ease, transform .35s ease";
    form.style.opacity = "0";
    form.style.transform = "translateY(-12px)";
    setTimeout(() => {
      form.style.display = "none";
      if (thankyouCard) {
        thankyouCard.style.display = "flex";
        requestAnimationFrame(() => thankyouCard.classList.add("is-visible"));
        thankyouCard.removeAttribute("aria-hidden");
      }
    }, 380);
  });
}


const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const heroFrames = [...document.querySelectorAll(".hero-frame")];
if (heroFrames.length === 3 && !reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.set(heroFrames, { opacity: 0 });
  gsap.set(heroFrames[0], { opacity: 1 });

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      heroFrames[0].style.opacity = Math.max(0, 1 - p * 2);
      heroFrames[1].style.opacity = p <= 0.5 ? Math.min(1, p * 2) : Math.max(0, 1 - (p - 0.5) * 2);
      heroFrames[2].style.opacity = Math.max(0, (p - 0.5) * 2);
    }
  });
} else if (heroFrames.length) {
  heroFrames.forEach((frame, index) => { frame.style.opacity = index === 0 ? "1" : "0"; });
}

if (!reduceMotion) {
  const code = document.querySelector("#code-snippet");
  const text = "const trust = design + performance;";
  let index = 0;
  const type = () => {
    code.textContent = text.slice(0, index++);
    if (index <= text.length) window.setTimeout(type, 28);
  };
  window.setTimeout(type, 400);

  document.querySelectorAll(".hero-word").forEach((word, position) => {
    word.style.opacity = "0";
    word.style.transform = "translateY(18px)";
    window.setTimeout(() => {
      word.style.transition = "opacity .42s ease, transform .42s ease";
      word.style.opacity = "1";
      word.style.transform = "translateY(0)";
    }, 120 + position * 90);
  });
} else {
  document.querySelector("#code-snippet").textContent = "const trust = design + performance;";
}

if (canHover && !reduceMotion) {
  const shapes = [...document.querySelectorAll(".hero-shape")];
  document.querySelector(".hero").addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - .5;
    const y = event.clientY / window.innerHeight - .5;
    shapes.forEach((shape, index) => {
      shape.style.setProperty("--px", `${x * (3 + index * 2)}px`);
      shape.style.setProperty("--py", `${y * (3 + index * 2)}px`);
    });
  }, { passive: true });

  document.querySelectorAll(".button-primary").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const box = button.getBoundingClientRect();
      const x = Math.max(-5, Math.min(5, (event.clientX - box.left - box.width / 2) * .22));
      const y = Math.max(-4, Math.min(4, (event.clientY - box.top - box.height / 2) * .22));
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });
}

const characterGuide = document.querySelector(".character-guide");
const characterGuideImage = document.querySelector(".character-guide-image");
const speechBubble = document.querySelector("#character-speech-bubble");
const speechBubbleText = document.querySelector("#speech-bubble-text");

if (characterGuide && characterGuideImage) {
  const characterFrameCount = 120;
  const characterFramePath = "images/character-frames/character-frame-";
  
  // Preload all 120 transparent PNG frames
  const characterFrames = Array.from({ length: characterFrameCount }, (_, index) => {
    const frame = new Image();
    frame.src = `${characterFramePath}${String(index + 1).padStart(3, "0")}.png`;
    return frame;
  });

  Promise.all(characterFrames.map((frame) => new Promise((resolve) => {
    if (frame.complete && frame.naturalWidth) {
      resolve(frame);
      return;
    }
    frame.onload = () => resolve(frame);
    frame.onerror = () => resolve(frame); // Graceful fallback
  }))).then(() => {
    characterGuideImage.src = characterFrames[0].src;
    characterGuide.classList.add("is-ready");

    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Continuous subtle floating motion
    gsap.to(characterGuideImage, {
      y: -9,
      duration: 2.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    let speechBubbleTimer = null;
    let isHeroWelcomeActive = true;
    const heroContent = document.querySelector(".hero-content");

    const showSpeechBubble = (text, duration = 0, isHero = false) => {
      if (!speechBubble || !speechBubbleText) return;
      if (speechBubbleTimer) clearTimeout(speechBubbleTimer);

      speechBubbleText.textContent = text;
      speechBubble.classList.toggle("is-hero-welcome", isHero);
      speechBubble.classList.add("is-visible");

      if (duration > 0) {
        speechBubbleTimer = setTimeout(() => {
          speechBubble.classList.remove("is-visible");
          speechBubble.classList.remove("is-hero-welcome");
        }, duration);
      }
    };

    const hideSpeechBubble = () => {
      if (!speechBubble) return;
      if (speechBubbleTimer) clearTimeout(speechBubbleTimer);
      speechBubble.classList.remove("is-visible");
      speechBubble.classList.remove("is-hero-welcome");
    };

    // Hero initial greeting: Big prominent "WELCOME" + Namaste gesture (frames 1-20).
    // Stays visible indefinitely until user starts scrolling!
    setTimeout(() => {
      showSpeechBubble("WELCOME", 0, true);
    }, 200);

    let pendingProgress = 0;
    let currentFrameIndex = 0;
    let frameUpdateRequest = 0;

    const drawCharacterFrame = () => {
      const targetFrame = Math.min(characterFrameCount - 1, Math.max(0, Math.floor(pendingProgress * characterFrameCount)));
      if (targetFrame !== currentFrameIndex && characterFrames[targetFrame]) {
        currentFrameIndex = targetFrame;
        characterGuideImage.src = characterFrames[currentFrameIndex].src;
      }
      frameUpdateRequest = 0;
    };

    const getScale = () => window.innerWidth < 768 ? 0.45 : 1;

    // Set initial prominent scale for character on Hero load (1.35x)
    gsap.set(characterGuide, { scale: 1.35, x: 0, y: 0 });

    const contactSection = document.querySelector("#contact");
    const lerp = (start, end, amount) => start + (end - start) * amount;
    const guidePath = [
      { progress: 0, x: 0, y: 0, scale: 1.35 },
      { progress: .15, x: 22, y: 14, scale: 1 },
      { progress: .4, x: -26, y: 4, scale: 1 },
      { progress: .7, x: 24, y: 10, scale: 1 },
      { progress: .85, x: -22, y: 6, scale: 1 },
      { progress: 1, x: 18, y: 14, scale: 1 }
    ];

    const syncGuidePosition = (progress) => {
      const sectionIsVisible = (section, topRatio, bottomRatio) => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight * topRatio && rect.bottom >= window.innerHeight * bottomRatio;
      };

      characterGuide.classList.remove("is-work", "is-contact");

      let start = guidePath[0];
      let end = guidePath[guidePath.length - 1];
      for (let index = 1; index < guidePath.length; index += 1) {
        if (progress <= guidePath[index].progress) {
          start = guidePath[index - 1];
          end = guidePath[index];
          break;
        }
      }
      const segmentProgress = (progress - start.progress) / (end.progress - start.progress || 1);
      gsap.set(characterGuide, {
        left: "50%",
        width: "clamp(140px,15vw,200px)",
        x: `${lerp(start.x, end.x, segmentProgress)}vw`,
        y: `${lerp(start.y, end.y, segmentProgress)}vh`,
        scale: lerp(start.scale, end.scale, segmentProgress)
      });
    };

    ScrollTrigger.create({
      id: "character-guide-scroll",
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (trigger) => {
        pendingProgress = trigger.progress;
        if (!frameUpdateRequest) frameUpdateRequest = window.requestAnimationFrame(drawCharacterFrame);

        if (trigger.progress > 0.004 && isHeroWelcomeActive) {
          isHeroWelcomeActive = false;
          hideSpeechBubble();
          if (heroContent) heroContent.classList.add("hero-content-revealed");
        } else if (trigger.progress <= 0.004 && !isHeroWelcomeActive) {
          isHeroWelcomeActive = true;
          if (heroContent) heroContent.classList.remove("hero-content-revealed");
          showSpeechBubble("WELCOME", 0, true);
        }

        syncGuidePosition(trigger.progress);
      }
    });

    // Persistent section-aware speech bubble triggers (stay visible for full duration in section)
    const sectionBubbles = [
      { id: "#services", text: "What I do" },
      { id: "#work", text: "Selected work" },
      { id: "#process", text: "My process" },
      { id: "#contact", text: "Let’s talk" }
    ];
    let activeBubbleId = "";

    sectionBubbles.forEach(({ id, text }) => {
      const section = document.querySelector(id);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        end: "bottom 25%",
        onUpdate: (trigger) => {
          const contactIsVisible = contactSection && contactSection.getBoundingClientRect().top <= window.innerHeight * .75 && contactSection.getBoundingClientRect().bottom >= window.innerHeight * .25;
          if (trigger.isActive && (id === "#contact" || !contactIsVisible)) {
            activeBubbleId = id;
            sectionBubbles.forEach((sectionBubble) => characterGuide.classList.remove(`is-${sectionBubble.id.slice(1)}`));
            characterGuide.classList.add(`is-${id.slice(1)}`);
            showSpeechBubble(text, 0, false);
          }
        },
        onEnter: () => {
          activeBubbleId = id;
          sectionBubbles.forEach((sectionBubble) => characterGuide.classList.remove(`is-${sectionBubble.id.slice(1)}`));
          characterGuide.classList.add(`is-${id.slice(1)}`);
          showSpeechBubble(text, 0, false);
        },
        onEnterBack: () => {
          activeBubbleId = id;
          sectionBubbles.forEach((sectionBubble) => characterGuide.classList.remove(`is-${sectionBubble.id.slice(1)}`));
          characterGuide.classList.add(`is-${id.slice(1)}`);
          showSpeechBubble(text, 0, false);
        },
        onLeave: () => {
          characterGuide.classList.remove(`is-${id.slice(1)}`);
          if (activeBubbleId === id) {
            activeBubbleId = "";
            hideSpeechBubble();
          }
        },
        onLeaveBack: () => {
          characterGuide.classList.remove(`is-${id.slice(1)}`);
          if (activeBubbleId === id) {
            activeBubbleId = "";
            hideSpeechBubble();
          }
        }
      });
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      resetAfterNavigation();
      requestAnimationFrame(() => {
        ScrollTrigger.update();
        resetPagePosition();
      });
    });

  }).catch(() => {
    characterGuide.remove();
  });
}

const revealItems = document.querySelectorAll(".service-row, .section-draw-line");
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: .25 });
revealItems.forEach((item) => revealObserver.observe(item));

if (canHover && !reduceMotion) {
  document.querySelectorAll(".project").forEach((project) => {
    project.addEventListener("pointermove", (event) => {
      const box = project.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      project.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
    });
    project.addEventListener("pointerleave", () => { project.style.transform = ""; });
  });
}
