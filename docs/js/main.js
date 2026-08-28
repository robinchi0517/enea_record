document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const detailsFrame = document.getElementById('details');
  const mapFrame = document.getElementById('map-frame');

  let isOpen = false;
  let isMusicPlaying = false;
  let playerFrame = null;
  const musicToggle = document.getElementById('music-toggle');
  const playlistId = 'PLKKek0lIEzamvUdm3PaDGJCFk_NxOOQ-t'; // YouTube 播放清單 ID

  function createPlayer() {
    if (!playlistId) return;
    playerFrame = document.createElement('iframe');
    playerFrame.src = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1&playlist=${playlistId}`;
    playerFrame.allow = 'autoplay; encrypted-media';
    playerFrame.style.position = 'absolute';
    playerFrame.style.width = '1px';
    playerFrame.style.height = '1px';
    playerFrame.style.left = '-1px';
    playerFrame.style.border = '0';
    document.body.appendChild(playerFrame);
    isMusicPlaying = true;
    musicToggle.textContent = '⏸︎';
  }

  function removePlayer() {
    if (!playerFrame) return;
    playerFrame.remove();
    playerFrame = null;
    isMusicPlaying = false;
    musicToggle.textContent = '▶︎';
  }

  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      removePlayer();
    } else {
      createPlayer();
    }
  });

  // 漢堡選單展開/收起
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    toggle.textContent = isOpen ? '✖' : '☰';
  });

  // 載入 markers.json
  fetch('markers.json')
    .then(res => res.json())
    .then(markers => {
      markers.forEach(marker => {
        const item = document.createElement('div');
        item.textContent = marker.title;
        item.classList.add('menu-item');
        item.style.cursor = 'pointer';
        item.style.padding = '5px';
        item.addEventListener('click', () => {
          // 右邊 iframe 換頁
          detailsFrame.src = marker.page;

          // 左邊地圖飛過去
          mapFrame.contentWindow.postMessage({
            type: "flyTo",
            lat: marker.coords[0],
            lng: marker.coords[1],
            zoom: marker.zoom
          }, "*");

          // 收起選單
          menu.classList.remove('open');
          toggle.textContent = '☰';
          isOpen = false;
        });
        menu.appendChild(item);
      });
    })
    .catch(err => {
      console.error("載入 markers.json 出錯:", err);
    });
});
