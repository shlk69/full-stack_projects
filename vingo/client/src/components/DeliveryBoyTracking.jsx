import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer,Polyline,Popup } from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const DeliveryBoyTracking = ({ data }) => {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoylon = data.deliveryBoyLocation.lon;
  const customerLat = data.customerLocation.lat;
  const customerlon = data.customerLocation.lon;

  const path = [
    [deliveryBoyLat, deliveryBoylon],
    [customerLat, customerlon],
  ];

  const center = [deliveryBoyLat, deliveryBoylon];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer className={"w-full h-full"} center={center} zoom={16}>
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[deliveryBoyLat, deliveryBoylon]}
          icon={deliveryBoyIcon}>
          <Popup>Delivery boy</Popup>
        </Marker>
        <Marker position={[customerLat, customerlon]} icon={customerIcon}>
          <Popup>Customer </Popup>
        </Marker>

        <Polyline
          positions={path}
          pathOptions={{ color: "blue", weight: 4, opacity: 0.7 }}
        />
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
