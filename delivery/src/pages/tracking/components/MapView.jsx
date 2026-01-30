import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGlnYW1iZXIyNjAzIiwiYSI6ImNseHQzN3UwYTBtZDUyaXBlMXR3eDd1bnEifQ.RDplt9ho8x1WPhRwIi_IzQ";

const MapView = ({ order, onMapReady, isValidCoord }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);

  useEffect(() => {
    if (!order || map.current) return;

    // Parse store coordinates
    const storeCoords =
      order.storeId?.address?.longitude && order.storeId?.address?.latitude
        ? [order.storeId.address.longitude, order.storeId.address.latitude]
        : order.storeId?.location?.coordinates;

    const customerCoords = [
      order.deliveryAddress?.longitude,
      order.deliveryAddress?.latitude,
    ];

    const initialCenter = isValidCoord(storeCoords)
      ? storeCoords
      : isValidCoord(customerCoords)
        ? customerCoords
        : [28.0473, -26.2041];

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: 14,
        minZoom: 10,
        maxZoom: 18,
        pitch: 0,
        projection: "mercator",
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      const bounds = new mapboxgl.LngLatBounds();

      const createMarkerEl = (imageUrl, size = 50) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          background-image: url(${imageUrl});
          background-size: cover;
          background-position: center;
          cursor: pointer;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        `;
        return el;
      };

      // Store Marker
      if (isValidCoord(storeCoords)) {
        new mapboxgl.Marker({
          element: createMarkerEl(
            "https://cdn-icons-png.flaticon.com/512/6395/6395603.png",
            45,
          ),
          anchor: "bottom",
        })
          .setLngLat(storeCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-weight:bold;color:#1f2937">${order.storeId?.name || "Store"}</div>`,
            ),
          )
          .addTo(map.current);

        bounds.extend(storeCoords);
      }

      // Customer Marker
      if (isValidCoord(customerCoords)) {
        new mapboxgl.Marker({
          element: createMarkerEl(
            "https://cdn-icons-png.flaticon.com/512/1189/1189458.png",
            45,
          ),
          anchor: "bottom",
        })
          .setLngLat(customerCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-weight:bold;color:#1f2937">${order.customerId?.name || "Customer"}</div>`,
            ),
          )
          .addTo(map.current);

        bounds.extend(customerCoords);
      }

      // Driver Marker
      if (isValidCoord(storeCoords)) {
        driverMarker.current = new mapboxgl.Marker({
          element: createMarkerEl(
            "https://png.pngtree.com/png-vector/20220327/ourmid/pngtree-big-isolated-motorcycle-vector-colorful-icons-set-flat-illustrations-of-various-png-image_4517043.png",
            50,
          ),
          anchor: "bottom",
        })
          .setLngLat(storeCoords)
          .addTo(map.current);
      }

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 80, right: 80 },
          maxZoom: 14,
          minZoom: 12,
          duration: 1000,
        });
      }

      // Pass map and marker refs to parent
      if (onMapReady) {
        onMapReady(map.current, driverMarker.current);
      }
    } catch (e) {
      console.error("Map initialization error:", e);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [order, isValidCoord, onMapReady]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapView;
