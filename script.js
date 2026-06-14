const teams = [
  {
    name: "G5/E2",
    fullName: "Soluções de Gestão de TI",
    code: "E2",
    folder: "g5-e2",
    badge: "E2",
    group: "G5",
    style: "Gestao",
    phrase: "Soluções de Gestão de TI reune o elenco de planejamento, controle e evolução dos serviços digitais.",
    colors: ["#1455d9", "#18b76f"],
    stickerStart: 1,
    players: 12,
    coach: 1,
    order: [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1],
  },
  {
    name: "G5/E3",
    fullName: "Serviços de Autenticação",
    code: "E3",
    folder: "g5-e3",
    badge: "E3",
    group: "G5",
    style: "Seguranca",
    phrase: "Serviços de Autenticação entra no album com identidade forte, foco em acesso seguro e operação confiável.",
    colors: ["#213a8f", "#e23d55"],
    stickerStart: 1,
    players: 13,
    coach: 1,
    order: [3, 4, 0, 2, 1, 3, 4, 0, 2, 1, 3, 4, 0],
  },
  {
    name: "G5/E4",
    fullName: "Soluções SWIFT e Sisredex",
    code: "E4",
    folder: "g5-e4",
    badge: "E4",
    group: "G5",
    style: "Integracao",
    phrase: "Soluções SWIFT e Sisredex fecha a primeira leva com uma pagina de integração, performance e precisão.",
    colors: ["#6d2aa3", "#e3b341"],
    stickerStart: 1,
    players: 9,
    coach: 1,
    order: [2, 0, 4, 1, 3, 2, 0, 4, 1],
  },
];

const albumBook = document.querySelector("#albumBook");
const teamTabs = document.querySelector("#teamTabs");
const leftStickerGrid = document.querySelector("#leftStickerGrid");
const rightStickerGrid = document.querySelector("#rightStickerGrid");
const progressFill = document.querySelector("#progressFill");
const stickerModal = document.querySelector("#stickerModal");
const modalStickerFrame = document.querySelector("#modalStickerFrame");
const modalStickerNumber = document.querySelector("#modalStickerNumber");
const modalStickerName = document.querySelector("#modalStickerName");
const modalStickerRole = document.querySelector("#modalStickerRole");
const closeStickerModal = document.querySelector("#closeStickerModal");

const fields = {
  teamCode: document.querySelector("#teamCode"),
  teamName: document.querySelector("#teamName"),
  teamBadge: document.querySelector("#teamBadge"),
  teamPhrase: document.querySelector("#teamPhrase"),
  teamGroup: document.querySelector("#teamGroup"),
  teamStyle: document.querySelector("#teamStyle"),
  teamCount: document.querySelector("#teamCount"),
  shieldNumber: document.querySelector("#shieldNumber"),
  shieldEmblem: document.querySelector("#shieldEmblem"),
  shieldLabel: document.querySelector("#shieldLabel"),
  stickerRange: document.querySelector("#stickerRange"),
  leftPageNumber: document.querySelector("#leftPageNumber"),
  rightPageNumber: document.querySelector("#rightPageNumber"),
  pageStatus: document.querySelector("#pageStatus"),
};

let activeTeam = 0;
let featuredSticker = 0;
let stickerManifest = window.STICKER_MANIFEST || {};

function padNumber(value) {
  return String(value).padStart(3, "0");
}

function stickerEntry(team, number, fallbackName) {
  const key = padNumber(number);
  const entry = stickerManifest[team.folder]?.[key];

  if (entry) {
    return {
      exists: true,
      image: `figurinhas/${team.folder}/${encodeURIComponent(entry.file)}`,
      name: entry.name || fallbackName,
    };
  }

  return {
    exists: false,
    image: "",
    name: fallbackName,
  };
}

function fallbackArt(sticker, team) {
  if (sticker.type === "team-photo") {
    return `
      <div class="missing-sticker missing-team-photo">
        <span>${padNumber(sticker.number)}</span>
        <strong>Foto da equipe</strong>
        <small>Imagem pendente</small>
      </div>
    `;
  }

  return `
    <div class="missing-sticker">
      <span>${padNumber(sticker.number)}</span>
      <strong>Figurinha faltante</strong>
      <small>${sticker.name}</small>
    </div>
  `;
}

