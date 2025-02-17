import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import s from "./Map.module.css";

const Map = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) {
      return;
    }

    if (mapRef.current) {
      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView(
        [46.3931714467098, 30.722667056674506],
        14
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([46.3931714467098, 30.722667056674506])
        .addTo(map)
        .bindPopup("Чаклую тут!))(БЦ Парк)")
        .openPopup();

      mapInstanceRef.current = map;

      mapRef.current.addEventListener("mouseenter", () => {
        map.scrollWheelZoom.enable();
      });

      mapRef.current.addEventListener("mouseleave", () => {
        map.scrollWheelZoom.disable();
      });
    }
  }, []);

  return <div ref={mapRef} className={s.map}></div>;
};

export default Map;
