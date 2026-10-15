import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import { SocketContext } from "../context/ContextDefinitions";
import { useContext } from "react";
import { UserDataContext } from "../context/ContextDefinitions";
import { useNavigate } from "react-router-dom";
import LiveTracking from "../components/LiveTracking";

import TripTools from "../components/TripTools";
import { Link, useLocation } from "react-router-dom";
import CompletedRides from "../components/CompletedRides";

const Home = () => {
  const location = useLocation();
  const resumeRide = location.state?.resumeRide;
  const [pickup, setPickup] = useState(resumeRide?.pickup || "");
  const [destination, setDestination] = useState(resumeRide?.destination || "");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(resumeRide?.status === 'pending');
  const [waitingForDriver, setWaitingForDriver] = useState(resumeRide?.status === 'accepted');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);
  const [ride, setRide] = useState(resumeRide || null);
  const [rideRequestError, setRideRequestError] = useState("");

  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);

  useEffect(() => {
    if (!user?._id) return;

    const joinUser = () => {
      socket.emit("join", { token: localStorage.getItem("token"), userType: "user", userId: user._id });
    };
    const handleRideConfirmed = (confirmedRide) => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(confirmedRide);
    };
    const handleRideStarted = (startedRide) => {
      setWaitingForDriver(false);
      navigate("/riding", { state: { ride: startedRide } });
    };
    const handleRideUnavailable = ({ targetedCaptains = 0 } = {}) => {
      setVehicleFound(false);
      setRideRequestError(
        targetedCaptains > 0
          ? "Drivers were found, but their apps did not acknowledge the request. Please check the driver app connection and try again."
          : "No drivers are online right now. Please try again later.",
      );
    };

    socket.on("connect", joinUser);
    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-request-unavailable", handleRideUnavailable);
    if (socket.connected) joinUser();

    return () => {
      socket.off("connect", joinUser);
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-request-unavailable", handleRideUnavailable);
    };
  }, [navigate, socket, user?._id]);


  const handlePickupChange = async (e) => {
    setPickup(e.target.value);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maps/get-suggestions`,
        {
          params: { input: e.target.value },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setPickupSuggestions(response.data);
    } catch {
      // handle error
    }
  };

  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/maps/get-suggestions`,
        {
          params: { input: e.target.value },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setDestinationSuggestions(response.data);
    } catch {
      // handle error
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };






  async function findTrip() {
    if (pickup.trim().length < 3 || destination.trim().length < 3) return;
    setRideRequestError("");
    try {
      const response = await axios.get(API_BASE_URL + '/rides/get-fare', {
        params: { pickup, destination }, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setPanelOpen(false); setFare(response.data.fare); setVehiclePanel(true);
    } catch (error) { setRideRequestError(error.response?.data?.message || 'Unable to find a trip. Please retry.'); }
  }

  async function createRide() {
    setRideRequestError("");
    setVehicleFound(true);
    setConfirmRidePanel(false);

    try {
    const response = await axios.post(
      `${API_BASE_URL}/rides/create`,
      {
        pickup,
        destination,
        vehicleType,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    setRide(current => current?.status === "accepted" ? current : response.data.ride);
    if (response.data.notifiedCaptains === 0) {
      setVehicleFound(false);
      setRideRequestError(
        response.data.targetedCaptains > 0
          ? "Drivers were found, but their apps did not acknowledge the request. Please check the driver app connection and try again."
          : "No drivers are online right now. Please try again later.",
      );
    }
    } catch (error) {
      setVehicleFound(false);
      setRideRequestError(
        error.response?.data?.message || "Unable to request a ride. Please try again.",
      );
    }
  }

  return (
    <div className="h-[100dvh] relative overflow-hidden">
      <img
        className="w-16 absolute left-5 top-5 z-10"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt=""
      />
      <div className="h-screen w-screen">
        <LiveTracking ride={ride} />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 max-h-[85dvh] overflow-y-auto bg-white sm:bottom-5 sm:left-5 sm:right-auto sm:w-[420px] sm:rounded-2xl sm:shadow-xl">
        <div className="p-5 bg-white relative">
          {user?.isAdmin && <Link to="/admin" className="mb-3 block text-sm font-semibold underline">Admin dashboard</Link>}
          <Link to="/ride-history" className="mb-3 block text-sm font-semibold underline">Ride history & receipts</Link>
          <CompletedRides />
          {rideRequestError && (
            <p role="alert" className="mb-2 text-sm text-red-600">
              {rideRequestError}
            </p>
          )}
          <h5
            hidden={!panelOpen}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute right-5 top-5 text-2xl cursor-pointer">
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form
            className="relative py-3"
            onSubmit={(e) => {
              submitHandler(e);
            }}>
            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              aria-label="Pickup location"
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full"
              type="text"
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              aria-label="Destination"
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            disabled={pickup.trim().length < 3 || destination.trim().length < 3}
            onClick={findTrip}
            className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full disabled:opacity-50">
            Find Trip
          </button>
        </div>
        <div hidden={!panelOpen} className="bg-white max-h-[30dvh] overflow-y-auto px-5 pb-4">
          <LocationSearchPanel
            suggestions={
              activeField === "pickup"
                ? pickupSuggestions
                : destinationSuggestions
            }
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
          />
        </div>
      </div>
      <div
        hidden={!vehiclePanel}
        className="fixed inset-x-0 z-30 bottom-0 max-h-[85vh] w-full overflow-y-auto bg-white px-3 py-3">
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>
      <div
        hidden={!confirmRidePanel}
        className="fixed inset-x-0 max-h-[85dvh] overflow-y-auto w-full z-40 bottom-0 bg-white px-3 py-6 pt-12">
        <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
        />
      </div>
      <div
        hidden={!vehicleFound}
        className="fixed inset-x-0 max-h-[85dvh] overflow-y-auto w-full z-50 bottom-0 bg-white px-3 py-6 pt-12">
        {vehicleFound && <TripTools ride={ride} onCancelled={({ reason }) => { setVehicleFound(false); setRide(null); setRideRequestError("Ride cancelled: " + reason); }} />}
        <LookingForDriver
          ride={ride}
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        hidden={!waitingForDriver}
        className="fixed inset-x-0 max-h-[85dvh] overflow-y-auto w-full z-60 bottom-0 bg-white px-3 py-6 pt-12">
        {waitingForDriver && <TripTools ride={ride} onCancelled={({ reason }) => { setWaitingForDriver(false); setVehicleFound(false); setRide(null); setRideRequestError("Ride cancelled: " + reason); }} />}
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </div>
    </div>
  );
};

export default Home;
