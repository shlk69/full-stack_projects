const ConfirmRide = (props) => {
  const vehicleImages = {
    car: "/vehicles/car.svg",
    moto: "/vehicles/moto.svg",
    auto: "/vehicles/auto.svg",
  };

  return (
    <div className="relative w-full max-w-lg mx-auto px-4 sm:px-6 pb-4">
      <h5
        className="p-1 text-center w-full absolute top-0 left-0 cursor-pointer"
        onClick={() => {
          props.setConfirmRidePanel(false);
        }}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-xl sm:text-2xl font-semibold mb-5 pt-8">
        Confirm your Ride
      </h3>

      <div className="flex flex-col items-center gap-2">
        <img
          className="w-full max-w-[220px] h-auto max-h-32 object-contain"
          src={vehicleImages[props.vehicleType] || vehicleImages.car}
          alt={`${props.vehicleType || "Selected"} ride vehicle`}
        />

        <div className="w-full mt-4">
          <div className="flex items-center gap-4 p-3 border-b border-gray-200">
            <i className="text-xl ri-map-pin-user-fill shrink-0"></i>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium">
                562/11-A
              </h3>
              <p className="text-sm text-gray-600 break-words">
                {props.pickup}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 border-b border-gray-200">
            <i className="text-xl ri-map-pin-2-fill shrink-0"></i>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium">
                562/11-A
              </h3>
              <p className="text-sm text-gray-600 break-words">
                {props.destination}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3">
            <i className="text-xl ri-currency-line shrink-0"></i>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium">
                ₹{props.fare?.[props.vehicleType] ?? "N/A"}
              </h3>
              <p className="text-sm text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        <button
          onClick={props.createRide}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold p-3 rounded-lg transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;
