import React, { useEffect, useState } from "react";
import {
  IoIosArrowRoundBack,
  IoSearchOutline,
  IoLocationSharp,
} from "react-icons/io";
import { TbCurrentLocation } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setLocation } from "../redux/mapSlice";
import axios from "axios";

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap();
    map.setView([location.lat, location.long], 16, { animate: true });
  }
  return null;
}

const Checkout = () => {
  const { location, address } = useSelector((state) => state.map);
  const dispatch = useDispatch();
  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, long: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({ lat: latitude, long: longitude }));
      getAddressByLatLng(latitude, longitude);
    });
  };
  const getAddressByLatLng = async (lat, lng) => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIKEY;
      const result = await axios.get(
        `https://geoapify.com{lat}&lon=${lng}&format=json&apiKey=${apiKey}`,
      );
      dispatch(setAddress(result?.data?.results[0].address_line2));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div
        className=" absolute top-[20px] left-[20px] z-[10]"
        onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className=" text-[#ff4d2d]" />
      </div>
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1>Checkout</h1>
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp className=" text-[#ff4d2d]" /> Delivery Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              value={address}
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter Your Delivery Address.."
            />
            <button className=" bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center">
              <IoSearchOutline size={17} />
            </button>
            <button
              onClick={getCurrentLocation}
              className=" bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center">
              <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat, location?.lon]}
                zoom={16}>
                <TileLayer
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker
                  position={[location?.lat, location?.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
