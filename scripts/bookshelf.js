// Editable: add/remove books here.
const BOOKS = [
  { title: "Norwegian Wood", author: "Haruki Murakami", color: "#0f766e", url: "https://www.goodreads.com/book/show/11297.Norwegian_Wood" },
  { title: "A Little Life", author: "Hanya Yanagihara", color: "#7c3aed", url: "https://www.goodreads.com/book/show/22822858-a-little-life" },
  { title: "Words Without Music", author: "Philip Glass", color: "#b91c1c", url: "https://www.goodreads.com/book/show/18774931-words-without-music" },
  { title: "The Outsiders", author: "S.E. Hinton", color: "#1f2937", url: "https://www.goodreads.com/book/show/231804.The_Outsiders" },
  { title: "Meditations", author: "Marcus Aurelius", color: "#a16207", url: "https://www.goodreads.com/book/show/30659.Meditations" },
  { title: "The Beginning of Infinity", author: "David Deutsch", color: "#2563eb", url: "https://www.goodreads.com/book/show/10483171-the-beginning-of-infinity" },
  { title: "The Right Stuff", author: "Tom Wolfe", color: "#be185d", url: "https://www.goodreads.com/book/show/8140.The_Right_Stuff" },
];

// Utility
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

let pointerX = 0.5; // 0..1 within viewport
let hasPointer = false;

function renderBookshelf() {
  const shelf = document.getElementById("bookshelf");
  const viewport = document.getElementById("bookshelfViewport");
  if (!shelf || !viewport) return;

  shelf.innerHTML = "";

  BOOKS.forEach((b, i) => {
    const book = document.createElement("div");
    book.className = "book";
    book.style.background = b.color;

    // small variety in height/width
    const h = 165 + (i % 3) * 10 + (i % 2) * 6;
    const w = 38 + (i % 4) * 2;
    book.style.height = `${h}px`;
    book.style.width = `${w}px`;

    const spine = document.createElement("div");
    spine.className = "spine";

    const label = document.createElement("span");
    label.textContent = b.title;
    spine.appendChild(label);

    const link = document.createElement("a");
    link.href = b.url || "#";
    link.target = "_blank";
    link.rel = "noreferrer";

    book.appendChild(spine);
    book.appendChild(link);
    shelf.appendChild(book);
  });

  // Initial animation tick
  onScrollBookshelf();
}

function onScrollBookshelf() {
  const viewport = document.getElementById("bookshelfViewport");
  const shelf = document.getElementById("bookshelf");
  if (!viewport || !shelf) return;

  const rect = viewport.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  // progress: 0 when far below, 1 when far above, eased toward center
  const raw = (vh - rect.top) / (vh + rect.height);
  const p = clamp(raw, 0, 1);

  // Overall bookshelf transform (subtle 3D sweep)
  const pointerTilt = hasPointer ? (pointerX - 0.5) * 12 : 0;
  const rotY = -18 + p * 36 + pointerTilt;
  const rotX = 6 - p * 12;
  const lift = -6 + p * 12;

  shelf.style.transform =
    `translateY(${lift}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;

  // Individual book wiggle/parallax
  const books = shelf.querySelectorAll(".book");
  books.forEach((book, i) => {
    const phase = (i / Math.max(1, books.length - 1)) * Math.PI;
    const wiggle = Math.sin(p * Math.PI * 2 + phase) * 6;

    const z = -20 + p * 40 + (i % 3) * 4;
    const tilt = -10 + p * 20 + wiggle;

    book.style.transform = `translateZ(${z}px) rotateY(${tilt}deg)`;
  });
}


document.addEventListener("DOMContentLoaded", () => {
  renderBookshelf();

  const vp = document.getElementById("bookshelfViewport");
  if (vp) {
    const updatePointer = (e) => {
      const r = vp.getBoundingClientRect();
      pointerX = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
      hasPointer = true;
    };
    vp.addEventListener("pointermove", updatePointer, { passive: true });
    vp.addEventListener("pointerenter", updatePointer, { passive: true });
    vp.addEventListener("pointerleave", () => { hasPointer = false; }, { passive: true });
  }

  // RAF-driven update keeps animation responsive even if scroll events are throttled.
  let lastY = window.scrollY;
  function tick() {
    const y = window.scrollY;
    if (y !== lastY) {
      lastY = y;
      onScrollBookshelf();
    } else {
      // still recompute in case layout/anchors change
      onScrollBookshelf();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener("resize", onScrollBookshelf, { passive: true });
});

