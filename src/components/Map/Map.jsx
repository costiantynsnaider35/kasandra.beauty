import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import s from "./Map.module.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

      const customIcon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.marker([46.3931714467098, 30.722667056674506], { icon: customIcon })
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
