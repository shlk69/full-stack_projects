import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { useEffect, useContext } from "react";
import { SocketContext } from "../context/ContextDefinitions";
import { CaptainDataContext } from "../context/ContextDefinitions";
import axios from "axios";
import RidePopUp from "../components/RidePopUp";
import LiveTracking from "../components/LiveTracking";

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);

  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);
  const [ride, setRide] = useState(null);

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
              console.error(
                "Captain socket registration failed:",
                result?.message || "No registration response",
              );
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
        (error) => {
          console.error("Unable to register captain location:", error.message);
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
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
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

    setRidePopupPanel(false);
    setConfirmRidePopupPanel(true);
  }

  useGSAP(
    function () {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [ridePopupPanel],
  );

  useGSAP(
    function () {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopupPanel],
  );

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
        <CaptainDetails />
      </div>
      <div
        ref={ridePopupPanelRef}
        className="fixed z-40 bottom-0 w-full translate-y-full bg-white px-3 py-10 pt-12">
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide={confirmRide}
        />
      </div>
      <div
        ref={confirmRidePopupPanelRef}
        className="fixed z-50 bottom-0 h-screen w-full translate-y-full bg-white px-3 py-10 pt-12">
        <ConfirmRidePopUp
          ride={ride}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />
      </div>
    </div>
  );
};

export default CaptainHome;
