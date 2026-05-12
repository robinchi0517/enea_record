document.addEventListener("DOMContentLoaded", () => {
    // 找出唯一的 Leaflet 地圖
    let theMap;
    for (const key in window) {
        if (window[key] && typeof window[key].flyTo === 'function' && typeof window[key].getCenter === 'function') {
            theMap = window[key];
            break;
        }
    }

    if (!theMap) {
        console.error("找不到地圖實例！");
        return;
    }

    window.addEventListener("message", (event) => {
        if (event.data.type === "flyTo") {
            const { lat, lng, zoom } = event.data;
            theMap.flyTo([lat, lng], zoom);
        }
    });
});