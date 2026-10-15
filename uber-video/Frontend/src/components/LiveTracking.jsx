import { useContext, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SocketContext } from "../context/ContextDefinitions";

const token = import.meta.env.VITE_MAPBOX_TOKEN;
const isValidCoordinate = (value) => Array.isArray(value) && value.length === 2
  && Number.isFinite(value[0]) && Number.isFinite(value[1])
  && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90;

const LiveTracking = ({ ride, role = "user" }) => {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const { socket } = useContext(SocketContext);
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [updated, setUpdated] = useState(0);
  const rideId = ride?._id;
  const pickup = ride?.pickup;
  const destination = ride?.destination;

  useEffect(() => {
    if (!token) return;
    const instance = new mapboxgl.Map({ container: container.current, accessToken: token,
      style: "mapbox://styles/mapbox/streets-v12", center: [75.8577, 22.7196], zoom: 13 });
    map.current = instance;
    instance.addControl(new mapboxgl.NavigationControl(), "top-right");
    instance.on("load", () => { instance.resize(); setReady(true); });
    instance.on("error", () => setError("Map could not load. Check the map token and connection."));
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);
    return () => { observer.disconnect(); instance.remove(); map.current = null; markers.current = {}; };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(({ coords }) => {
      setPosition([coords.longitude, coords.latitude]);
    }, () => setTrackingError("Allow location access to share your live position."),
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (!rideId || !socket) return;

    const join = () => socket.emit("track-ride", { rideId, role, token: localStorage.getItem("token") }, (result) => {
      setTrackingError(result?.success ? "" : result?.message || "Unable to connect live tracking.");
      if (isValidCoordinate(result?.location)) {
        setCaptain({ rideId, location: result.location });
        setUpdated(Date.now());
      } else {
        setCaptain(null);
      }
    });
    const receive = (data) => {
      if (data.rideId !== rideId) return;
      if (!isValidCoordinate(data.location)) return;
      setCaptain({ rideId, location: data.location }); setUpdated(Date.now()); setTrackingError("");
    };
    const disconnected = () => setTrackingError("Reconnecting live tracking. Last known location shown.");
    socket.on("connect", join);
    socket.on("ride-location", receive);
    socket.on("disconnect", disconnected);
    if (socket.connected) join();

    return () => {
      socket.emit("leave-tracking", { rideId });
      socket.off("connect", join);
      socket.off("ride-location", receive);
      socket.off("disconnect", disconnected);
    };
  }, [socket, rideId, role]);

  useEffect(() => {
    if (!rideId || role !== "captain" || !position || !socket?.connected) return;
    socket.emit("share-ride-location", { rideId, location: position }, (result) => {
      if (!result?.success) setTrackingError(result?.message || "Could not share location.");
    });
  }, [socket, rideId, role, position, updated]);

  useEffect(() => {
    if (!pickup || !destination || !token) return;
    const controller = new AbortController();
    const json = async (url) => {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Route unavailable. Check connection and Mapbox access.");
      return response.json();
    };
    const locate = async (address) => {
      const data = await json("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(address) + ".json?limit=1&access_token=" + token);
      if (!data.features?.length) throw new Error("Pickup or destination could not be located.");
      return data.features[0].center;
    };
    (async () => {
      const [start, end] = await Promise.all([locate(pickup), locate(destination)]);
      const data = await json("https://api.mapbox.com/directions/v5/mapbox/driving/" + start.join(",") + ";" + end.join(",") + "?overview=full&geometries=geojson&access_token=" + token);
      if (!data.routes?.length) throw new Error("No driving route found.");
      setRoute({ ...data.routes[0], start, end }); setError("");
    })().catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [pickup, destination]);

  useEffect(() => {
    if (!ready || !route || !map.current) return;
    const instance = map.current;
    const data = { type: "Feature", properties: {}, geometry: route.geometry };
    if (instance.getSource("ride-route")) instance.getSource("ride-route").setData(data);
    else {
      instance.addSource("ride-route", { type: "geojson", data });
      instance.addLayer({ id: "ride-route", type: "line", source: "ride-route",
        layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#2563eb", "line-width": 6 } });
    }

    const markersToAdd = [["Pickup", route.start, "#16a34a"], ["Destination", route.end, "#dc2626"]];
    for (const [name, coordinates, color] of markersToAdd) {
      markers.current[name]?.remove();
      if (!isValidCoordinate(coordinates)) continue;
      markers.current[name] = new mapboxgl.Marker({ color }).setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setText(name)).addTo(instance);
    }

    const bounds = new mapboxgl.LngLatBounds();
    if (Array.isArray(route.geometry?.coordinates)) {
      route.geometry.coordinates.forEach((point) => {
        if (isValidCoordinate(point)) bounds.extend(point);
      });
    }
    if (bounds.isEmpty()) return;
    instance.fitBounds(bounds, { padding: 70, maxZoom: 16 });
  }, [ready, route]);

  const livePosition = rideId && role === "user" ? (captain?.rideId === rideId ? captain.location : null) : position;
  useEffect(() => {
    if (!ready || !map.current) return;

    if (!isValidCoordinate(livePosition)) {
      markers.current.live?.remove();
      delete markers.current.live;
      return;
    }

    if (!markers.current.live) {
      markers.current.live = new mapboxgl.Marker({ color: "#111827" })
        .setLngLat(livePosition)
        .setPopup(new mapboxgl.Popup().setText(rideId ? "Captain live location" : "Your location")).addTo(map.current);
      if (!pickup) map.current.flyTo({ center: livePosition, zoom: 15 });
    }
    markers.current.live.setLngLat(livePosition);
  }, [ready, livePosition, rideId, pickup]);

  return <div className="relative h-full min-h-80 w-full overflow-hidden">
    <div ref={container} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    <div aria-live="polite" className="absolute left-3 top-16 z-10 max-w-[75%] rounded-lg bg-white p-3 text-sm shadow-md">
      {!token ? "Configure VITE_MAPBOX_TOKEN to display the map." : error || (route
        ? ((route.distance / 1000).toFixed(1) + " km · Approx. " + Math.ceil(route.duration / 60) + " min · Pickup to destination")
        : pickup ? "Loading driving route…" : "Your live location" )}
      {rideId && <p className="mt-1 text-xs text-gray-600">{trackingError || (updated ? "Captain location updating live" : "Waiting for captain location…")}</p>}
    </div>
    <button type="button" disabled={!livePosition} onClick={() => map.current?.flyTo({ center: livePosition, zoom: 16 })}
      className="absolute bottom-5 right-4 z-10 rounded-lg bg-white px-4 py-3 text-sm font-semibold shadow-lg disabled:opacity-50">
      {rideId ? "Locate captain" : "Locate me"}
    </button>
  </div>;
};
export default LiveTracking;
