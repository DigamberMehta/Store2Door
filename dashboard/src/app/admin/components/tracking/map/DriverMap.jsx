import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGlnYW1iZXIyNjAzIiwiYSI6ImNseHQzN3UwYTBtZDUyaXBlMXR3eDd1bnEifQ.RDplt9ho8x1WPhRwIi_IzQ";

const DriverMap = ({ riders, selectedRider, onRiderSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.5762, 31.326], // Jalandhar, India
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      // Cleanup markers
      Object.values(markers.current).forEach((marker) => marker.remove());
      if (map.current) map.current.remove();
    };
  }, []);

  // Update markers when riders change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove markers for riders that are no longer in the list
    Object.keys(markers.current).forEach((riderId) => {
      const riderExists = riders.some((r) => r._id.toString() === riderId);
      if (!riderExists) {
        markers.current[riderId].remove();
        delete markers.current[riderId];
      }
    });

    // Add or update markers for current riders
    riders.forEach((rider) => {
      if (
        !rider.currentLocation?.coordinates ||
        rider.currentLocation.coordinates.length !== 2
      )
        return;

      const [lng, lat] = rider.currentLocation.coordinates;
      const riderId = rider._id.toString();

      // Create marker element
      const el = document.createElement("div");
      el.className = "rider-marker";
      el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="${
            rider.isAvailable
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 hover:bg-gray-500"
          } w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform group-hover:scale-110 border-3 border-white">
            <span class="text-2xl">🛵</span>
          </div>
          ${rider.isAvailable}
        </div>
      `;

      el.addEventListener("click", () => {
        onRiderSelect(rider);
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(
        `
        <div class="p-2">
          <p class="font-semibold text-sm">${rider.userId?.name || "Unknown Rider"}</p>
          <p class="text-xs text-gray-600">${rider.vehicle?.type || "N/A"} - ${rider.vehicle?.licensePlate || "N/A"}</p>
          <p class="text-xs ${rider.isAvailable ? "text-green-600" : "text-gray-600"} font-medium">
            ${rider.isAvailable ? "🟢 Available" : "⚫ Offline"}
          </p>
          ${
            rider.stats?.averageRating
              ? `<p class="text-xs text-yellow-600">⭐ ${rider.stats.averageRating.toFixed(1)}</p>`
              : ""
          }
        </div>
      `,
      );

      if (markers.current[riderId]) {
        // Update existing marker position
        markers.current[riderId].setLngLat([lng, lat]);
      } else {
        // Create new marker
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);

        markers.current[riderId] = marker;
      }
    });

    // Fit map to show all markers
    if (riders.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      riders.forEach((rider) => {
        if (
          rider.currentLocation?.coordinates &&
          rider.currentLocation.coordinates.length === 2
        ) {
          bounds.extend(rider.currentLocation.coordinates);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 400, right: 50 },
          maxZoom: 14,
        });
      }
    }
  }, [riders, mapLoaded, onRiderSelect]);

  // Highlight selected rider
  useEffect(() => {
    if (!selectedRider || !map.current) return;

    // Skip if rider has no location (offline)
    if (!selectedRider.currentLocation?.coordinates) return;

    const [lng, lat] = selectedRider.currentLocation.coordinates;
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 1000,
    });

    // Show popup for selected rider
    const riderId = selectedRider._id.toString();
    if (markers.current[riderId]) {
      markers.current[riderId].togglePopup();
    }
  }, [selectedRider]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <h4 className="font-semibold mb-2 text-gray-900">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-gray-700">Offline</span>
          </div>
        </div>
      </div>

      {/* Rider Count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
        <p className="text-sm font-medium text-gray-900">
          Active Riders: <span className="text-green-600">{riders.length}</span>
        </p>
      </div>
    </div>
  );
};

export default DriverMap;
