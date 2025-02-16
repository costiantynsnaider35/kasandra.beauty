import { useEffect, useRef } from "react";
import s from "./Map.module.css";

const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const { Map } = window.google.maps;
      const { AdvancedMarkerElement } = window.google.maps.marker;

      const map = new Map(mapRef.current, {
        center: { lat: 46.3931714467098, lng: 30.722667056674506 },
        zoom: 14,
      });

      new AdvancedMarkerElement({
        position: { lat: 46.3931714467098, lng: 30.722667056674506 },
        map,
        title: "Чаклую тут!))",
      });
    };

    const loadScript = () => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCAeK5rcBfXtzrx58uHodpH36RNly0szmM&callback=initMap&libraries=marker&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.initMap = initMap;
    };

    if (window.google) {
      initMap();
    } else {
      loadScript();
    }
  }, []);

  return <div ref={mapRef} className={s.map}></div>;
};

export default Map;