function imageWithFallback(sticker, team) {
  if (!sticker.exists) return fallbackArt(sticker, team);

  return `
    <img src="${sticker.image}" alt="Figurinha de ${sticker.name}" data-fallback-image>
    <div hidden data-fallback-art>${fallbackArt(sticker, team)}</div>
  `;
}

function showFallbackImage(image) {
  const fallback = image.nextElementSibling;
  image.hidden = true;
  if (fallback) fallback.hidden = false;
}

function activateImageFallbacks(root) {
  root.querySelectorAll("[data-fallback-image]").forEach((image) => {
    image.addEventListener("error", () => showFallbackImage(image), { once: true });
    image.addEventListener("load", () => {
      const fallback = image.nextElementSibling;
      image.hidden = false;
      if (fallback) fallback.hidden = true;
    }, { once: true });

    if (image.complete && image.naturalWidth === 0) showFallbackImage(image);
  });
}

function teamStickers(team) {
  const playerCards = Array.from({ length: team.players }, (_, index) => {
    const number = team.stickerStart + index + 2;
    const entry = stickerEntry(team, number, `Jogador ${index + 1}`);

    return {
      name: entry.name,
      role: `Jogador ${index + 1}`,
      number,
      exists: entry.exists,
      image: entry.image,
    };
  });

  const teamPhotoNumber = team.stickerStart + 1;
  const teamPhotoEntry = stickerEntry(team, teamPhotoNumber, "Foto da equipe");
  const coachNumber = team.stickerStart + team.players + 2;
  const coachEntry = stickerEntry(team, coachNumber, `Treinador ${team.name}`);

  return [
    {
      type: "team-photo",
      name: teamPhotoEntry.name,
      role: "Equipe completa",
      number: teamPhotoNumber,
      exists: teamPhotoEntry.exists,
      image: teamPhotoEntry.image,
    },
    ...playerCards,
    {
      name: coachEntry.name,
      role: "Treinador",
      number: coachNumber,
      exists: coachEntry.exists,
      image: coachEntry.image,
    },
  ];
}

function renderTabs() {
  teamTabs.innerHTML = teams
    .map(
      (team, index) => `
        <button class="team-tab ${index === activeTeam ? "is-active" : ""}" type="button" data-team="${index}" aria-pressed="${index === activeTeam}">
          ${team.name}
        </button>
      `,
    )
    .join("");
}

function renderStickerImage(sticker, team) {
  return imageWithFallback(sticker, team);
}


function renderStickerCard(sticker, team, index) {
  return `
    <button class="sticker-card ${sticker.type ? `sticker-card-${sticker.type}` : ""} ${index === featuredSticker ? "is-featured" : ""}" type="button" data-sticker="${index}">
      <div class="sticker-image">
        ${renderStickerImage(sticker, team)}
      </div>
      <div class="sticker-meta">
        <span class="sticker-number">${padNumber(sticker.number)}</span>
        <span class="sticker-name">${sticker.name}</span>
        <span class="sticker-role">${team.name} - ${sticker.role}</span>
      </div>
    </button>
  `;
}

