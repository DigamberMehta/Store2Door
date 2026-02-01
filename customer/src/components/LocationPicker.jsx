import { useState, useEffect, useRef } from "react";
import { Navigation, X } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGlnYW1iZXIyNjAzIiwiYSI6ImNseHQzN3UwYTBtZDUyaXBlMXR3eDd1bnEifQ.RDplt9ho8x1WPhRwIi_IzQ";

const LocationPicker = ({
  initialLat,
  initialLng,
  onLocationSelect,
  onClose,
}) => {
  const [position, setPosition] = useState({
    lat: initialLat || 31.2552,
    lng: initialLng || 75.7009,
  });
  const [isMoving, setIsMoving] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [position.lng, position.lat],
      zoom: 15,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Update position when map moves
    const updatePosition = () => {
      const center = map.current.getCenter();
      setPosition({ lat: center.lat, lng: center.lng });
    };

    map.current.on("movestart", () => {
      setIsMoving(true);
    });

    map.current.on("move", updatePosition);

    map.current.on("moveend", () => {
      setIsMoving(false);
      updatePosition();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        if (map.current) {
          map.current.flyTo({
            center: [newPos.lng, newPos.lat],
            zoom: 15,
            duration: 1500,
          });
        }
      },
      (error) => {
        alert("Unable to get your location");
        console.error(error);
      },
    );
  };

  const handleConfirm = () => {
    onLocationSelect(position.lat, position.lng);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 px-3 py-2.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Select Location
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 -mr-1.5 active:bg-white/10 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full"></div>

        {/* Fixed center marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1189/1189458.png"
            alt="Location Pin"
            className={`w-8 h-8 drop-shadow-lg transition-transform ${
              isMoving ? "scale-110" : "scale-100"
            }`}
          />
        </div>

        {/* Instruction overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs border border-white/10 shadow-lg">
          {isMoving ? "Moving map..." : "Move map to set location"}
        </div>

        {/* Current location button */}
        <button
          onClick={handleGetCurrentLocation}
          className="absolute bottom-20 right-3 bg-[rgb(49,134,22)] active:bg-[rgb(49,134,22)]/80 text-white p-3 rounded-full shadow-lg transition-all active:scale-95"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Coordinates display */}
        <div className="absolute bottom-20 left-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] border border-white/10 leading-tight">
          <div>Lat: {position.lat.toFixed(6)}</div>
          <div>Lng: {position.lng.toFixed(6)}</div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="bg-black/40 backdrop-blur-xl border-t border-white/5 px-3 py-3">
        <button
          onClick={handleConfirm}
          className="w-full bg-[rgb(49,134,22)] active:bg-[rgb(49,134,22)]/80 text-white font-medium py-2.5 rounded-lg transition-all active:scale-[0.98] text-sm"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
