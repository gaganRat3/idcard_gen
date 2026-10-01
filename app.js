/* =============================================================
   BhudevMatrimony — ID Card Generator  app.js
   Flow:  Front entry → Back entry → Save → (Add More | PDF)
   PDF:   8 front cards (Page 1)  +  8 back cards (Page 2)
   ============================================================= */
"use strict";

// ─── State ────────────────────────────────────────────────────
const MAX_CARDS = 8;

const savedCards = []; // array of { front:{...}, back:{...}, photo: dataUrl }

let draft = freshDraft();

function freshDraft() {
  return {
    name: "",
    memberId: "",
    dob: "",
    location: "",
    email: "",
    mobile: "",
    staffName: "",
    staffMobile: "",
    photo: null,
  };
}

// ─── DOM refs ─────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// Front inputs
const iName = $("inputName");
const iMemId = $("inputMemberId");
const iDob = $("inputDob");
const iLoc = $("inputLocation");
const iEmail = $("inputEmail");
const iMobile = $("inputMobile");

// Back inputs
const iStaff = $("inputStaffName");
const iStaffMob = $("inputStaffMobile");

// Views
const stepFront = $("stepFront");
const stepBack = $("stepBack");

// ─── Initialize ───────────────────────────────────────────────
function init() {
  buildSlots();
  updateProgress();
  updateSlots();
}

// ─── Build 8 progress slots ───────────────────────────────────
function buildSlots() {
  const row = $("slotsRow");
  row.innerHTML = "";
  for (let i = 0; i < MAX_CARDS; i++) {
    const s = document.createElement("div");
    s.className = "slot";
    s.id = `slot-${i}`;
    s.innerHTML = `<span class="slot-num">${i + 1}</span>`;
    row.appendChild(s);
  }
}

function updateSlots() {
  for (let i = 0; i < MAX_CARDS; i++) {
    const s = $(`slot-${i}`);
    if (!s) continue;
    const filled = i < savedCards.length;
    const current = i === savedCards.length;
    s.classList.toggle("filled", filled);
    s.classList.toggle("active", current && !filled);
    if (filled) {
      s.innerHTML = `<span class="slot-check">✅</span><span class="slot-num">${i + 1}</span>`;
    } else {
      s.innerHTML = `<span class="slot-num">${i + 1}</span>`;
    }
  }
}

function updateProgress(step = "front") {
  const num = savedCards.length + 1;
  $("progressText").innerHTML =
    `Card <strong>${Math.min(num, MAX_CARDS)}</strong> of ${MAX_CARDS}`;
  const badge = $("stepBadge");
  if (step === "front") {
    badge.textContent = "FRONT SIDE";
    badge.classList.remove("back");
  } else {
    badge.textContent = "BACK SIDE";
    badge.classList.add("back");
  }
}

// ─── Photo upload ─────────────────────────────────────────────
$("photoInput").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;
  draft.photo = await readFileAsDataURL(file);
  const prev = $("photoPreview");
  prev.src = draft.photo;
  prev.style.display = "block";
  $("photoPlaceholder").style.display = "none";
});

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─── Next: Front → Back ───────────────────────────────────────
$("btnNextToBack").addEventListener("click", () => {
  const name = iName.value.trim();
  const memId = iMemId.value.trim();
  if (!name) {
    alert("Please enter the candidate name.");
    iName.focus();
    return;
  }
  if (!memId) {
    alert("Please enter Member ID.");
    iMemId.focus();
    return;
  }

  // Save front draft
  draft.name = name;
  draft.memberId = memId;
  draft.dob = formatDOB(iDob.value);
  draft.location = iLoc.value.trim() || "—";
  draft.email = iEmail.value.trim() || "—";
  draft.mobile = iMobile.value.trim() || "—";

  // Switch to back step
  stepFront.style.display = "none";
  stepBack.style.display = "flex";
  $("afterSaveActions").style.display = "none";
  updateProgress("back");
});

// ─── Back: Go back to front ───────────────────────────────────
$("btnGoBack").addEventListener("click", () => {
  stepBack.style.display = "none";
  stepFront.style.display = "flex";
  updateProgress("front");
});

// ─── Save card ────────────────────────────────────────────────
$("btnSaveCard").addEventListener("click", () => {
  draft.staffName = iStaff.value.trim();
  draft.staffMobile = iStaffMob.value.trim();

  savedCards.push({ ...draft });

  const count = savedCards.length;
  $("savedCardNum").textContent = count;
  $("pdfCount").textContent = `(${count} card${count > 1 ? "s" : ""})`;

  const addBtn = $("btnAddAnother");
  if (count < MAX_CARDS) {
    $("nextCardNum").textContent = count + 1;
    addBtn.style.display = "inline-flex";
  } else {
    addBtn.style.display = "none";
  }

  $("afterSaveActions").style.display = "flex";
  $("btnSaveCard").style.display = "none";
  $("btnGoBack").style.display = "none";
});

