import { useState } from "react";

import { UserDataContext } from "./ContextDefinitions";

const UserContext = ({ children }) => {
  const [user, setUser] = useState({
    _id: "",
    email: "",
    fullName: {
      firstname: "",
      lastname: "",
    },
  });

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
