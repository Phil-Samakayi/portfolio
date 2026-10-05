(() => {
  "use strict";
  document.documentElement.classList.add("js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let DATA = null;
  const dataReady = fetch("/api/portfolio").then((r) => r.json()).then((d) => (DATA = d)).catch(() => null);

  /* ---------- Nav, progress bar, spotlight ---------- */
  const nav = $("#nav");
  const bar = $(".progress span");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $("#menu-btn");
  const links = $("#nav-links");
  const closeMenu = () => { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));

  if (finePointer) {
    addEventListener("pointermove", (e) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  // Highlight the nav link of the section in view
  const navMap = new Map($$("a", links).map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove("active"));
      navMap.get(en.target.id)?.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll + counters ---------- */
  const countUp = (el) => {
    const target = +el.dataset.target;
    if (reduced) { el.textContent = target; return; }
    const start = performance.now(), dur = 1200;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$(".count", en.target).forEach(countUp);
      revealer.unobserve(en.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", Math.min(siblings.indexOf(el), 5) * 80 + "ms");
    revealer.observe(el);
  });

  /* ---------- Hero: typed roles, local time, magnetic buttons ---------- */
  const typed = $("#typed");
  if (typed && !reduced) {
    const words = JSON.parse(typed.dataset.words);
    let w = 0, i = words[0].length, deleting = true;
    const step = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 1900; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(step, delay);
    };
    setTimeout(step, 2200);
  }

  const timeEl = $("#local-time");
  const showTime = () => {
    timeEl.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lusaka" }).format(new Date());
  };
  showTime();
  setInterval(showTime, 30000);

  if (finePointer && !reduced) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }

  const portrait = $("#portrait");
  if (portrait && finePointer && !reduced) {
    const img = $("img", portrait);
    portrait.addEventListener("pointermove", (e) => {
      const r = portrait.getBoundingClientRect();
      img.style.setProperty("--pry", ((e.clientX - r.left) / r.width - 0.5) * 8 + "deg");
      img.style.setProperty("--prx", (0.5 - (e.clientY - r.top) / r.height) * 8 + "deg");
    });
    portrait.addEventListener("pointerleave", () => {
      img.style.setProperty("--prx", "0deg");
      img.style.setProperty("--pry", "0deg");
    });
  }

  /* ---------- Projects: tilt, filter, modal ---------- */
  const cards = $$(".card");
  if (finePointer && !reduced) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--cx", x * 100 + "%");
        card.style.setProperty("--cy", y * 100 + "%");
        card.style.setProperty("--ry", (x - 0.5) * 7 + "deg");
        card.style.setProperty("--rx", (0.5 - y) * 7 + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  const filters = $$(".filter");
  const empty = $("#empty");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    const key = btn.dataset.filter;
    cards.forEach((c) => c.classList.add("fade"));
    setTimeout(() => {
      let shown = 0;
      cards.forEach((c) => {
        const match = key === "all" || c.dataset.category === key;
        c.classList.toggle("hide", !match);
        if (match) shown++;
      });
      empty.hidden = shown > 0;
      requestAnimationFrame(() => cards.forEach((c) => c.classList.remove("fade")));
    }, reduced ? 0 : 220);
  }));

  const modal = $("#modal");
  const openProject = async (id) => {
    await dataReady;
    const p = DATA?.projects.find((x) => x.id === id);
    if (!p) return;
    $("#modal-meta").textContent = `${p.category} · ${p.year}`;
    $("#modal-title").textContent = p.title;
    $("#modal-role").textContent = `Role: ${p.role}`;
    $("#modal-desc").textContent = p.description;
    $("#modal-highlights").innerHTML = p.highlights.map((h) => `<li>${esc(h)}</li>`).join("");
    $("#modal-stack").innerHTML = p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("");
    const link = $("#modal-link");
    link.hidden = !p.link;
    if (p.link) link.href = p.link;
    modal.showModal();
  };
  cards.forEach((c) => c.addEventListener("click", () => openProject(c.dataset.id)));
  $("#modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  /* ---------- Terminal ---------- */
  const out = $("#term-output");
  const input = $("#term-input");
  const body = $("#term-body");
  const history = [];
  let hIndex = 0;

  const print = (html, cls = "") => {
    const pre = document.createElement("pre");
    if (cls) pre.className = cls;
    pre.innerHTML = html;
    out.appendChild(pre);
    body.scrollTop = body.scrollHeight;
  };
  const hl = (s) => `<span class="hl">${esc(s)}</span>`;
  const dim = (s) => `<span class="dim">${esc(s)}</span>`;
  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });

  const commands = {
    help: () => [
      "Available commands:",
      `  ${hl("about")}            who I am`,
      `  ${hl("projects")}         list my projects`,
      `  ${hl("open <project>")}   open a project, e.g. open pulse`,
      `  ${hl("skills")}           my toolkit`,
      `  ${hl("journey")}          education and milestones`,
      `  ${hl("contact")}          how to reach me`,
      `  ${hl("goto <section>")}   about | work | skills | contact`,
      `  ${hl("clear")}            clear the screen`,
      dim("Tip: Tab autocompletes, ↑ and ↓ browse history."),
    ].join("\n"),
    about: () => `${hl(DATA.profile.name)} — ${esc(DATA.profile.role)}\n${esc(DATA.profile.location)}\n\n${DATA.profile.about.map(esc).join("\n\n")}`,
    whoami: () => "visitor — welcome, and thanks for stopping by.",
    projects: () => DATA.projects.map((p) => `  ${hl(p.id.padEnd(20))}${esc(p.summary)}`).join("\n") + `\n\n${dim("Type 'open <project>' for details.")}`,
    ls: () => commands.projects(),
    skills: () => DATA.skills.map((g) => `${hl(g.group.padEnd(14))}${esc(g.items.join(", "))}`).join("\n"),
    journey: () => DATA.journey.map((j) => `${hl(j.period)}  ${esc(j.title)}\n  ${dim(j.text)}`).join("\n\n"),
    contact: () => {
      const p = DATA.profile;
      const rows = [`${hl("email".padEnd(10))}${esc(p.email)}`];
      if (p.github) rows.push(`${hl("github".padEnd(10))}${esc(p.github)}`);
      if (p.linkedin) rows.push(`${hl("linkedin".padEnd(10))}${esc(p.linkedin)}`);
      rows.push(dim("Or type 'goto contact' to use the form."));
      return rows.join("\n");
    },
    open: (arg) => {
      if (!arg) return { bad: "Usage: open <project>. Try 'projects' to see the list." };
      const q = arg.toLowerCase();
      const p = DATA.projects.find((x) => x.id === q) || DATA.projects.find((x) => x.id.includes(q) || x.title.toLowerCase().includes(q));
      if (!p) return { bad: `No project matching '${arg}'. Try 'projects'.` };
      openProject(p.id);
      return `Opening ${hl(p.title)}…`;
    },
    goto: (arg) => {
      const map = { about: "about", work: "work", projects: "work", skills: "skills", contact: "contact", top: "top", home: "top" };
      const id = map[(arg || "").toLowerCase()];
      if (!id) return { bad: "Usage: goto about | work | skills | contact" };
      goTo(id);
      return `Scrolling to ${hl(arg)}…`;
    },
    date: () => new Date().toString(),
    echo: (arg) => esc(arg || ""),
    sudo: () => ({ bad: "Nice try. Permission denied." }),
    clear: () => { out.innerHTML = ""; return null; },
  };

  const run = async (raw) => {
    const line = raw.trim();
    print(`<b>visitor:~$</b> ${esc(line)}`, "cmd");
    if (!line) return;
    history.push(line);
    hIndex = history.length;
    await dataReady;
    if (!DATA) return print("Could not load portfolio data. Is the server running?", "bad");
    const [name, ...rest] = line.split(/\s+/);
    const fn = commands[name.toLowerCase()];
    if (!fn) return print(`Command not found: ${esc(name)}. Type 'help' for a list.`, "bad");
    const res = fn(rest.join(" "));
    if (res === null || res === undefined) return;
    if (typeof res === "object") print(esc(res.bad), "bad");
    else print(res);
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;
      hIndex = Math.max(0, Math.min(history.length, hIndex + (e.key === "ArrowUp" ? -1 : 1)));
      input.value = history[hIndex] || "";
    } else if (e.key === "Tab" && input.value.trim()) {
      const parts = input.value.split(/\s+/);
      let pool = Object.keys(commands), idx = 0;
      if (parts.length > 1 && DATA) {
        idx = 1;
        pool = parts[0] === "open" ? DATA.projects.map((p) => p.id) : parts[0] === "goto" ? ["about", "work", "skills", "contact"] : [];
      }
      const hits = pool.filter((c) => c.startsWith(parts[idx].toLowerCase()));
      if (hits.length === 1) {
        e.preventDefault();
        parts[idx] = hits[0];
        input.value = parts.join(" ") + (idx === 0 && ["open", "goto", "echo"].includes(hits[0]) ? " " : "");
      } else if (hits.length > 1) {
        e.preventDefault();
        print(dim(hits.join("   ")));
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = "";
    }
  });
  body.addEventListener("click", () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
  $$(".chip").forEach((chip) => chip.addEventListener("click", () => run(chip.dataset.cmd)));
  print(`Welcome. Type ${hl("help")} to see what you can do, or tap a command below.`);

  /* ---------- Contact form ---------- */
  const form = $("#contact-form");
  const status = $("#form-status");
  const sendBtn = $("#send-btn");
  const msg = $("#message");
  const counter = $("#counter");
  msg.addEventListener("input", () => (counter.textContent = `${msg.value.length} / 3000`));

  const setErrors = (errors) => {
    $$(".field", form).forEach((f) => f.classList.remove("invalid"));
    $$(".error", form).forEach((el) => {
      const text = errors[el.dataset.for] || "";
      el.textContent = text;
      if (text) el.closest(".field").classList.add("invalid");
    });
  };
  const validate = (d) => {
    const errors = {};
    if (d.name.length < 2) errors.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) errors.email = "Please enter a valid email address.";
    if (d.message.length < 10) errors.message = "Please write at least 10 characters.";
    return errors;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));
    const errors = validate(d);
    setErrors(errors);
    status.className = "form-status";
    status.textContent = "";
    if (Object.keys(errors).length) {
      $(".field.invalid input, .field.invalid textarea", form)?.focus();
      return;
    }
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        form.reset();
        counter.textContent = "0 / 3000";
        status.classList.add("ok");
        status.textContent = "Message sent. Thank you, I'll be in touch soon.";
      } else if (json.errors) {
        setErrors(json.errors);
      } else {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      status.classList.add("err");
      status.textContent = err.message.includes("fetch") ? "Network error. Please try again." : err.message;
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send message";
    }
  });
})();
