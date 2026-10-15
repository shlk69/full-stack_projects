import { API_BASE_URL } from "../config";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/ContextDefinitions";

const UserProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    if (!token) {
      navigate("/login");
      return () => {
        isCurrent = false;
      };
    }

    axios
      .get(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (isCurrent) {
          setUser(response.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [navigate, setUser, token]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserProtectedWrapper;
