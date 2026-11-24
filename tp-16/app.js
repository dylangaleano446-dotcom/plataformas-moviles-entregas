const API_URL = "https://api.tvmaze.com";
const PAGE_SIZE = 24;     // cuántas series se muestran por vez
const MAX_PAGES_PER_CLICK = 4;

const GENRES = [
  { label: "Todas", value: "" },
  { label: "Drama", value: "Drama" },
  { label: "Comedia", value: "Comedy" },
  { label: "Acción", value: "Action" },
  { label: "Ciencia ficción", value: "Science-Fiction" },
  { label: "Crimen", value: "Crime" },
  { label: "Terror", value: "Horror" },
  { label: "Anime", value: "Anime" }
];

const STATUS_NAMES = {
  "Running": "En emisión",
  "Ended": "Finalizada",
  "To Be Determined": "A definir",
  "In Development": "En desarrollo"
};

// ---------- DOM ----------
const grid = document.getElementById("grid");
const summary = document.getElementById("summary");
const categoriesBox = document.getElementById("categories");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const resetBtn = document.getElementById("reset-btn");
const initialSpinner = document.getElementById("initial-spinner");
const errorBox = document.getElementById("error-box");
const errorText = document.getElementById("error-text");
const retryBtn = document.getElementById("retry-btn");
const emptyMsg = document.getElementById("empty");
const loadMoreBtn = document.getElementById("load-more");
const loadMoreSpinner = document.getElementById("load-more-spinner");
const loadMoreLabel = document.getElementById("load-more-label");
const modalEl = document.getElementById("detail-modal");
const modal = new bootstrap.Modal(modalEl);
const detailTitle = document.getElementById("detail-title");
const detailBody = document.getElementById("detail-body");

// ---------- Estado ----------
const state = {
  mode: "browse",     // "browse" = listado general, "search" = resultado de búsqueda
  query: "",
  genre: "",
  all: [],            // series ya descargadas
  byId: {},           // series por id (para el modal)
  apiPage: 0,         // próxima página del listado general
  apiDone: false,     // ya no hay más páginas
  visible: PAGE_SIZE, // cuántas series se muestran
  loading: false,
  requestId: 0
};

// ---------- Utilidades ----------
function escapeHTML(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text === undefined || text === null ? "" : text).replace(/[&<>"']/g, function (c) {
    return map[c];
  });
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return doc.body.textContent.trim();
}

function secureURL(url) {
  return String(url || "").replace("http://", "https://");
}

