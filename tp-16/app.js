const API_URL = "https://api.artic.edu/api/v1";
const DEFAULT_IIIF = "https://www.artic.edu/iiif/2";
const PAGE_SIZE = 12;
const LIST_FIELDS = "id,title,artist_display,date_display,image_id";
const DETAIL_FIELDS =
  "id,title,artist_display,date_display,place_of_origin,medium_display,dimensions,credit_line,description,short_description,image_id";

// Categorías (la etiqueta es lo que ve la persona; "q" es lo que se busca en la API)
const CATEGORIES = [
  { label: "Impresionismo", q: "impressionism" },
  { label: "Retratos", q: "portrait" },
  { label: "Paisajes", q: "landscape" },
  { label: "Arte japonés", q: "japanese print" },
  { label: "Esculturas", q: "sculpture" },
  { label: "Gatos", q: "cat" },
];

// ---------- DOM ----------
const grid = document.getElementById("grid");
const summary = document.getElementById("summary");
const categoriesBox = document.getElementById("categories");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
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
  query: "",
  page: 0,
  totalPages: 0,
  total: 0,
  iiif: DEFAULT_IIIF,
  loading: false,
  requestId: 0, // evita mezclar resultados si se cambia de búsqueda mientras carga
};

// ---------- Utilidades ----------
const escapeHTML = (text = "") =>
  String(text).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

const imageURL = (imageId, width) =>
  ${state.iiif}/${imageId}/full/${width},/0/default.jpg;

function htmlToText(html = "") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent.trim();
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(La API respondió con el estado ${response.status});
  return response.json();
}

// ---------- Búsqueda en la API ----------
function searchURL(query, page) {
  const params = new URLSearchParams({
    q: query,
    page,
    limit: PAGE_SIZE,
    fields: LIST_FIELDS,
  });
  // Solo obras de dominio público y que tengan imagen
  params.append("query[term][is_public_domain]", "true");
  return ${API_URL}/artworks/search?${params};
}

// ---------- Render ----------
function createCard(art) {
  const col = document.createElement("div");
  col.className = "col";
  const title = escapeHTML(art.title || "Sin título");

  col.innerHTML = `
    <article class="art-card">
      <div class="art-mat">
        <img src="${imageURL(art.image_id, 400)}" alt="${title}" loading="lazy">
      </div>
      <div class="art-caption">
        <h2 class="art-title">${title}</h2>
        <p class="art-artist">${escapeHTML(art.artist_display?.split("\n")[0] || "Artista desconocido")}</p>
        <p class="art-date">${escapeHTML(art.date_display || "")}</p>
        <button type="button" class="btn btn-outline-gallery btn-sm" data-id="${art.id}"
                aria-label="Ver más información de ${title}">Ver más</button>
      </div>
    </article>`;
  return col;
}

function renderArtworks(list) {
  const fragment = document.createDocumentFragment();
  list.forEach((art) => fragment.appendChild(createCard(art)));
  grid.appendChild(fragment);
}

function updateSummary() {
  const shown = grid.children.length;
  summary.textContent = state.total
    ? Mostrando ${shown} obras de ${state.total.toLocaleString("es-AR")} para “${state.query}”
    : "";
}

function updateLoadMore() {
  loadMoreBtn.classList.toggle("d-none", state.page >= state.totalPages);
}

function setLoadMoreLoading(isLoading) {
  loadMoreBtn.disabled = isLoading;
  loadMoreSpinner.classList.toggle("d-none", !isLoading);
  loadMoreLabel.textContent = isLoading ? "Cargando…" : "Ver más obras";
}

