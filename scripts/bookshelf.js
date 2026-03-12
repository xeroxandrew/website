// Editable: add/remove books and one notes page per book.
// Format per book page: `page.heading` (bold) + `page.body` (body text).
const BOOKS = [
  { title: "Siddhartha", author: "Hermann Hesse", color: "#0f766e", page: { heading: "", body: "" } },
  { title: "A Little Life", author: "Hanya Yanagihara", color: "#7c3aed", page: { heading: "", body: "" } },
  { title: "Words Without Music", author: "Philip Glass", color: "#b91c1c", page: { heading: "", body: "" } },
  { title: "The Outsiders", author: "S.E. Hinton", color: "#1f2937", page: { heading: "", body: "" } },
  { title: "Meditations", author: "Marcus Aurelius", color: "#a16207", page: { heading: "", body: "" } },
  { title: "The Beginning of Infinity", author: "David Deutsch", color: "#2563eb", page: { heading: "", body: "" } },
  { title: "The Right Stuff", author: "Tom Wolfe", color: "#be185d", page: { heading: "", body: "" } },
];

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

let isReaderOpen = false;
let isReaderBusy = false;
let activeBookIndex = -1;

let readerRoot = null;
let readerBook = null;
let readerInner = null;
let readerCoverFront = null;
let readerPageLeft = null;
let readerPageRight = null;
let readerCloseBtn = null;

function getBookNotePage(book) {
  if (book.page && typeof book.page === "object") {
    return {
      heading: typeof book.page.heading === "string" ? book.page.heading : "",
      body: typeof book.page.body === "string" ? book.page.body : "",
    };
  }

  // Backward compatibility: if old `pages` exists, use first non-empty line as body.
  if (Array.isArray(book.pages)) {
    const body = book.pages.find((entry) => typeof entry === "string" && entry.trim()) || "";
    return { heading: "", body };
  }

  return { heading: "", body: "" };
}

function renderTitlePage(book) {
  if (!readerPageLeft) return;
  readerPageLeft.innerHTML = "";

  const pageTitle = document.createElement("h3");
  pageTitle.textContent = book.title;

  const pageAuthor = document.createElement("p");
  pageAuthor.textContent = book.author;

  const pageSubtitle = document.createElement("p");
  pageSubtitle.textContent = "Title Page";
  pageSubtitle.className = "book-reader__title-sub";

  readerPageLeft.appendChild(pageTitle);
  readerPageLeft.appendChild(pageAuthor);
  readerPageLeft.appendChild(pageSubtitle);
}

function renderNotesPage(book) {
  if (!readerPageRight) return;
  readerPageRight.innerHTML = "";

  const page = getBookNotePage(book);

  const headingWrap = document.createElement("p");
  headingWrap.className = "book-reader__thought-heading";
  const headingStrong = document.createElement("strong");
  headingStrong.textContent = page.heading || " ";
  headingWrap.appendChild(headingStrong);

  const body = document.createElement("p");
  body.className = "book-reader__thought-body";
  body.textContent = page.body || " ";
  if (!page.body.trim()) body.classList.add("book-reader__empty-page");

  readerPageRight.appendChild(headingWrap);
  readerPageRight.appendChild(body);
}

function renderReaderSpread() {
  if (activeBookIndex < 0) return;
  const book = BOOKS[activeBookIndex];
  renderTitlePage(book);
  renderNotesPage(book);
}

function getReaderTargetRect() {
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;

  const width = Math.min(760, vw * 0.9);
  const height = Math.min(460, vh * 0.64);
  const left = (vw - width) / 2;
  const top = Math.max(24, (vh - height) / 2);

  return { top, left, width, height };
}

function setReaderBookRect(rect) {
  readerBook.style.top = `${rect.top}px`;
  readerBook.style.left = `${rect.left}px`;
  readerBook.style.width = `${rect.width}px`;
  readerBook.style.height = `${rect.height}px`;
}

function getSpineRect(index) {
  const spine = document.querySelector(`#bookshelf .book[data-index="${index}"]`);
  if (!spine) return null;
  return spine.getBoundingClientRect();
}

