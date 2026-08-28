document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const detailsFrame = document.getElementById('details');
  const mapFrame = document.getElementById('map-frame');
  const musicToggle = document.getElementById('music-toggle');
  const randomSongButton = document.getElementById('random-song');
  const currentSongLabel = document.getElementById('current-song');

  let isOpen = false;
  let isMusicPlaying = false;
  let player = null;
  let songs = [];
  let currentSongIndex = -1;

  function updatePlayButton() {
    if (!musicToggle) return;
    musicToggle.textContent = isMusicPlaying ? '⏸︎' : '▶︎';
    musicToggle.setAttribute('aria-label', isMusicPlaying ? '暫停音樂' : '播放音樂');
  }

  function updateCurrentSongLabel() {
    if (!currentSongLabel) return;

    if (!songs.length || currentSongIndex < 0) {
      currentSongLabel.textContent = '尚未播放';
      return;
    }

    currentSongLabel.textContent = songs[currentSongIndex].title;
  }

  function loadSongByIndex(index, autoplay = false) {
    if (!player || !songs.length || index < 0 || index >= songs.length) return;

    const song = songs[index];
    currentSongIndex = index;
    updateCurrentSongLabel();

    if (autoplay) {
      player.loadVideoById(song.id, 0, 'large');
      player.playVideo();
      isMusicPlaying = true;
      updatePlayButton();
    } else {
      player.cueVideoById(song.id, 0, 'large');
      isMusicPlaying = false;
      updatePlayButton();
    }
  }

  function loadInitialSong() {
    if (!player || !songs.length || currentSongIndex < 0) return;

    loadSongByIndex(currentSongIndex);
  }

  function pickRandomSong() {
    if (!songs.length) return;

    let nextIndex = currentSongIndex;
    if (songs.length > 1) {
      while (nextIndex === currentSongIndex) {
        nextIndex = Math.floor(Math.random() * songs.length);
      }
    }

    loadSongByIndex(nextIndex);
  }

  function toggleMusic() {
    if (!player || !songs.length) return;

    if (currentSongIndex < 0) {
      loadSongByIndex(0, true);
      return;
    }

    if (isMusicPlaying) {
      player.pauseVideo();
      isMusicPlaying = false;
      updatePlayButton();
      return;
    }

    player.playVideo();
    isMusicPlaying = true;
    updatePlayButton();
  }

  function onYouTubeReady() {
    if (!window.YT || !window.YT.Player) return;

    player = new YT.Player('player', {
      height: '0',
      width: '0',
      videoId: '',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: () => {
          isMusicPlaying = false;
          loadInitialSong();
          updatePlayButton();
          updateCurrentSongLabel();
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isMusicPlaying = true;
            updatePlayButton();
          } else if (event.data === YT.PlayerState.PAUSED) {
            isMusicPlaying = false;
            updatePlayButton();
          } else if (event.data === YT.PlayerState.ENDED) {
            player.playVideo();
          }
        }
      }
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
  }

  if (randomSongButton) {
    randomSongButton.addEventListener('click', () => {
      pickRandomSong();
    });
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      menu.classList.toggle('open', isOpen);
      toggle.textContent = isOpen ? '✖' : '☰';
    });
  }

  fetch('music.json')
    .then((res) => res.json())
    .then((data) => {
      songs = Array.isArray(data) ? data : [];
      if (songs.length) {
        currentSongIndex = 0;
        loadInitialSong();
        updateCurrentSongLabel();
      }
    })
    .catch((err) => {
      console.error('載入 music.json 出錯:', err);
    });

  if (window.YT && window.YT.Player) {
    onYouTubeReady();
  } else {
    window.onYouTubeIframeAPIReady = onYouTubeReady;
  }

  fetch('markers.json')
    .then((res) => res.json())
    .then((markers) => {
      markers.forEach((marker) => {
        const item = document.createElement('div');
        item.textContent = marker.title;
        item.classList.add('menu-item');
        item.style.cursor = 'pointer';
        item.style.padding = '5px';
        item.addEventListener('click', () => {
          detailsFrame.src = marker.page;

          if (mapFrame && mapFrame.contentWindow) {
            mapFrame.contentWindow.postMessage({
              type: 'flyTo',
              lat: marker.coords[0],
              lng: marker.coords[1],
              zoom: marker.zoom
            }, '*');
          }

          menu.classList.remove('open');
          toggle.textContent = '☰';
          isOpen = false;
        });
        menu.appendChild(item);
      });
    })
    .catch((err) => {
      console.error('載入 markers.json 出錯:', err);
    });
});