// ---------- Carga ----------
async function loadPage(isFirstPage) {
  if (state.loading && !isFirstPage) return;
  const requestId = ++state.requestId;
  state.loading = true;
  errorBox.classList.add("d-none");

  if (isFirstPage) {
    grid.innerHTML = "";
    emptyMsg.classList.add("d-none");
    loadMoreBtn.classList.add("d-none");
    summary.textContent = "";
    initialSpinner.classList.remove("d-none");
  } else {
    setLoadMoreLoading(true);
  }

  try {
    const nextPage = isFirstPage ? 1 : state.page + 1;
    const data = await fetchJSON(searchURL(state.query, nextPage));
    if (requestId !== state.requestId) return; // llegó tarde, se descarta

    state.page = data.pagination.current_page;
    state.totalPages = data.pagination.total_pages;
    state.total = data.pagination.total;
    state.iiif = data.config?.iiif_url || DEFAULT_IIIF;

    const withImage = data.data.filter((art) => art.image_id);
    renderArtworks(withImage);

    emptyMsg.classList.toggle("d-none", grid.children.length > 0);
    updateSummary();
    updateLoadMore();
  } catch (error) {
    if (requestId !== state.requestId) return;
    errorText.textContent = No pudimos cargar las obras. ${error.message}. Revisá tu conexión e intentá de nuevo.;
    errorBox.classList.remove("d-none");
  } finally {
    if (requestId === state.requestId) {
      state.loading = false;
      initialSpinner.classList.add("d-none");
      setLoadMoreLoading(false);
    }
  }
}

function startSearch(query) {
  state.query = query.trim();
  if (!state.query) return;
  state.page = 0;
  state.totalPages = 0;
  state.total = 0;
  loadPage(true);
}

// ---------- Modal de detalle ----------
async function openDetail(id) {
  detailTitle.textContent = "Cargando…";
  detailBody.innerHTML = `
    <div class="text-center py-5" role="status">
      <div class="spinner-border gallery-spinner"></div>
    </div>`;
  modal.show();

  try {
    const { data } = await fetchJSON(${API_URL}/artworks/${id}?fields=${DETAIL_FIELDS});
    const description = htmlToText(data.description || data.short_description || "");

    const rows = [
      ["Artista", data.artist_display],
      ["Fecha", data.date_display],
      ["Origen", data.place_of_origin],
      ["Técnica", data.medium_display],
      ["Dimensiones", data.dimensions],
      ["Crédito", data.credit_line],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => <dt>${label}</dt><dd>${escapeHTML(value)}</dd>)
      .join("");

    detailTitle.textContent = data.title || "Sin título";
    detailBody.innerHTML = `
      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="detail-mat">
            <img src="${imageURL(data.image_id, 843)}" alt="${escapeHTML(data.title)}">
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <dl class="detail-list">${rows}</dl>
          ${description ? <h3 class="fs-6 fw-bold mt-4">Descripción</h3><p class="detail-text">${escapeHTML(description)}</p> : ""}
        </div>
      </div>`;
  } catch (error) {
    detailTitle.textContent = "No se pudo cargar la obra";
    detailBody.innerHTML = <div class="alert alert-danger mb-0">${escapeHTML(error.message)}</div>;
  }
}

// ---------- Categorías ----------
function setActiveChip(label) {
  categoriesBox.querySelectorAll(".chip").forEach((chip) => {
    const active = chip.dataset.label === label;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", active);
  });
}

CATEGORIES.forEach(({ label, q }) => {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip";
  chip.textContent = label;
  chip.dataset.label = label;
  chip.dataset.q = q;
  categoriesBox.appendChild(chip);
});

// ---------- Eventos ----------
categoriesBox.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  searchInput.value = "";
  setActiveChip(chip.dataset.label);
  startSearch(chip.dataset.q);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!searchInput.value.trim()) return;
  setActiveChip(null);
  startSearch(searchInput.value);
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (button) openDetail(button.dataset.id);
});

loadMoreBtn.addEventListener("click", () => loadPage(false));
retryBtn.addEventListener("click", () => loadPage(state.page === 0));

// ---------- Inicio ----------
setActiveChip(CATEGORIES[0].label);
startSearch(CATEGORIES[0].q);
