document.addEventListener('DOMContentLoaded', () => {
  // Funciones de ajuste de video y cambio de idioma
  window.addEventListener('resize', adjustVideoSize);

  const video = document.getElementById('bg-video');
  if (video) {
    video.playbackRate = 0.6;
  }

  function adjustVideoSize() {
    if (window.innerHeight > 920) {
      video.style.transform = 'translate(-50%, -50%) scale(1.2)';
    } else {
      video.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }

  function switchLanguage(lang) {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
      if (element.getAttribute('data-lang') === lang) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });

    // Guardar la preferencia de idioma en localStorage
    localStorage.setItem('selectedLanguage', lang);
  }

  // Verificar si hay una preferencia de idioma guardada
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage) {
    switchLanguage(savedLanguage);
  } else {
    switchLanguage('es');
  }

  document.getElementById('es').addEventListener('click', () => switchLanguage('es'));
  document.getElementById('en').addEventListener('click', () => switchLanguage('en'));

  adjustVideoSize();

  const youtubeVideoGrid = document.getElementById('youtube-video-grid');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  let nextPageToken = '';
  let prevPageToken = '';
  let currentPage = 1;

  function loadYouTubeVideos(pageToken = '') {
    fetch(`/api/youtube-videos?pageToken=${pageToken}`)
      .then(response => response.json())
      .then(data => {
        youtubeVideoGrid.innerHTML = '';
        data.items.forEach(item => {
          const videoId = item.id.videoId;
          const videoThumbnail = item.snippet.thumbnails.medium.url;
          const videoTitle = item.snippet.title;

          const videoElement = document.createElement('div');
          videoElement.innerHTML = `
            <a href="#" class="video-link" data-video-id="${videoId}">
              <img src="${videoThumbnail}" alt="${videoTitle}">
              <p>${videoTitle}</p>
            </a>
          `;
          youtubeVideoGrid.appendChild(videoElement);
        });

        nextPageToken = data.nextPageToken || '';
        prevPageToken = data.prevPageToken || '';

        prevPageBtn.disabled = !prevPageToken;
        nextPageBtn.disabled = !nextPageToken;

        scrollToTop();
      })
      .catch(error => console.error('Error al cargar los videos de YouTube:', error));
  }

  prevPageBtn.addEventListener('click', () => {
    if (prevPageToken) {
      currentPage--;
      loadYouTubeVideos(prevPageToken);
    }
  });

  nextPageBtn.addEventListener('click', () => {
    if (nextPageToken) {
      currentPage++;
      loadYouTubeVideos(nextPageToken);
    }
  });
  loadYouTubeVideos();

  const videoPopup = document.getElementById('video-popup');
  const videoFrame = document.getElementById('video-frame');
  const videoPopupClose = document.querySelector('.video-popup-close');
  const videoPopupContent = document.querySelector('.video-popup-content');

  // Mostrar el popup del video
  function showVideoPopup(videoId) {
    videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    videoPopup.classList.add('show');
    videoPopup.classList.remove('hidden');
  }

  // Cerrar el popup del video
  function closeVideoPopup() {
    videoFrame.src = '';
    videoPopup.classList.remove('show');
    setTimeout(() => {
      videoPopup.classList.add('hidden');
    }, 300);
  }

  // Event listener para abrir el popup al hacer clic en un enlace de video
  youtubeVideoGrid.addEventListener('click', (event) => {
    event.preventDefault();
    const videoLink = event.target.closest('.video-link');
    if (videoLink) {
      const videoId = videoLink.getAttribute('data-video-id');
      showVideoPopup(videoId);
    }
  });

  // Event listener para cerrar el popup al hacer clic en la "X" de cierre
  videoPopupClose.addEventListener('click', closeVideoPopup);

  // Evitar cierre del popup al hacer clic dentro del contenido del popup
  videoPopupContent.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // Event listener para cerrar el popup al hacer clic fuera del contenido del popup
  videoPopup.addEventListener('click', (event) => {
    closeVideoPopup();
  });

  const contactForm = document.getElementById('contact-form');
  const subjectSelect = document.getElementById('subject');
  const phoneGroup = document.getElementById('phone-group');
  const phoneInput = document.getElementById('phone');

  subjectSelect.addEventListener('change', () => {
    if (subjectSelect.value === 'contratacion') {
      phoneGroup.classList.add('visible');
      phoneInput.setAttribute('required', 'required');
    } else {
      phoneGroup.classList.remove('visible');
      phoneInput.removeAttribute('required');
    }
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const formObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'El mensaje se envió correctamente.',
        });
        contactForm.reset();
        phoneGroup.classList.remove('visible');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Hubo un problema al enviar el mensaje.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al enviar el mensaje.',
      });
    }
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    contactForm.reset();
    phoneGroup.classList.remove('visible');
  });
});
