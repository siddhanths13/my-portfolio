/* =========================================================
   LifeLink — Blood & Organ Donation Network
   Vanilla JS. localStorage only. No frameworks.
   ========================================================= */

const LS_DONORS = "lifelink_donors";
const LS_REQUESTS = "lifelink_requests";
const LS_PLEDGES = "lifelink_pledges";

/* ---------- small helpers ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function bloodGroupSafe(group) {
  return /^(A|B|AB|O)[+-]$/.test(group) ? group : "O+";
}

/* =========================================================
   SEED DATA — a few donors & requests so the page
   never looks empty on first open.
   ========================================================= */
function seed() {
  if (readLS(LS_DONORS, null)) return;

const donors = [
    { name: "Donor One", age: 24, group: "O-", city: "Bangalore", phone: "9845012345", last: "2024-11-02", urgent: true, id: uid() },
    { name: "Donor Two", age: 31, group: "A+", city: "Bangalore", phone: "9900123456", last: "2024-12-18", urgent: false, id: uid() },
    { name: "Donor Three", age: 27, group: "B+", city: "Mysore", phone: "9741123456", last: "2025-01-05", urgent: true, id: uid() },
    { name: "Donor Four", age: 29, group: "O+", city: "Bangalore", phone: "9886011223", last: "2024-10-30", urgent: false, id: uid() },
    { name: "Donor Five", age: 22, group: "AB+", city: "Chennai", phone: "9597012345", last: "", urgent: false, id: uid() },
    { name: "Donor Six", age: 35, group: "B-", city: "Mangalore", phone: "9731212121", last: "2024-09-12", urgent: false, id: uid() },
    { name: "Donor Seven", age: 26, group: "A-", city: "Bangalore", phone: "9845098765", last: "2025-02-01", urgent: true, id: uid() },
    { name: "Donor Eight", age: 33, group: "O-", city: "Hyderabad", phone: "9912345678", last: "2024-08-22", urgent: false, id: uid() }
  ];
  writeLS(LS_DONORS, donors);

  const now = Date.now();
  const requests = [
    {
      group: "O-", hospital: "Aster CMI, Hebbal", patient: "Patient One",
      phone: "9845011111", note: "Need 2 units for cardiac surgery, tomorrow morning.",
      id: uid(), created: now - 5 * 3600 * 1000
    },
    {
      group: "B+", hospital: "Fortis, Cunningham Rd", patient: "Patient Two",
      phone: "9845022222", note: "Dengue patient, platelet + whole blood needed.",
      id: uid(), created: now - 20 * 3600 * 1000
    },
    {
      group: "AB-", hospital: "Manipal, Old Airport Rd", patient: "",
      phone: "9845033333", note: "Rare group. Any help appreciated, urgent.",
      id: uid(), created: now - 2 * 3600 * 1000
    }
  ];
  writeLS(LS_REQUESTS, requests);

  writeLS(LS_PLEDGES, [
    { name: "Donor Four", age: 29, organs: ["Kidneys", "Liver", "Corneas"], city: "Bangalore", id: uid() },
    { name: "Donor Two", age: 31, organs: ["Any organ needed"], city: "Bangalore", id: uid() }
  ]);
}

/* =========================================================
   STATE
   ========================================================= */
let donors = readLS(LS_DONORS, []);
let requests = readLS(LS_REQUESTS, []);
let pledges = readLS(LS_PLEDGES, []);

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/* =========================================================
   TOAST
   ========================================================= */
const toastEl = document.getElementById("toast");
let toastTimer = null;

function toast(message, icon) {
  toastEl.innerHTML = `<i class="fas ${icon || "fa-heartbeat"}"></i> ${message}`;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
}

/* =========================================================
   RENDER: donor grid
   ========================================================= */
const donorGrid = document.getElementById("donorGrid");
const donorCount = document.getElementById("donorCount");

