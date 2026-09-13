(() => {
  const shelf = document.querySelector('.live-shelf');
  const viewport = document.querySelector('.shelf-viewport');
  if (!shelf || !viewport) return;

  const books = [...shelf.querySelectorAll('.shelf-book')];
  const title = document.getElementById('selected-title');
  const author = document.getElementById('selected-author');
  const link = document.getElementById('selected-link');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = books.find(book => book.classList.contains('is-selected'));
  let scrollTimer;

  function reveal(book) {
    const left = book.offsetLeft - shelf.offsetLeft;
    const right = left + book.offsetWidth;
    const visibleLeft = viewport.scrollLeft;
    const visibleRight = visibleLeft + viewport.clientWidth;
    const behavior = reducedMotion.matches ? 'instant' : 'smooth';
    if (left < visibleLeft + 10) viewport.scrollTo({ left: Math.max(0, left - 10), behavior });
    else if (right > visibleRight - 20) viewport.scrollTo({ left: right - viewport.clientWidth + 20, behavior });
  }

  function selectBook(book, shouldReveal = false) {
    if (selected !== book) {
      selected.classList.remove('is-selected');
      selected.setAttribute('aria-pressed', 'false');
      book.classList.add('is-selected');
      book.setAttribute('aria-pressed', 'true');
      selected = book;
      title.textContent = book.dataset.title;
      author.textContent = book.dataset.author;
      link.href = `https://openlibrary.org/isbn/${book.dataset.isbn}`;
    }
    clearTimeout(scrollTimer);
    if (shouldReveal) scrollTimer = setTimeout(() => reveal(book), reducedMotion.matches ? 0 : 380);
  }

  books.forEach((book, index) => {
    book.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') selectBook(book);
    });
    book.addEventListener('focus', () => selectBook(book, true));
    book.addEventListener('click', () => selectBook(book, true));
    book.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = Math.min(index + 1, books.length - 1);
      else if (event.key === 'ArrowLeft') target = Math.max(index - 1, 0);
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = books.length - 1;
      else return;
      event.preventDefault();
      books[target].focus({ preventScroll: true });
    });
  });
})();
