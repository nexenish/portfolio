(function () {
  const track = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const videos = Array.from(document.querySelectorAll('.slide video'));

  // Храним: было ли видео поставлено на паузу пользователем
  const userPaused = new Array(videos.length).fill(false);

  // Флаг: был ли уже клик по любому видео (для разблокировки звука)
  let audioUnlocked = false;

  // Функция разблокировки звука (вызывается при первом клике по любому видео)
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    console.log('🎵 Звук разблокирован');

    // Убираем muted у всех видео
    videos.forEach(video => {
      video.muted = false;
      video.volume = 1.0;
    });

    // Если текущее видео на паузе и его не останавливал пользователь — запускаем со звуком
    const currentVideo = videos[getCurrentSlideIndex()];
    if (currentVideo && currentVideo.paused && !userPaused[getCurrentSlideIndex()]) {
      currentVideo.play().catch(e => console.log('Ошибка запуска со звуком:', e));
    }
  }

  // Настройка каждого видео
  videos.forEach((video, index) => {
    // Зацикливание
    video.addEventListener('ended', function () {
      if (!userPaused[index]) {
        this.currentTime = 0;
        this.play().catch(e => console.log('Ошибка перезапуска:', e));
      }
    });

    // Клик по видео
    video.addEventListener('click', function (e) {
      e.stopPropagation();

      // Первый клик по любому видео — разблокируем звук
      if (!audioUnlocked) {
        unlockAudio();
        // При первом клике ВСЕГДА запускаем видео (не переключаем паузу)
        userPaused[index] = false;
        this.play().catch(e => console.log('Ошибка воспроизведения:', e));
        return;  // Выходим, чтобы не сработала логика паузы ниже
      }

      // Для последующих кликов — обычная логика паузы/воспроизведения
      if (this.paused) {
        // Пользователь ЗАПУСКАЕТ видео
        userPaused[index] = false;
        this.play().catch(e => console.log('Ошибка воспроизведения:', e));
      } else {
        // Пользователь СТАВИТ на паузу
        userPaused[index] = true;
        this.pause();
      }
    });

    // Предзагрузка
    video.preload = 'auto';
    video.load();
  });

  // Остановка всех видео
  function pauseAllVideos() {
    videos.forEach((video, index) => {
      if (!video.paused && !userPaused[index]) {
        video.pause();
      }
    });
  }

  // Запуск текущего видео (если пользователь его не останавливал)
  function playCurrentVideoIfNeeded() {
    const currentIndex = getCurrentSlideIndex();
    const currentVideo = videos[currentIndex];

    if (!currentVideo) return;

    // Если пользователь НЕ ставил это видео на паузу — запускаем
    if (!userPaused[currentIndex]) {
      // Если видео закончилось — сбрасываем
      if (currentVideo.ended) {
        currentVideo.currentTime = 0;
      }

      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          // Игнорируем NotAllowedError (тихо)
          if (e.name !== 'NotAllowedError') {
            console.log('Ошибка:', e.name);
          }
        });
      }
    }
  }

  // Получить текущий индекс
  function getCurrentSlideIndex() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return 0;
    const containerRect = track.getBoundingClientRect();
    let bestIndex = 0;
    let minDistance = Infinity;

    slides.forEach((slide, idx) => {
      const rect = slide.getBoundingClientRect();
      const centerDiff = Math.abs(rect.left + rect.width / 2 - containerRect.left - containerRect.width / 2);
      if (centerDiff < minDistance) {
        minDistance = centerDiff;
        bestIndex = idx;
      }
    });
    return bestIndex;
  }

  // Смена слайда
  function onSlideChanged() {
    // Останавливаем все видео (кроме тех, что на паузе от пользователя — они и так на паузе)
    pauseAllVideos();

    // Запускаем текущее (если пользователь его не останавливал)
    playCurrentVideoIfNeeded();
  }

  // Прокрутка
  function scrollToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;

    const slide = slides[index];
    if (slide) {
      slide.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
      setTimeout(() => onSlideChanged(), 200);
    }
  }

  // Навигация
  function nextSlide() {
    let current = getCurrentSlideIndex();
    let total = document.querySelectorAll('.slide').length;
    let next = current + 1;
    if (next >= total) return;
    scrollToSlide(next);
  }

  function prevSlide() {
    let current = getCurrentSlideIndex();
    let prev = current - 1;
    if (prev < 0) return;
    scrollToSlide(prev);
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
  });

  // Обработка скролла
  let scrollTimeout;
  track.addEventListener('scroll', function () {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      onSlideChanged();
    }, 100);
  });

  if ('onscrollend' in window) {
    track.addEventListener('scrollend', () => {
      onSlideChanged();
    });
  }

  // Drag to scroll
  let isDragging = false;
  let startX = 0;
  let scrollLeftStart = 0;

  track.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeftStart = track.scrollLeft;
    track.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.2;
    track.scrollLeft = scrollLeftStart - walk;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      track.style.cursor = 'grab';
      onSlideChanged();
    }
  });

  track.addEventListener('dragstart', (e) => e.preventDefault());

  // Запуск первого видео (без звука)
  setTimeout(() => {
    const firstVideo = videos[0];
    if (firstVideo) {
      firstVideo.muted = true;
      const playPromise = firstVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }
    }
  }, 100);

  // Предзагрузка следующих видео
  videos.forEach((video, index) => {
    if (index > 0) {
      video.load();
    }
  });

  console.log('✅ Слайдер готов. Кликните по видео для звука и управления');
})();