function renderTeam(shouldAnimate = true, direction = "next") {
  const team = teams[activeTeam];
  const stickers = teamStickers(team);
  const firstNumber = team.stickerStart;
  const lastNumber = stickers[stickers.length - 1].number;
  const leftPage = activeTeam * 2 + 2;
  const rightPage = leftPage + 1;

  document.documentElement.style.setProperty("--team-primary", team.colors[0]);
  document.documentElement.style.setProperty("--team-secondary", team.colors[1]);

  fields.teamCode.textContent = team.code;
  fields.teamName.textContent = team.name;
  fields.teamBadge.textContent = team.badge;
  fields.teamPhrase.textContent = team.phrase;
  fields.teamGroup.textContent = team.group;
  fields.teamStyle.textContent = team.style;
  fields.teamCount.textContent = `${team.players + team.coach + 2} no total`;
  fields.shieldNumber.textContent = padNumber(team.stickerStart);
  const shieldEntry = stickerEntry(team, team.stickerStart, team.badge);
  fields.shieldEmblem.innerHTML = shieldEntry.exists
    ? `<img src="${shieldEntry.image}" alt="Escudo ${team.name}" data-fallback-image><span hidden data-fallback-art>${team.badge}</span>`
    : `<span>${team.badge}</span>`;
  fields.shieldLabel.textContent = `Escudo - ${team.fullName}`;
  fields.stickerRange.textContent = `${padNumber(firstNumber)}-${padNumber(lastNumber)}`;
  fields.leftPageNumber.textContent = String(leftPage).padStart(2, "0");
  fields.rightPageNumber.textContent = String(rightPage).padStart(2, "0");
  fields.pageStatus.textContent = `Pagina ${activeTeam + 1} de ${teams.length}`;
  progressFill.style.width = `${((activeTeam + 1) / teams.length) * 100}%`;

  const leftCount = Math.min(4, stickers.length - 1);
  const leftStickers = stickers.slice(1, leftCount + 1);
  const rightStickers = [stickers[0], ...stickers.slice(leftCount + 1)];

  leftStickerGrid.innerHTML = leftStickers
    .map((sticker, index) => renderStickerCard(sticker, team, index + 1))
    .join("");

  rightStickerGrid.innerHTML = rightStickers
    .map((sticker, index) => renderStickerCard(sticker, team, index === 0 ? 0 : index + leftCount))
    .join("");

  activateImageFallbacks(leftStickerGrid);
  activateImageFallbacks(rightStickerGrid);
  activateImageFallbacks(fields.shieldEmblem);

  renderTabs();

  if (shouldAnimate) {
    albumBook.classList.remove("is-turning-next", "is-turning-prev");
    window.requestAnimationFrame(() => {
      albumBook.classList.add(direction === "prev" ? "is-turning-prev" : "is-turning-next");
    });
  }
}


function openStickerModal(index) {
  const team = teams[activeTeam];
  const sticker = teamStickers(team)[index];
  if (!sticker) return;

  modalStickerFrame.innerHTML = renderStickerImage(sticker, team);
  activateImageFallbacks(modalStickerFrame);
  modalStickerFrame.className = `modal-sticker-frame ${sticker.type ? `modal-sticker-${sticker.type}` : ""}`;
  modalStickerNumber.textContent = padNumber(sticker.number);
  modalStickerName.textContent = sticker.name;
  modalStickerRole.textContent = `${team.name} - ${sticker.role}`;
  stickerModal.classList.add("is-open");
  stickerModal.setAttribute("aria-hidden", "false");
  closeStickerModal.focus();
}

function closeModal() {
  stickerModal.classList.remove("is-open");
  stickerModal.setAttribute("aria-hidden", "true");
}

function setTeam(index) {
  const direction = index < activeTeam ? "prev" : "next";
  activeTeam = (index + teams.length) % teams.length;
  featuredSticker = 0;
  renderTeam(true, direction);
}

document.querySelector("#prevTeam").addEventListener("click", () => {
  setTeam(activeTeam - 1);
});

document.querySelector("#nextTeam").addEventListener("click", () => {
  setTeam(activeTeam + 1);
});

document.querySelector("#shuffleSticker").addEventListener("click", () => {
  featuredSticker = (featuredSticker + 1) % teamStickers(teams[activeTeam]).length;
  renderTeam(false);
});

teamTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-team]");
  if (!button) return;
  setTeam(Number(button.dataset.team));
});

function handleStickerClick(event) {
  const card = event.target.closest("[data-sticker]");
  if (!card) return;
  featuredSticker = Number(card.dataset.sticker);
  renderTeam(false);
  openStickerModal(featuredSticker);
}

leftStickerGrid.addEventListener("click", handleStickerClick);
rightStickerGrid.addEventListener("click", handleStickerClick);

closeStickerModal.addEventListener("click", closeModal);

stickerModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && stickerModal.classList.contains("is-open")) closeModal();
  if (stickerModal.classList.contains("is-open")) return;
  if (event.key === "ArrowLeft") setTeam(activeTeam - 1);
  if (event.key === "ArrowRight") setTeam(activeTeam + 1);
});

renderTeam(false);

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (stickerModal.classList.contains("is-open")) return;
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;
  if (deltaX < 0) setTeam(activeTeam + 1);
  else setTeam(activeTeam - 1);
}, { passive: true });
