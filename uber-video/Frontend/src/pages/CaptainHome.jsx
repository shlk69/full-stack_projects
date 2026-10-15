import { API_BASE_URL } from "../config";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { useEffect, useContext } from "react";
import { SocketContext } from "../context/ContextDefinitions";
import { CaptainDataContext } from "../context/ContextDefinitions";
import axios from "axios";
import RidePopUp from "../components/RidePopup";
import LiveTracking from "../components/LiveTracking";

const CaptainHome = () => {
  const location = useLocation();
  const resumeRide = location.state?.resumeRide;
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(resumeRide?.status === 'accepted');

  const [ride, setRide] = useState(resumeRide || null);
  const [rideError, setRideError] = useState("");

  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        });
      }
    };

    const joinCaptain = () => {
      const registerCaptain = (location) => {
        socket.emit(
          "join",
          {
            userId: captain._id,
            token: localStorage.getItem("token"), userType: "captain",
            location,
          },
          (result) => {
            if (!result?.success) {
              setRideError("Unable to connect to ride notifications. Please reconnect.");
            }
          },
        );
      };

      if (!navigator.geolocation) {
        registerCaptain();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          registerCaptain({ ltd: coords.latitude, lng: coords.longitude });
        },
        () => {
          setRideError("Allow location access to receive nearby requests accurately.");
          registerCaptain();
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
      );
    };

    const handleNewRide = (data, acknowledge) => {
      setRide(data);
      setRidePopupPanel(true);
      if (typeof acknowledge === "function") {
        acknowledge({ received: true });
      }
    };

    socket.on("connect", joinCaptain);
    socket.on("new-ride", handleNewRide);
    if (socket.connected) {
      joinCaptain();
    }

    const locationInterval = setInterval(updateLocation, 10000);

    return () => {
      clearInterval(locationInterval);
      socket.off("connect", joinCaptain);
      socket.off("new-ride", handleNewRide);
    };
  }, [captain?._id, socket]);

  async function confirmRide() {
    try {
    if (!ride?._id || !captain?._id) throw new Error("Ride details are still loading");
    const response = await axios.post(
      `${API_BASE_URL}/rides/confirm`,
      {
        rideId: ride._id,
        captainId: captain._id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    setRide(response.data);
    setRidePopupPanel(false);
    setConfirmRidePopupPanel(true);
    } catch (err) { setRideError(err.response?.data?.message || "Unable to accept this ride."); setRidePopupPanel(false); }
  }



  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden">
      <div className="absolute inset-0 z-0 h-full w-full">
        <LiveTracking />
      </div>
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-6">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        />
        <Link
          to="/captain-home"
          className=" h-10 w-10 bg-white flex items-center justify-center rounded-full">
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 max-h-[48dvh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:bottom-5 sm:left-5 sm:right-auto sm:w-[min(32rem,calc(100%-2.5rem))] sm:rounded-2xl sm:p-6">
        <Link to="/captain-history" className="mb-3 block text-sm font-semibold underline">Ride history & receipts</Link>
        {rideError && <p role="alert" className="text-red-700">{rideError}</p>}
        <CaptainDetails />
      </div>
      <div
        hidden={!ridePopupPanel}
        className="fixed z-40 bottom-0 w-full bg-white px-3 py-10 pt-12">
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide={confirmRide}
        />
      </div>
      <div
        hidden={!confirmRidePopupPanel}
        className="fixed z-50 bottom-0 max-h-[90dvh] overflow-y-auto w-full bg-white px-3 py-10 pt-12">
        {confirmRidePopupPanel && <ConfirmRidePopUp
          ride={ride}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />}
      </div>
    </div>
  );
};

export default CaptainHome;