// ─── Add another card ─────────────────────────────────────────
$("btnAddAnother").addEventListener("click", () => {
  // Reset draft
  draft = freshDraft();

  // Clear front inputs
  iName.value = "";
  iMemId.value = "";
  iDob.value = "";
  iLoc.value = "";
  iEmail.value = "";
  iMobile.value = "";

  // Clear photo
  $("photoInput").value = "";
  $("photoPreview").src = "";
  $("photoPreview").style.display = "none";
  $("photoPlaceholder").style.display = "flex";

  // Clear back inputs
  iStaff.value = "";
  iStaffMob.value = "";

  // Reset back step UI
  $("afterSaveActions").style.display = "none";
  $("btnSaveCard").style.display = "inline-flex";
  $("btnGoBack").style.display = "inline-flex";

  // Go to front step
  stepBack.style.display = "none";
  stepFront.style.display = "flex";

  updateProgress("front");
  updateSlots();
});

// ─── Format date ──────────────────────────────────────────────
function formatDOB(raw) {
  if (!raw) return "—";
  const [y, m, d] = raw.split("-");
  return `${d}-${m}-${y}`;
}

function esc(s) {
  if (!s || s === "—") return "—";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function setLoading(on) {
  $("loadingOverlay").classList.toggle("active", on);
}

// ─── Wait for images ──────────────────────────────────────────
function waitForImages(container) {
  return Promise.all(
    [...container.querySelectorAll("img")].map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise((r) => {
            img.onload = r;
            img.onerror = r;
          }),
    ),
  );
}

// ─── Build PDF card elements ──────────────────────────────────

function makeLogoBar(cls = "pdf-logo-bar") {
  const bar = document.createElement("div");
  bar.className = cls;
  [
    ["images/bhudevmatrimony.png", "BhudevMatrimony"],
    ["images/bhudev.png", "BHUDEV"],
    ["images/NRI_Matrimony.png", "NRI Matrimony"],
  ].forEach(([src, alt]) => {
    const img = document.createElement("img");
    img.className = "pdf-logo-img";
    img.src = src;
    img.alt = alt;
    bar.appendChild(img);
  });
  return bar;
}

function buildPdfFrontCard(card) {
  const wrap = document.createElement("div");
  wrap.className = "pdf-card-exact ec-front";

  // Static backgrounds scaled to the portrait card ratio used on screen.
  wrap.innerHTML = `
    <img src="images/top.png" alt="" style="position: absolute; top: 0; left: -7.5%; width: 115%; height: 335px; object-fit: fill; z-index: 0; pointer-events: none;">
    <img src="images/bottom.png" alt="" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 112px; object-fit: fill; z-index: 0; pointer-events: none;">
  `;

  // Logos over background
  const lb = document.createElement("div");
  lb.className = "ec-logo-bar";
  lb.innerHTML = `
    <img src="images/bhudevmatrimony.png" alt="BhudevMatrimony" class="ec-logo">
    <img src="images/bhudev.png" alt="BHUDEV" class="ec-logo">
    <img src="images/NRI_Matrimony.png" alt="NRI Matrimony" class="ec-logo">
  `;
  wrap.appendChild(lb);

  // Header text over background
  const hs = document.createElement("div");
  hs.className = "ec-header-strip";
  hs.textContent = "BhudevMatrimony.com";
  wrap.appendChild(hs);

  // Photo
  const pa = document.createElement("div");
  pa.className = "ec-photo-area";

  const pf = document.createElement("div");
  pf.className = "ec-photo-frame";
  if (card.photo) {
    const img = document.createElement("img");
    img.className = "ec-photo-img";
    img.src = card.photo;
    pf.appendChild(img);
  } else {
    const em = document.createElement("div");
    em.className = "ec-photo-placeholder";
    em.innerHTML = '<span style="font-size:3.5rem;">👤</span>';
    pf.appendChild(em);
  }
  pa.appendChild(pf);
  wrap.appendChild(pa);

  // Name label
  const nl = document.createElement("div");
  nl.className = "ec-name-label";
  nl.innerHTML = "-\u200A:\u200A NAME OF CANDIDATE \u200A:\u200A-";
  wrap.appendChild(nl);

  // Name
  const ne = document.createElement("div");
  ne.className = "ec-name-input";
  ne.textContent = card.name;
  wrap.appendChild(ne);

  // Details
  const det = document.createElement("div");
  det.className = "ec-details";
  det.innerHTML = `
    <div class="ec-row"><span class="ec-key">Member ID :</span><span class="ec-val">${esc(card.memberId)}</span></div>
    <div class="ec-row"><span class="ec-key">D.O.B :</span><span class="ec-val">${esc(card.dob)}</span></div>
    <div class="ec-row"><span class="ec-key">Current Location :</span><span class="ec-val">${esc(card.location)}</span></div>
    <div class="ec-row"><span class="ec-key">Email id :</span><span class="ec-val">${esc(card.email)}</span></div>
    <div class="ec-row"><span class="ec-key">Mobile No :</span><span class="ec-val">${esc(card.mobile)}</span></div>
  `;
  wrap.appendChild(det);

  return wrap;
}