function createReaderIfNeeded() {
  readerRoot = document.getElementById("bookReader");
  if (!readerRoot) {
    readerRoot = document.createElement("div");
    readerRoot.id = "bookReader";
    document.body.appendChild(readerRoot);
  }
  if (readerRoot.dataset.ready === "1") return;

  readerRoot.className = "book-reader";
  readerRoot.setAttribute("aria-hidden", "true");
  readerRoot.innerHTML = `
    <div class="book-reader__backdrop" data-reader-close="1"></div>
    <div class="book-reader__stage" role="dialog" aria-modal="true" aria-label="Book reader">
      <button type="button" class="book-reader__close" aria-label="Close book">&times;</button>
      <div class="book-reader__book">
        <div class="book-reader__inner">
          <div class="book-reader__cover">
            <div class="book-reader__cover-front"></div>
            <div class="book-reader__cover-inside"></div>
          </div>
          <div class="book-reader__pages">
            <article class="book-reader__page book-reader__page--left"></article>
            <article class="book-reader__page book-reader__page--right"></article>
          </div>
        </div>
      </div>
    </div>
  `;

  readerBook = readerRoot.querySelector(".book-reader__book");
  readerInner = readerRoot.querySelector(".book-reader__inner");
  readerCoverFront = readerRoot.querySelector(".book-reader__cover-front");
  readerPageLeft = readerRoot.querySelector(".book-reader__page--left");
  readerPageRight = readerRoot.querySelector(".book-reader__page--right");
  readerCloseBtn = readerRoot.querySelector(".book-reader__close");

  readerRoot.querySelector("[data-reader-close]").addEventListener("click", closeReader);
  readerCloseBtn.addEventListener("click", closeReader);

  document.addEventListener("keydown", (event) => {
    if (!isReaderOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeReader();
    }
  });

  readerRoot.dataset.ready = "1";
}

async function openReaderForBook(index, sourceEl) {
  if (isReaderOpen || isReaderBusy) return;
  if (!sourceEl) return;

  createReaderIfNeeded();
  isReaderBusy = true;
  isReaderOpen = true;
  activeBookIndex = index;

  const book = BOOKS[index];
  const startRect = sourceEl.getBoundingClientRect();
  const targetRect = getReaderTargetRect();

  readerCoverFront.style.background = book.color;
  readerCoverFront.textContent = book.title;
  readerInner.classList.remove("is-open");
  renderReaderSpread();
  setReaderBookRect(targetRect);

  const dx = startRect.left - targetRect.left;
  const dy = startRect.top - targetRect.top;
  const sx = startRect.width / targetRect.width;
  const sy = startRect.height / targetRect.height;

  document.body.classList.add("reader-open");
  readerRoot.setAttribute("aria-hidden", "false");
  readerRoot.classList.add("is-visible");

  await readerBook
    .animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transform: "translate(0, 0) scale(1, 1)" },
      ],
      { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    )
    .finished
    .catch(() => {});

  readerInner.classList.add("is-open");
  await wait(450);
  readerCloseBtn.focus();
  isReaderBusy = false;
}

async function closeReader() {
  if (!isReaderOpen || isReaderBusy) return;
  isReaderBusy = true;

  readerInner.classList.remove("is-open");
  await wait(220);

  const targetRect = getReaderTargetRect();
  const endRect = getSpineRect(activeBookIndex);

  if (endRect) {
    const dx = endRect.left - targetRect.left;
    const dy = endRect.top - targetRect.top;
    const sx = endRect.width / targetRect.width;
    const sy = endRect.height / targetRect.height;

    await readerBook
      .animate(
        [
          { transform: "translate(0, 0) scale(1, 1)" },
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        ],
        { duration: 420, easing: "cubic-bezier(0.55, 0, 0.1, 1)", fill: "forwards" }
      )
      .finished
      .catch(() => {});
  }

  readerRoot.classList.remove("is-visible");
  readerRoot.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
  activeBookIndex = -1;
  isReaderOpen = false;
  isReaderBusy = false;
}

function renderBookshelf() {
  const shelf = document.getElementById("bookshelf");
  const viewport = document.getElementById("bookshelfViewport");
  if (!shelf || !viewport) return;

  shelf.innerHTML = "";

  BOOKS.forEach((bookData, i) => {
    const book = document.createElement("div");
    book.className = "book";
    book.style.background = bookData.color;
    book.dataset.index = `${i}`;

    const h = 165 + (i % 3) * 10 + (i % 2) * 6;
    const w = 38 + (i % 4) * 2;
    book.style.height = `${h}px`;
    book.style.width = `${w}px`;

    const spine = document.createElement("div");
    spine.className = "spine";
    const label = document.createElement("span");
    label.textContent = bookData.title;
    spine.appendChild(label);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "book-trigger";
    trigger.setAttribute("aria-label", `Open ${bookData.title}`);
    trigger.addEventListener("click", () => openReaderForBook(i, book));

    book.appendChild(spine);
    book.appendChild(trigger);
    shelf.appendChild(book);
  });

  onScrollBookshelf();
}

function onScrollBookshelf() {
  if (isReaderOpen) return;
  const shelf = document.getElementById("bookshelf");
  if (!shelf) return;

  // Keep a fixed pose so the bookshelf remains visually static while
  // interacting with other content (for example, toggling influences details).
  shelf.style.transform = "translateY(0px) rotateY(0deg) rotateX(0deg)";

  const books = shelf.querySelectorAll(".book");
  books.forEach((book, i) => {
    const z = (i % 3) * 3;
    const tilt = -2 + (i % 5);
    book.style.transform = `translateZ(${z}px) rotateY(${tilt}deg)`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createReaderIfNeeded();
  renderBookshelf();
  onScrollBookshelf();

  window.addEventListener("resize", () => {
    onScrollBookshelf();
    if (isReaderOpen && readerBook) setReaderBookRect(getReaderTargetRect());
  });
});

