const vehicles = [
  {
    type: "car",
    name: "UberGo",
    capacity: 4,
    description: "Affordable, compact rides",
    image: "/vehicles/car.svg",
  },
  {
    type: "moto",
    name: "Moto",
    capacity: 1,
    description: "Affordable motorcycle rides",
    image: "/vehicles/moto.svg",
  },
  {
    type: "auto",
    name: "UberAuto",
    capacity: 3,
    description: "Affordable Auto rides",
    image: "/vehicles/auto.svg",
  },
];

const VehiclePanel = (props) => {
  const { fare = {} } = props;

  return (
    <div className="relative min-h-[55vh] w-full max-w-lg mx-auto px-3 sm:px-5 pb-2">
      <button
        type="button"
        aria-label="Close vehicle options"
        className="p-1 text-center w-full absolute top-0 left-0 cursor-pointer"
        onClick={() => props.setVehiclePanel(false)}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
      </button>
      <h3 className="text-xl sm:text-2xl font-semibold mb-3 pt-8">
        Choose a Vehicle
      </h3>
      <div className="grid gap-2">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.type}
            type="button"
            onClick={() => {
              props.selectVehicle(vehicle.type);
              props.setVehiclePanel(false);
              props.setConfirmRidePanel(true);
            }}
            className="flex items-center gap-3 border-2 border-transparent active:border-black hover:border-gray-300 rounded-xl w-full p-3 text-left transition-colors"
          >
            <img
              className="w-20 sm:w-24 h-12 sm:h-14 object-contain shrink-0"
              src={vehicle.image}
              alt={vehicle.name}
            />
            <span className="flex-1 min-w-0">
              <span className="block font-medium text-sm sm:text-base">
                {vehicle.name}{" "}
                <span className="whitespace-nowrap">
                  <i className="ri-user-3-fill"></i> {vehicle.capacity}
                </span>
              </span>
              <span className="block font-medium text-xs sm:text-sm">
                {fare.durationMinutes ?? "--"} min · {fare.distanceKm ?? "--"}{" "}
                km
              </span>
              <span className="block font-normal text-xs text-gray-600 break-words">
                {vehicle.description}
              </span>
            </span>
            <span className="text-base sm:text-lg font-semibold shrink-0">
              ₹{fare[vehicle.type] ?? "--"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehiclePanel;