function renderDonors(filterGroup = "", filterCity = "") {
  const cityQ = filterCity.trim().toLowerCase();
  const list = donors.filter((d) => {
    const groupMatch = filterGroup ? d.group === filterGroup : true;
    const cityMatch = cityQ ? (d.city || "").toLowerCase().includes(cityQ) : true;
    return groupMatch && cityMatch;
  });

  donorCount.textContent = list.length
    ? `${list.length} donor${list.length > 1 ? "s" : ""} found`
    : "No donors match that filter yet.";

  if (!list.length) {
    donorGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p><strong>No matches right now.</strong><br>
        Try a different blood group or city — or register and be the one someone finds.</p>
      </div>`;
    return;
  }

  donorGrid.innerHTML = list
    .map((d) => {
      const lastInfo = d.last
        ? `Last donated ${new Date(d.last + "-01").toLocaleString("en-IN", { month: "short", year: "numeric" })}`
        : "Never donated yet";
      return `
      <div class="donor-card">
        <div class="donor-top">
          <div class="donor-avatar">${initials(d.name)}</div>
          <span class="blood-badge">${bloodGroupSafe(d.group)}</span>
        </div>
        <div>
          <div class="donor-name">${d.name}</div>
          <div class="donor-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${d.city}</span>
            <span><i class="fas fa-phone-alt"></i> ${d.phone}</span>
            <span><i class="fas fa-calendar-alt"></i> ${lastInfo}</span>
          </div>
        </div>
        ${d.urgent ? '<span class="urgency"><i class="fas fa-bolt"></i> Reachable now</span>' : ""}
        <button class="btn btn-ghost" onclick="callDonor('${d.phone}')">
          <i class="fas fa-phone-alt"></i> Contact
        </button>
      </div>`;
    })
    .join("");
}

function callDonor(phone) {
  toast(`Calling ${phone}`, "fa-phone-alt");
}

/* =========================================================
   RENDER: request list
   ========================================================= */
const requestList = document.getElementById("requestList");

function timeLeft(created) {
  const remaining = 48 * 3600 * 1000 - (Date.now() - created);
  if (remaining <= 0) return "Expired";
  const h = Math.floor(remaining / 3600 / 1000);
  const m = Math.floor((remaining % (3600 * 1000)) / 60000);
  return h >= 1 ? `${h}h ${m}m left` : `${m} min left`;
}

function renderRequests() {
  const active = requests
    .filter((r) => Date.now() - r.created < 48 * 3600 * 1000)
    .sort((a, b) => a.created - b.created);
  const expired = requests
    .filter((r) => Date.now() - r.created >= 48 * 3600 * 1000);

  const activeHtml = active.map((r) => requestCard(r, false)).join("");
  const expiredHtml = expired.slice(-3).map((r) => requestCard(r, true)).join("");

  requestList.innerHTML =
    (activeHtml || `<div class="empty-state"><i class="fas fa-check-circle"></i>
      <p><strong>No active requests.</strong><br>Good news — but keep your details updated.</p></div>`) +
    (expiredHtml ? `<div style="margin-top:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#b98a4a;">Closed requests</div>` + expiredHtml : "");
}

function requestCard(r, isExpired) {
  return `
    <div class="request-card${isExpired ? " expired" : ""}">
      <div class="request-head">
        <span class="blood-badge">${bloodGroupSafe(r.group)}</span>
        <span class="time-left"><i class="fas fa-hourglass-half"></i> ${isExpired ? "Expired" : timeLeft(r.created)}</span>
      </div>
      <div class="request-title">${r.hospital}</div>
      ${r.patient ? `<p><strong>Patient:</strong> ${r.patient}</p>` : ""}
      ${r.note ? `<p>${r.note}</p>` : ""}
      <div class="request-meta">
        <span><i class="fas fa-phone-alt"></i> ${r.phone}</span>
        <span><i class="fas fa-clock"></i> Posted ${new Date(r.created).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })}</span>
      </div>
      <div class="request-foot">
        <span style="font-size:12px;color:var(--ink-soft);">Can you help?</span>
        <button class="btn ${isExpired ? "btn-ghost" : "btn-primary"}" ${isExpired ? "" : `onclick="helpRequest('${r.id}')"`}>
          <i class="fas fa-hands-helping"></i> I can help
        </button>
      </div>
    </div>`;
}

function helpRequest(id) {
  const r = requests.find((x) => x.id === id);
  if (!r) return;
  const d = donors.find((x) => x.group === r.group);
  if (d) {
    toast(`Request shared. ${d.name} (${d.group}, ${d.city}) is nearby — call ${d.phone}.`, "fa-hands-helping");
  } else {
    toast(`Thanks! We've noted your offer for ${r.group} at ${r.hospital}.`, "fa-hands-helping");
  }
}

/* =========================================================
   RENDER: stats
   ========================================================= */
function renderStats() {
  // strip counts
  document.getElementById("stripDonors").textContent = donors.length;
  document.getElementById("stripRequests").textContent = requests.filter((r) => Date.now() - r.created < 48 * 3600 * 1000).length;
  document.getElementById("stripPledges").textContent = pledges.length;
  document.getElementById("stripCities").textContent = new Set(donors.map((d) => d.city.toLowerCase())).size;

  // blood chart
  const chart = document.getElementById("bloodChart");
  const counts = bloodGroups.map((g) => donors.filter((d) => d.group === g).length);
  const max = Math.max(...counts, 1);
  chart.innerHTML = bloodGroups
    .map((g, i) => `
      <div class="bar-row">
        <span>${g}</span>
        <div class="bar-track"><div class="bar-fill" data-w="${(counts[i] / max) * 100}"></div></div>
        <span class="bar-val">${counts[i]}</span>
      </div>`)
    .join("");

  // city list
  const cityMap = {};
  donors.forEach((d) => {
    const c = (d.city || "Unknown").trim();
    cityMap[c] = (cityMap[c] || 0) + 1;
  });
  const cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const cityMax = cities.length ? cities[0][1] : 1;
  const cityList = document.getElementById("cityList");
  cityList.innerHTML = cities.length
    ? cities
        .map(([c, n]) => `
          <div class="city-row">
            <div class="city-track"><div class="city-fill" data-w="${(n / cityMax) * 100}"></div></div>
            <small>${c} · ${n}</small>
          </div>`)
        .join("")
    : `<p style="font-size:14px;color:var(--ink-soft);">No donors registered yet — be the first.</p>`;

  // animate bars shortly after
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll(".bar-fill, .city-fill").forEach((el) => {
        el.style.width = el.getAttribute("data-w") + "%";
      });
    }, 120);
  });
}