function posterURL(show, size) {
  if (!show.image) return "";
  return secureURL(show.image[size] || show.image.medium || show.image.original);
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error("La API respondió con el estado " + response.status);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function genreLabel(value) {
  for (let i = 0; i < GENRES.length; i++) {
    if (GENRES[i].value === value) return GENRES[i].label;
  }
  return value;
}

// ---------- Datos ----------
function addShows(list) {
  list.forEach(function (show) {
    if (show && show.image && !state.byId[show.id]) {
      state.byId[show.id] = show;
      state.all.push(show);
    }
  });
}

function getFiltered() {
  return state.all.filter(function (show) {
    return !state.genre || (show.genres || []).indexOf(state.genre) !== -1;
  });
}

async function loadNextApiPage() {
  try {
    const list = await fetchJSON(API_URL + "/shows?page=" + state.apiPage);
    state.apiPage = state.apiPage + 1;
    addShows(list);
  } catch (error) {
    if (error.status === 404) {
      state.apiDone = true; // no hay más páginas
    } else {
      throw error;
    }
  }
}

// Descarga páginas hasta tener suficientes series para mostrar
async function fillUntilEnough() {
  if (state.mode !== "browse") return;
  let pages = 0;
  while (getFiltered().length < state.visible && !state.apiDone && pages < MAX_PAGES_PER_CLICK) {
    await loadNextApiPage();
    pages++;
  }
}

// ---------- Render ----------
function createCard(show) {
  const col = document.createElement("div");
  col.className = "col";
  const name = escapeHTML(show.name);
  const genres = escapeHTML((show.genres || []).slice(0, 3).join(" · "));
  const rating = show.rating && show.rating.average ? "★ " + show.rating.average : "Sin puntaje";

  col.innerHTML =
    '<article class="show-card">' +
      '<img class="show-poster" src="' + posterURL(show, "medium") + '" alt="Póster de ' + name + '" loading="lazy">' +
      '<div class="show-body">' +
        '<h2 class="show-name">' + name + '</h2>' +
        '<p class="show-genres mb-1">' + (genres || "Sin género") + '</p>' +
        '<p class="show-rating">' + rating + '</p>' +
        '<button type="button" class="btn btn-outline-tv btn-sm w-100" data-id="' + show.id + '" ' +
          'aria-label="Ver más información de ' + name + '">Ver más</button>' +
      '</div>' +
    '</article>';
  return col;
}

function render() {
  const filtered = getFiltered();
  const shown = filtered.slice(0, state.visible);

  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  shown.forEach(function (show) {
    fragment.appendChild(createCard(show));
  });
  grid.appendChild(fragment);

  emptyMsg.classList.toggle("d-none", shown.length > 0 || state.loading);

  let text = "Mostrando " + shown.length + " series";
  if (state.mode === "search") text += " para “" + state.query + "”";
  if (state.genre) text += " · género: " + genreLabel(state.genre);
  summary.textContent = shown.length ? text : "";

  const hasMore = filtered.length > state.visible || (state.mode === "browse" && !state.apiDone);
  loadMoreBtn.classList.toggle("d-none", !hasMore);
}

function setLoadMoreLoading(isLoading) {
  loadMoreBtn.disabled = isLoading;
  loadMoreSpinner.classList.toggle("d-none", !isLoading);
  loadMoreLabel.textContent = isLoading ? "Cargando…" : "Ver más series";
}

function showError(error) {
  let detail = error.message;
  if (detail === "Failed to fetch") {
    detail = "el navegador no pudo conectarse con la API (revisá tu conexión, o si un bloqueador o una extensión la está bloqueando)";
  }
  errorText.textContent = "No pudimos cargar las series: " + detail + ".";
  errorBox.classList.remove("d-none");
}

// ---------- Acciones ----------
async function startBrowse() {
  state.requestId = state.requestId + 1;
  const requestId = state.requestId;
  state.mode = "browse";
  state.query = "";
  state.genre = "";
  setActiveChip("");
  state.all = [];
  state.byId = {};
  state.apiPage = 0;
  state.apiDone = false;
  state.visible = PAGE_SIZE;
  state.loading = true;

  errorBox.classList.add("d-none");
  grid.innerHTML = "";
  summary.textContent = "";
  emptyMsg.classList.add("d-none");
  loadMoreBtn.classList.add("d-none");
  initialSpinner.classList.remove("d-none");

  try {
    await fillUntilEnough();
    if (requestId !== state.requestId) return;
  } catch (error) {
    if (requestId !== state.requestId) return;
    showError(error);
  } finally {
    if (requestId === state.requestId) {
      state.loading = false;
      initialSpinner.classList.add("d-none");
      render();
    }
  }
}

async function startSearch(query) {
  state.requestId = state.requestId + 1;
  const requestId = state.requestId;
  state.mode = "search";
  state.query = query;
  state.genre = "";
  setActiveChip("");
  state.all = [];
  state.byId = {};
  state.apiDone = true;
  state.visible = PAGE_SIZE;
  state.loading = true;

  errorBox.classList.add("d-none");
  grid.innerHTML = "";
  summary.textContent = "";
  emptyMsg.classList.add("d-none");
  loadMoreBtn.classList.add("d-none");
  initialSpinner.classList.remove("d-none");

  try {
    const results = await fetchJSON(API_URL + "/search/shows?q=" + encodeURIComponent(query));
    if (requestId !== state.requestId) return;
    addShows(results.map(function (item) {
      return item.show;
    }));
  } catch (error) {
    if (requestId !== state.requestId) return;
    showError(error);
  } finally {
    if (requestId === state.requestId) {
      state.loading = false;
      initialSpinner.classList.add("d-none");
      render();
    }
  }
}

async function loadMore() {
  if (state.loading) return;
  state.loading = true;
  errorBox.classList.add("d-none");
  setLoadMoreLoading(true);
  state.visible = state.visible + PAGE_SIZE;

  try {
    await fillUntilEnough();
  } catch (error) {
    showError(error);
  } finally {
    state.loading = false;
    setLoadMoreLoading(false);
    render();
  }
}

async function changeGenre(value) {
  if (state.loading) return;
  state.genre = value;
  state.visible = PAGE_SIZE;
  setActiveChip(value);

  state.loading = true;
  errorBox.classList.add("d-none");
  render();
  initialSpinner.classList.remove("d-none");
  try {
    await fillUntilEnough();
  } catch (error) {
    showError(error);
  } finally {
    state.loading = false;
    initialSpinner.classList.add("d-none");
    render();
  }
}

// ---------- Modal de detalle ----------
function openDetail(id) {
  const show = state.byId[id];
  if (!show) return;

  const network = (show.network && show.network.name) || (show.webChannel && show.webChannel.name) || "";
  const rows = [
    ["Géneros", (show.genres || []).join(", ")],
    ["Estado", STATUS_NAMES[show.status] || show.status],
    ["Estreno", show.premiered],
    ["Finalización", show.ended],
    ["Idioma", show.language],
    ["Emisión", network],
    ["Duración", show.runtime ? show.runtime + " min" : ""],
    ["Puntaje", show.rating && show.rating.average ? "★ " + show.rating.average + " / 10" : ""]
  ];

  let list = "";
  rows.forEach(function (row) {
    if (row[1]) {
      list += "<dt>" + row[0] + "</dt><dd>" + escapeHTML(row[1]) + "</dd>";
    }
  });

  const summaryText = htmlToText(show.summary);
  let summaryHTML = "";
  if (summaryText) {
    summaryHTML =
      '<h3 class="fs-6 fw-bold mt-4">Sinopsis</h3>' +
      '<p class="detail-text">' + escapeHTML(summaryText) + '</p>';
  }

  let linkHTML = "";
  if (show.officialSite && String(show.officialSite).indexOf("http") === 0) {
    linkHTML = '<a class="btn btn-outline-tv btn-sm" href="' + escapeHTML(show.officialSite) +
      '" target="_blank" rel="noopener">Sitio oficial</a>';
  }

  detailTitle.textContent = show.name;
  detailBody.innerHTML =
    '<div class="row g-4">' +
      '<div class="col-12 col-md-5 text-center">' +
        '<img class="detail-poster" src="' + posterURL(show, "original") + '" alt="Póster de ' + escapeHTML(show.name) + '">' +
      '</div>' +
      '<div class="col-12 col-md-7">' +
        '<dl class="detail-list">' + list + '</dl>' +
        summaryHTML +
        linkHTML +
      '</div>' +
    '</div>';
  modal.show();
}

// ---------- Géneros ----------
function setActiveChip(value) {
  categoriesBox.querySelectorAll(".chip").forEach(function (chip) {
    const active = chip.dataset.value === value;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", active);
  });
}

GENRES.forEach(function (genre) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip";
  chip.textContent = genre.label;
  chip.dataset.value = genre.value;
  categoriesBox.appendChild(chip);
});

// ---------- Eventos ----------
categoriesBox.addEventListener("click", function (event) {
  const chip = event.target.closest(".chip");
  if (chip) changeGenre(chip.dataset.value);
});

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (query) startSearch(query);
});

resetBtn.addEventListener("click", function () {
  searchInput.value = "";
  startBrowse();
});

grid.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-id]");
  if (button) openDetail(button.dataset.id);
});

loadMoreBtn.addEventListener("click", loadMore);

retryBtn.addEventListener("click", function () {
  if (state.mode === "search") {
    startSearch(state.query);
  } else {
    startBrowse();
  }
});

// ---------- Inicio ----------
setActiveChip("");
startBrowse();
