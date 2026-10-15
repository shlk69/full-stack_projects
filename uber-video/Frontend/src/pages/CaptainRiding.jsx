import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FinishRide from "../components/FinishRide";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import TripTools from "../components/TripTools";
import LiveTracking from "../components/LiveTracking";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const rideData = location.state?.ride;
  const distanceKm = Number(rideData?.distance) / 1000;
  const formattedDistance = Number.isFinite(distanceKm) && distanceKm > 0
    ? `${distanceKm.toFixed(2)} KM trip`
    : "Trip distance unavailable";

  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [finishRidePanel],
  );

  return (
    <div className="h-screen relative isolate flex flex-col justify-end">
      <div className="fixed z-30 p-6 top-0 flex items-center justify-between w-screen">
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

      <div
        className="h-1/5 p-6 flex items-center justify-between relative z-20 bg-yellow-400 pt-10"
        onClick={() => {
          setFinishRidePanel(true);
        }}>
        <h5
          className="p-1 text-center w-[90%] absolute top-0"
          onClick={() => {}}>
          <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
        </h5>
        <h4 className="text-xl font-semibold">{formattedDistance}</h4>
        <button className=" bg-green-600 text-white font-semibold p-3 px-10 rounded-lg">
          Complete Ride
        </button>
      </div>
      <div
        ref={finishRidePanelRef}
        className="fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12">
        <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
      </div>

      <div className="absolute left-3 top-24 z-30 max-h-[50dvh] w-[min(26rem,calc(100%-1.5rem))] overflow-y-auto"><TripTools ride={rideData} role="captain" /></div>
      <div className="absolute inset-x-0 top-0 h-[80%] z-0">
        <LiveTracking ride={rideData} role="captain" />
      </div>
    </div>
  );
};

export default CaptainRiding;