function buildPdfBackCard(card) {
  const wrap = document.createElement("div");
  wrap.className = "pdf-card-exact ec-back";

  // Logo bar
  const lb = document.createElement("div");
  lb.className = "ec-logo-bar";
  lb.innerHTML = `
    <img src="images/bhudevmatrimony.png" alt="BhudevMatrimony" class="ec-logo">
    <img src="images/bhudev.png" alt="BHUDEV" class="ec-logo">
    <img src="images/NRI_Matrimony.png" alt="NRI Matrimony" class="ec-logo">
  `;
  wrap.appendChild(lb);

  // Staff rows
  const staffVal = card.staffName
    ? esc(card.staffName)
    : "________________________";
  const mobileVal = card.staffMobile
    ? esc(card.staffMobile)
    : "________________________";

  [
    ["Staff Name :", staffVal],
    ["Mobile No :", mobileVal],
  ].forEach(([label, val]) => {
    const row = document.createElement("div");
    row.className = "ec-staff-row";
    row.innerHTML = `<span class="ec-staff-label">${label}</span><span class="ec-staff-input">${val}</span>`;
    wrap.appendChild(row);
  });

  // Offices (All 3 offices from reference PDF)
  [
    [
      "VADODARA OFFICE",
      `601, 602, 603, 604, A 6th Floor, Galav Chambers, Dairy Den Circle, Sayajiganj Vadodara 390020<br>Mobile No : 9081522111, 9099798986`,
    ],
    [
      "AMDAVAD (NAVRANGPURA) OFFICE",
      `A-703, 7th Floor, Nar – Narayan Complex, Near Swastik Char Rasta, Opp Navrangpura Post office, Navrangpura Amdavad - 380009<br>Mobile No : 9081522111, 9099798986`,
    ],
    [
      "RAJKOT (TRIKON BAUG) OFFICE",
      `336, 3rd Floor, Shri Sadguru Arcade, Dhebar Road (One Way), Besides Jivan Commercial Bank, Trikon Baug, રાજકોટ.<br>Mobile No : 9662912323, 9429090456, 9099798986`,
    ],
  ].forEach(([title, body]) => {
    const b = document.createElement("div");
    b.className = "ec-office";
    b.innerHTML = `
      <div class="ec-office-title">${title}</div>
      <div class="ec-office-body">
        <span class="ec-pin">📍</span>
        <p>${body}</p>
      </div>
    `;
    wrap.appendChild(b);
  });

  // Static Bottom Image
  wrap.insertAdjacentHTML(
    "beforeend",
    `
    <img src="images/bottom.png" alt="" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 112px; object-fit: fill; z-index: 0; pointer-events: none;">
  `,
  );

  return wrap;
}

// ─── Download PDF ─────────────────────────────────────────────
$("btnDownloadPdf").addEventListener("click", async () => {
  if (savedCards.length === 0) {
    alert("No cards saved yet!");
    return;
  }

  setLoading(true);
  await sleep(80);

  try {
    const { jsPDF } = window.jspdf;

    // Build 8 cards (repeat if fewer than 8)
    const frontGrid = $("frontGrid");
    frontGrid.innerHTML = "";
    const backGrid = $("backGrid");
    backGrid.innerHTML = "";

    for (let i = 0; i < 8; i++) {
      const card = savedCards[i % savedCards.length];
      frontGrid.appendChild(buildPdfFrontCard(card));
      backGrid.appendChild(buildPdfBackCard(card));
    }

    const pc = $("pdfContainer");
    pc.style.visibility = "visible";
    await waitForImages(pc);
    await sleep(300);

    const opt = {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fff",
      logging: false,
    };
    const [c1, c2] = await Promise.all([
      html2canvas($("pdfPage1"), opt),
      html2canvas($("pdfPage2"), opt),
    ]);

    pc.style.visibility = "hidden";

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    pdf.addImage(c1.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 297, 210);
    pdf.addPage();
    pdf.addImage(c2.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 297, 210);

    const firstName = savedCards[0].name.replace(/\s+/g, "_");
    pdf.save(`BhudevMatrimony_Cards_${firstName}.pdf`);
  } catch (e) {
    console.error(e);
    alert("PDF generation failed. See browser console.");
  } finally {
    setLoading(false);
  }
});

// ─── Start ────────────────────────────────────────────────────
init();
