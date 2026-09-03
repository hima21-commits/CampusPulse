(() => {
  'use strict';

  const form = document.querySelector('#feedback-form');
  const grid = document.querySelector('#feedback-grid');
  const emptyState = document.querySelector('#empty-state');
  const countLabel = document.querySelector('#feedback-count');
  const ratingFilter = document.querySelector('#rating-filter');
  const formMessage = document.querySelector('#form-message');
  const heroRating = document.querySelector('#hero-rating');
  const heroStars = document.querySelector('#hero-stars');
  const backToTop = document.querySelector('#back-to-top');
  const themeToggle = document.querySelector('#theme-toggle');
  const themeLabel = document.querySelector('#theme-label');
  const storageKey = 'campus-pulse-responses';
  const themeKey = 'campus-pulse-theme';

  const sampleFeedback = [];
  const removedNames = new Set(['Test Student', 'Maya R.', 'Arjun S.']);

  const readFeedback = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      const cleaned = Array.isArray(saved) ? saved.filter((item) => !removedNames.has(item.name)) : sampleFeedback;
      localStorage.setItem(storageKey, JSON.stringify(cleaned));
      return cleaned;
    } catch {
      return sampleFeedback;
    }
  };

  let feedback = readFeedback();

  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeLabel.textContent = isLight ? 'Dark mode' : 'Light mode';
  };
  setTheme(localStorage.getItem(themeKey) || 'dark');
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, nextTheme);
    setTheme(nextTheme);
  });

  const stars = (rating) => `${'&#9733;'.repeat(rating)}${'&#9734;'.repeat(5 - rating)}`;
  const formatDate = (date) => date === 'Sample response' ? date : new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const renderSummary = () => {
    const average = feedback.length ? feedback.reduce((total, item) => total + Number(item.rating), 0) / feedback.length : 0;
    heroRating.textContent = average.toFixed(1);
    heroStars.innerHTML = stars(Math.round(average));
  };

  const renderFeedback = () => {
    const filter = ratingFilter.value;
    const visibleFeedback = filter === 'all' ? feedback : feedback.filter((item) => String(item.rating) === filter);
    countLabel.textContent = `${visibleFeedback.length} response${visibleFeedback.length === 1 ? '' : 's'}`;
    emptyState.hidden = visibleFeedback.length > 0;
    grid.innerHTML = visibleFeedback.map((item) => `<article class="feedback-card"><div class="card-top"><strong class="card-name">${escapeHtml(item.name)}</strong><span class="card-date">${formatDate(item.date)}</span></div><div class="card-rating" aria-label="${item.rating} out of 5 stars">${stars(Number(item.rating))}</div><strong class="card-subject">${escapeHtml(item.subject || 'General feedback')}</strong><p>${escapeHtml(item.comment)}</p>${item.email ? `<span class="card-email">${escapeHtml(item.email)}</span>` : ''}</article>`).join('');
    renderSummary();
  };

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      formMessage.textContent = 'Please enter your name, subject, rating, and feedback.';
      formMessage.style.color = 'var(--orange)';
      return;
    }
    const data = new FormData(form);
    feedback = [{ name: data.get('name').trim(), email: data.get('email').trim(), subject: data.get('subject').trim(), rating: Number(data.get('rating')), comment: data.get('comment').trim(), date: new Date().toISOString() }, ...feedback];
    localStorage.setItem(storageKey, JSON.stringify(feedback));
    form.reset();
    formMessage.textContent = 'Thank you. Your feedback has been added to the board.';
    formMessage.style.color = 'var(--green)';
    renderFeedback();
  });

  ratingFilter.addEventListener('change', renderFeedback);
  window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 450), { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  renderFeedback();
})();
