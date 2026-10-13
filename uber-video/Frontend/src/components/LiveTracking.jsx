import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const DEFAULT_CENTER = {
  lat: 22.7196,
  lng: 75.8577,
};

const LiveTracking = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Initialize the map only once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: 14,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapReady(true);
    });

    map.on("error", (event) => {
      console.error("Mapbox error:", event.error);
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      markerRef.current?.remove();
      markerRef.current = null;

      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Watch the user's live GPS position
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const newPosition = {
          lat: latitude,
          lng: longitude,
        };

        setCurrentPosition(newPosition);
        setLocationError("");
      },
      (error) => {
        const messages = {
          1: "Allow location permission to track your position.",
          2: "Your current location is unavailable.",
          3: "Location request timed out. Try again.",
        };

        setLocationError(
          messages[error.code] || "Unable to retrieve your location.",
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      },
    );

    watchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);
      watchIdRef.current = null;
    };
  }, []);

  // Update the marker whenever GPS coordinates change
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady || !currentPosition) return;

    const coordinates = [currentPosition.lng, currentPosition.lat];

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({
        color: "#2563eb",
      })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText("Your current location"),
        )
        .addTo(map);

      map.flyTo({
        center: coordinates,
        zoom: 16,
        essential: true,
      });
    } else {
      markerRef.current.setLngLat(coordinates);
      map.easeTo({
        center: coordinates,
        duration: 500,
      });
    }
  }, [currentPosition, mapReady]);

  const centerOnMe = () => {
    if (!currentPosition || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: 16,
      essential: true,
    });
  };

  return (
    <div className="relative h-[60vh] min-h-[320px] w-full overflow-hidden rounded-xl sm:h-[70vh] lg:h-[80vh]">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {!currentPosition && (
        <div className="absolute left-3 right-3 top-3 z-10 rounded-lg bg-white p-3 text-sm shadow-md sm:left-4 sm:right-auto sm:max-w-sm">
          {locationError || "Getting your current location..."}
        </div>
      )}

      {locationError && currentPosition && (
        <div className="absolute left-3 right-3 top-3 z-10 rounded-lg bg-white p-3 text-sm shadow-md sm:left-4 sm:right-auto sm:max-w-sm">
          {locationError}
        </div>
      )}

      <button
        type="button"
        onClick={centerOnMe}
        disabled={!currentPosition}
        className="absolute bottom-5 right-4 z-10 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
        Locate me
      </button>
    </div>
  );
};

export default LiveTracking;
