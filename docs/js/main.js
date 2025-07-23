document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const detailsFrame = document.getElementById('details');
  const mapFrame = document.getElementById('map-frame');

  let isOpen = false;

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