/* =========================================================
   FORMS
   ========================================================= */

/* --- Donor registration --- */
const donorForm = document.getElementById("donorForm");
const donorFormNote = document.getElementById("donorFormNote");

donorForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("dName").value.trim();
  const age = parseInt(document.getElementById("dAge").value, 10);
  const group = document.getElementById("dGroup").value;
  const city = document.getElementById("dCity").value.trim();
  const phone = document.getElementById("dPhone").value.trim();
  const last = document.getElementById("dLast").value;

  if (age < 18 || age > 65) {
    donorFormNote.textContent = "Donors must be 18–65 years old.";
    donorFormNote.className = "form-note err";
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    donorFormNote.textContent = "Enter a valid 10-digit phone number.";
    donorFormNote.className = "form-note err";
    return;
  }
  if (donors.some((d) => d.phone === phone)) {
    donorFormNote.textContent = "This phone number is already registered.";
    donorFormNote.className = "form-note err";
    return;
  }

  donors.push({ name, age, group, city, phone, last, urgent: true, id: uid() });
  writeLS(LS_DONORS, donors);
  donorForm.reset();
  donorFormNote.textContent = `Welcome aboard, ${name.split(" ")[0]}! You're now in the network.`;
  donorFormNote.className = "form-note ok";
  toast(`Registered as ${group} donor in ${city}.`, "fa-tint");
  renderDonors();
  renderStats();
  renderRequests();
});

/* --- Emergency request --- */
const requestForm = document.getElementById("requestForm");
const requestFormNote = document.getElementById("requestFormNote");

requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const group = document.getElementById("rGroup").value;
  const hospital = document.getElementById("rHospital").value.trim();
  const patient = document.getElementById("rName").value.trim();
  const phone = document.getElementById("rPhone").value.trim();
  const note = document.getElementById("rNote").value.trim();

  if (!/^[0-9]{10}$/.test(phone)) {
    requestFormNote.textContent = "Enter a valid 10-digit phone number.";
    requestFormNote.className = "form-note err";
    return;
  }
  if (!hospital) {
    requestFormNote.textContent = "Please add the hospital or location.";
    requestFormNote.className = "form-note err";
    return;
  }

  requests.push({ group, hospital, patient, phone, note, id: uid(), created: Date.now() });
  writeLS(LS_REQUESTS, requests);
  requestForm.reset();
  requestFormNote.textContent = "Request posted. It stays live for 48 hours.";
  requestFormNote.className = "form-note ok";
  toast(`Request for ${group} posted at ${hospital}.`, "fa-siren");
  renderRequests();
  renderStats();
});

/* --- Organ pledge --- */
const organForm = document.getElementById("organForm");
const organFormNote = document.getElementById("organFormNote");

organForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("oName").value.trim();
  const age = parseInt(document.getElementById("oAge").value, 10);
  const city = document.getElementById("oCity").value.trim();
  const organs = Array.from(
    document.querySelectorAll('.organ-options input[type="checkbox"]:checked')
  ).map((c) => c.value);

  if (!name || !age || !city) {
    organFormNote.textContent = "Please fill in all the details.";
    organFormNote.className = "form-note err";
    return;
  }
  if (!organs.length) {
    organFormNote.textContent = "Select at least one organ to pledge.";
    organFormNote.className = "form-note err";
    return;
  }

  pledges.push({ name, age, organs, city, id: uid() });
  writeLS(LS_PLEDGES, pledges);
  organForm.reset();
  organFormNote.textContent = `Thank you, ${name.split(" ")[0]}. Your pledge can save lives.`;
  organFormNote.className = "form-note ok";
  toast(`Organ pledge recorded for ${organs.length} item(s).`, "fa-heart");
  renderStats();
});

/* =========================================================
   FILTERS
   ========================================================= */
document.getElementById("filterBtn").addEventListener("click", () => {
  const g = document.getElementById("fGroup").value;
  const c = document.getElementById("fCity").value;
  renderDonors(g, c);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("fGroup").value = "";
  document.getElementById("fCity").value = "";
  renderDonors();
});

/* =========================================================
   NAV
   ========================================================= */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("open");
  mainNav.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach((a) => {
  a.addEventListener("click", () => {
    navToggle.classList.remove("open");
    mainNav.classList.remove("open");
  });
});

/* =========================================================
   INIT
   ========================================================= */
document.getElementById("year").textContent = new Date().getFullYear();
seed();

// reload state from storage (seed may have written)
donors = readLS(LS_DONORS, []);
requests = readLS(LS_REQUESTS, []);
pledges = readLS(LS_PLEDGES, []);

renderDonors();
renderRequests();
renderStats();

// keep stats fresh
setInterval(() => {
  requests = readLS(LS_REQUESTS, []);
  renderRequests();
  renderStats();
}, 30000);

