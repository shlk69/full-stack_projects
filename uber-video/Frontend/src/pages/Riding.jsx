import { Link, useLocation } from "react-router-dom"; 
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LiveTracking from "../components/LiveTracking";
import { SocketContext } from "../context/ContextDefinitions";

const Riding = () => {
  const location = useLocation();
  const { ride } = location.state || {}; 
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ride?._id) return;
    let active = true;
    const ended = completed => {
      if (completed?._id === ride._id) navigate('/ride-complete/' + completed._id);
    };
    const check = async () => {
      try {
        const { data } = await axios.get(import.meta.env.VITE_BASE_URL + '/rides/' + ride._id + '/status', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
        if (active && data.status === 'completed') navigate('/ride-complete/' + ride._id);
      } catch { /* Retry on next poll during a temporary connection failure. */ }
    };
    const join = () => {
      const userId = typeof ride.user === 'string' ? ride.user : ride.user?._id;
      if (userId) socket.emit('join', { token: localStorage.getItem('token'), userType: 'user', userId });
      check();
    };
    socket.on('ride-ended', ended);
    socket.on('connect', join);
    if (socket.connected) join();
    const timer = setInterval(check, 10000);
    return () => { active = false; clearInterval(timer); socket.off('connect', join); socket.off('ride-ended', ended); };
  }, [ride?._id, ride?.user, socket, navigate]);

  return (
    <div className="h-screen">
      <Link
        to="/home"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full">
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link>
      <div className="h-1/2">
        <LiveTracking ride={ride} />
      </div>
      <div className="h-1/2 p-4">
        <div className="flex items-center justify-between">
          <img
            className="h-12"
            src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
            alt=""
          />
          <div className="text-right">
            <h2 className="text-lg font-medium capitalize">
              {ride?.captain?.fullname?.firstname}
            </h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">
              {ride?.captain?.vehicle?.plate}
            </h4>
            <p className="text-sm text-gray-600">Maruti Suzuki Alto</p>
          </div>
        </div>

        <div className="flex gap-2 justify-between flex-col items-center">
          <div className="w-full mt-5">
            <div className="flex items-center gap-5 p-3 border-b-2">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">562/11-A</h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {ride?.destination}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-3">
              <i className="ri-currency-line"></i>
              <div>
                <h3 className="text-lg font-medium">₹{ride?.fare} </h3>
                <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
              </div>
            </div>
          </div>
        </div>
        <button disabled className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg">
          Payment available after ride completion
        </button>
      </div>
    </div>
  );
};

export default Riding;
