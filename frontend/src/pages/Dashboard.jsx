import React from "react";
import { Outlet } from "react-router-dom";
import Header1 from "../components/Header1";

const Dashboard = () => {
  return (
    <div>
      <Header1 />
      <div className="section-container pt-2">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
