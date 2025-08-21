document.addEventListener('DOMContentLoaded', function() {
  const wrapper = document.querySelector('.reviews .slide__wrapper');
  const prevBtn = document.querySelector('.reviews .slider__control--prev');
  const nextBtn = document.querySelector('.reviews .slider__control--next');
  if (!wrapper) return;

  // 1) Создаём ленту и переносим слайды внутрь
  const originalSlides = Array.from(wrapper.querySelectorAll('.slide'));
  if (originalSlides.length === 0) return;

  const track = document.createElement('div');
  track.className = 'slides-track';
  wrapper.appendChild(track);
  originalSlides.forEach(slide => track.appendChild(slide));

  // 2) Клоны для бесконечного листания
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  track.insertBefore(lastClone, track.firstChild);
  track.appendChild(firstClone);

  // 3) Базовые стили (на всякий случай, если не подключится CSS)
  track.style.transition = 'transform 0.6s ease';
  Array.from(track.children).forEach(s => {
    s.style.flex = '0 0 100%';
  });

  // Индексы: [0]=lastClone, [1..N]=реальные, [N+1]=firstClone
  const REAL_COUNT = originalSlides.length;
  let index = 1; // стартуем с первого реального
  let locked = false;

  function setTransition(enabled) {
    track.style.transition = enabled ? 'transform 0.6s ease' : 'none';
  }
  function applyTransform() {
    track.style.transform = 'translateX(' + -index * 100 + '%)';
  }

  // Стартовая позиция
  setTransition(false);
  applyTransform();
  // включаем анимацию со следующего кадра
  requestAnimationFrame(() => setTransition(true));

  // 4) Обработчики
  function goNext() {
    if (locked) return;
    locked = true;
    index += 1;
    applyTransform();
  }
  function goPrev() {
    if (locked) return;
    locked = true;
    index -= 1;
    applyTransform();
  }

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  // 5) Склейка на концах без рывка
  track.addEventListener('transitionend', function() {
    // если ушли вправо на клон после последнего
    if (index === REAL_COUNT + 1) {
      setTransition(false);
      index = 1; // прыжок на первый реальный
      applyTransform();
      // вернуть плавность
      requestAnimationFrame(() => setTransition(true));
    }
    // если ушли влево на клон перед первым
    if (index === 0) {
      setTransition(false);
      index = REAL_COUNT; // прыжок на последний реальный
      applyTransform();
      requestAnimationFrame(() => setTransition(true));
    }
    locked = false;
  });

  // (опционально) свайпы на тачах
  let startX = null;
  wrapper.addEventListener(
    'touchstart',
    e => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );
  wrapper.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) < 30) return;
    dx < 0 ? goNext() : goPrev();
  });
});
