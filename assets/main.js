(function () {
  "use strict";

  var DAY = 864e5;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".u-reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Marquee: duplicate content for a seamless loop ---------- */
  $$(".marquee-track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---------- Countdown ---------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function startCountdown(box, target, onDone) {
    if (!box) return;
    var cells = {};
    $$("[data-cd]", box).forEach(function (b) { cells[b.getAttribute("data-cd")] = b; });
    function tick() {
      var ms = Math.max(0, target - Date.now());
      cells.d.textContent = Math.floor(ms / DAY);
      cells.h.textContent = pad(Math.floor(ms / 36e5) % 24);
      cells.m.textContent = pad(Math.floor(ms / 6e4) % 60);
      cells.s.textContent = pad(Math.floor(ms / 1e3) % 60);
      if (ms === 0) { clearInterval(timer); if (onDone) onDone(); }
    }
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------- Timeline status ---------- */
  var items = $$("#milestones .tl-item");
  if (items.length) {
    var now = Date.now(), next = null;
    items.forEach(function (li) {
      var t = Date.parse(li.getAttribute("data-date"));
      var status = $("[data-status]", li), eta = $("[data-eta]", li);
      var days = Math.ceil((t - now) / DAY);
      if (t <= now) {
        li.classList.add("is-live");
        status.textContent = "Live";
        status.classList.add("live");
        eta.textContent = "";
      } else {
        if (!next) { next = li; li.classList.add("is-next"); status.textContent = "Up next"; status.classList.add("next"); }
        else status.textContent = "Planned";
        eta.textContent = "in " + days + (days === 1 ? " day" : " days");
      }
    });

    var list = $("#next-list");
    if (next) {
      $("#next-title").textContent = next.getAttribute("data-title");
      $("#next-date").textContent = next.getAttribute("data-label");
      startCountdown($("#countdown"), Date.parse(next.getAttribute("data-date")), function () { location.reload(); });
      var after = items.slice(items.indexOf(next) + 1);
      after.forEach(function (li) {
        var el = document.createElement("li");
        el.innerHTML = "<b></b><span></span>";
        el.firstChild.textContent = li.getAttribute("data-title");
        el.lastChild.textContent = li.getAttribute("data-label");
        list.appendChild(el);
      });
    } else {
      $("#next-title").textContent = "Everything is live!";
      $("#next-date").textContent = "See you in the next roadmap.";
      $("#countdown").style.display = "none";
    }
  }

  /* ---------- Login calendar demo ---------- */
  var grid = $("#cal-grid");
  if (grid) {
    var normal = [
      { ico: "💰", lbl: "Gold" },
      { ico: "🧪", lbl: "HP potions" },
      { ico: "📜", lbl: "XP scroll" },
      { ico: "🪵", lbl: "Resources" }
    ];
    var special = {
      7: { ico: "✨", lbl: "Rarity Boost", msg: "Day 7: Rarity Boost potion!" },
      14: { ico: "💎", lbl: "25 gems", msg: "Day 14: 25 gems + an extra consumable!" },
      21: { ico: "🃏", lbl: "Skin shard", msg: "Day 21: pet or mount skin shard!" },
      28: { ico: "👑", lbl: "Monthly cosmetic", msg: "Day 28: this month's exclusive cosmetic!" }
    };
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $("#cal-month").textContent = months[new Date().getUTCMonth()] + " board";

    var cells = [];
    for (var d = 1; d <= 28; d++) {
      var r = special[d] || normal[(d - 1) % normal.length];
      var cell = document.createElement("div");
      cell.className = "day" + (special[d] ? " milestone" : "") + (d === 28 ? " d28" : "");
      cell.innerHTML = '<span class="n">' + d + '</span><span class="ico">' + r.ico + '</span><span class="lbl">' + r.lbl + "</span>";
      cell.title = "Day " + d + ": " + r.lbl;
      grid.appendChild(cell);
      cells.push(cell);
    }

    var claimed = Math.min(28, Math.max(0, parseInt(store("pixmmo-cal"), 10) || 0));
    var btn = $("#claim-btn"), count = $("#cal-count"), streak = $("#streak-n");

    function render(popIndex) {
      cells.forEach(function (c, i) {
        c.classList.toggle("claimed", i < claimed);
        c.classList.toggle("today", i === claimed);
        c.classList.remove("pop");
      });
      if (popIndex != null) { void cells[popIndex].offsetWidth; cells[popIndex].classList.add("pop"); }
      count.textContent = claimed + " / 28";
      if (streak) streak.textContent = claimed;
      if (claimed >= 28) { btn.textContent = "Board complete!"; btn.disabled = true; }
      else { btn.textContent = "Claim day " + (claimed + 1); btn.disabled = false; }
    }

    btn.addEventListener("click", function () {
      if (claimed >= 28) return;
      var day = claimed + 1;
      claimed = day;
      store("pixmmo-cal", claimed);
      render(day - 1);
      toast(special[day] ? special[day].msg : "Day " + day + ": " + normal[(day - 1) % normal.length].lbl + " claimed");
    });
    $("#reset-btn").addEventListener("click", function () {
      claimed = 0; store("pixmmo-cal", 0); render(); toast("A new month, a fresh board");
    });
    render();
  }

  /* ---------- Quest reroll demo ---------- */
  var reroll = $("#reroll-btn");
  if (reroll) {
    var pool = [
      ["Win 3 arena fights", "0 / 3"], ["Collect 40 resources", "0 / 40"], ["Feed a pet", "0 / 1"],
      ["Use a potion", "0 / 1"], ["Visit a player's town", "0 / 1"], ["Attack the raid boss", "0 / 1"]
    ];
    reroll.addEventListener("click", function () {
      var q = $$(".quest-board .quest")[2];
      var pick = pool[Math.floor(Math.random() * pool.length)];
      $("b", q).textContent = pick[0];
      $("small", q).textContent = pick[1];
      reroll.disabled = true;
      reroll.textContent = "Reroll used";
      toast("Quest rerolled: " + pick[0]);
    });
  }

  /* ---------- Snow (Christmas page) ---------- */
  var snow = $(".snow");
  if (snow && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    for (var i = 0; i < 46; i++) {
      var f = document.createElement("i");
      var size = 3 + Math.floor(Math.random() * 3) * 2;
      f.style.left = Math.random() * 100 + "vw";
      f.style.width = f.style.height = size + "px";
      f.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2);
      f.style.animationDuration = (8 + Math.random() * 12).toFixed(1) + "s";
      f.style.animationDelay = (-Math.random() * 20).toFixed(1) + "s";
      f.style.setProperty("--drift", (Math.random() * 80 - 40).toFixed(0) + "px");
      snow.appendChild(f);
    }
  }

  var xmasCd = $("#xmas-countdown");
  if (xmasCd) {
    var xt = Date.parse(xmasCd.getAttribute("data-target"));
    if (xt <= Date.now()) {
      xmasCd.style.display = "none";
      var live = $("#xmas-live");
      if (live) live.hidden = false;
    } else {
      startCountdown(xmasCd, xt, function () { location.reload(); });
    }
  }
})();
