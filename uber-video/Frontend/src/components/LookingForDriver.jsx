const LookingForDriver = ({ ride, pickup, destination, fare, vehicleType, setVehicleFound }) => {
  const origin = ride?.pickup || pickup;
  const target = ride?.destination || destination;
  const amount = ride?.fare ?? fare?.[vehicleType];
  const image = ['/vehicles/car.svg', '/vehicles/moto.svg', '/vehicles/auto.svg'][['car','moto','auto'].indexOf(vehicleType)] || '/vehicles/car.svg';
  return <div className="mx-auto max-w-lg px-3">
    <button type="button" aria-label="Close driver search" onClick={() => setVehicleFound(false)} className="absolute left-1/2 top-2 -translate-x-1/2 p-2"><i className="ri-arrow-down-wide-line text-2xl text-gray-500" /></button>
    <h3 className="mb-4 text-2xl font-semibold">Looking for a driver</h3>
    <p role="status" className="mb-4 text-sm text-gray-600">Your request has been sent. Waiting for a captain to accept.</p>
    <img src={image} alt="Requested vehicle" className="mx-auto h-24 w-40 object-contain" />
    <div className="mt-4 space-y-3">
      <div className="border-b pb-3"><p className="text-xs font-semibold uppercase text-gray-500">Pickup</p><p className="mt-1 break-words">{origin || 'Pickup unavailable'}</p></div>
      <div className="border-b pb-3"><p className="text-xs font-semibold uppercase text-gray-500">Destination</p><p className="mt-1 break-words">{target || 'Destination unavailable'}</p></div>
      <div><p className="text-xs font-semibold uppercase text-gray-500">Estimated fare</p><p className="mt-1 text-xl font-semibold">{Number.isFinite(amount) ? '₹' + amount : 'Fare unavailable'}</p><p className="text-sm text-gray-600">Pay after the ride</p></div>
    </div>
  </div>;
};
export default LookingForDriver;
