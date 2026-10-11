import React from "react";

const VehiclePanel = (props) => {
  return (
    <div className="relative w-full max-w-lg mx-auto px-3 sm:px-5 pb-4">
      {/* Close Panel */}
      <h5
        className="p-1 text-center w-full absolute top-0 left-0 cursor-pointer"
        onClick={() => props.setVehiclePanel(false)}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-xl sm:text-2xl font-semibold mb-5 pt-8">
        Choose a Vehicle
      </h3>

      {/* Car */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.selectVehicle("car");
        }}
        className="flex items-center gap-3 border-2 border-transparent active:border-black hover:border-gray-300 mb-3 rounded-xl w-full p-3 cursor-pointer transition-colors"
      >
        <img
          className="w-20 sm:w-24 h-12 sm:h-14 object-contain shrink-0"
          src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
          alt="UberGo car"
        />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm sm:text-base">
            UberGo{" "}
            <span className="whitespace-nowrap">
              <i className="ri-user-3-fill"></i> 4
            </span>
          </h4>
          <h5 className="font-medium text-xs sm:text-sm">
            2 mins away
          </h5>
          <p className="font-normal text-xs text-gray-600 break-words">
            Affordable, compact rides
          </p>
        </div>

        <h2 className="text-base sm:text-lg font-semibold shrink-0">
          ₹{props.fare?.car ?? "--"}
        </h2>
      </div>

      {/* Moto */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.selectVehicle("moto");
        }}
        className="flex items-center gap-3 border-2 border-transparent active:border-black hover:border-gray-300 mb-3 rounded-xl w-full p-3 cursor-pointer transition-colors"
      >
        <img
          className="w-20 sm:w-24 h-12 sm:h-14 object-contain shrink-0"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
          alt="Moto"
        />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm sm:text-base">
            Moto{" "}
            <span className="whitespace-nowrap">
              <i className="ri-user-3-fill"></i> 1
            </span>
          </h4>
          <h5 className="font-medium text-xs sm:text-sm">
            3 mins away
          </h5>
          <p className="font-normal text-xs text-gray-600 break-words">
            Affordable motorcycle rides
          </p>
        </div>

        <h2 className="text-base sm:text-lg font-semibold shrink-0">
          ₹{props.fare?.moto ?? "--"}
        </h2>
      </div>

      {/* Auto */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.selectVehicle("auto");
        }}
        className="flex items-center gap-3 border-2 border-transparent active:border-black hover:border-gray-300 mb-3 rounded-xl w-full p-3 cursor-pointer transition-colors"
      >
        <img
          className="w-20 sm:w-24 h-12 sm:h-14 object-contain shrink-0"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
          alt="Uber Auto"
        />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm sm:text-base">
            UberAuto{" "}
            <span className="whitespace-nowrap">
              <i className="ri-user-3-fill"></i> 3
            </span>
          </h4>
          <h5 className="font-medium text-xs sm:text-sm">
            3 mins away
          </h5>
          <p className="font-normal text-xs text-gray-600 break-words">
            Affordable Auto rides
          </p>
        </div>

        <h2 className="text-base sm:text-lg font-semibold shrink-0">
          ₹{props.fare?.auto ?? "--"}
        </h2>
      </div>
    </div>
  );
};

export default VehiclePanel;
