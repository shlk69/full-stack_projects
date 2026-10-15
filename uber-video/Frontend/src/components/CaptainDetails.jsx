import { API_BASE_URL } from "../config";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CaptainDataContext } from "../context/ContextDefinitions";

import CaptainReviews from "./CaptainReviews";

const CaptainDetails = () => {
  const { captain } = useContext(CaptainDataContext);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/captains/dashboard-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (isMounted) {
          setStats(response.data.stats);
          setStatsError("");
        }
      } catch (error) {
        if (isMounted) {
          setStatsError(
            error.response?.data?.message || "Unable to load captain stats.",
          );
        }
      }
    };

    loadStats();
    const refreshInterval = setInterval(loadStats, 60000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const statValue = (value) => (stats ? value : "—");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold uppercase text-gray-700"
          >
            {captain?.fullname?.firstname?.[0] || "C"}
          </div>
          <h4 className="text-lg font-medium capitalize">
            {[captain?.fullname?.firstname, captain?.fullname?.lastname]
              .filter(Boolean)
              .join(" ")}
          </h4>
        </div>
        <div className="text-right">
          <h4 className="text-xl font-semibold">
            {statValue(formatCurrency(stats?.totalEarned ?? 0))}
          </h4>
          <p className="text-sm text-gray-600">Total earned</p>
        </div>
      </div>
      {statsError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {statsError}
        </p>
      )}
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-3">
        <div className="min-w-0 text-center">
          <i className="ri-timer-2-line mb-1 text-2xl font-thin"></i>
          <h5 className="text-base font-medium">
            {statValue(`${((stats?.onlineSeconds ?? 0) / 3600).toFixed(1)} h`)}
          </h5>
          <p className="text-xs text-gray-600 sm:text-sm">Hours online</p>
        </div>
        <div className="min-w-0 text-center">
          <i className="ri-steering-2-line mb-1 text-2xl font-thin"></i>
          <h5 className="truncate text-base font-medium capitalize">
            {statValue(stats?.vehicleType)}
          </h5>
          <p className="text-xs text-gray-600 sm:text-sm">Vehicle type</p>
        </div>
        <div className="min-w-0 text-center">
          <i className="ri-booklet-line mb-1 text-2xl font-thin"></i>
          <h5 className="text-base font-medium">
            {statValue(stats?.successfulRides ?? 0)}
          </h5>
          <p className="text-xs text-gray-600 sm:text-sm">Successful rides</p>
        </div>
      </div>
      <CaptainReviews />
    </div>
  );
};

export default CaptainDetails;
