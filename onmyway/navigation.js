import React from "react";
import ScreenMenu from "./components/Menus/ScreenMenu.js";
import { AuthProvider } from "./context/authContext";
const RootNavigation = () => {
  return (
    <AuthProvider>
      <ScreenMenu />
    </AuthProvider>
  );
};

export default RootNavigation;
