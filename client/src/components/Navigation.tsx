import { useState } from "react";
import { Link, useLocation } from "wouter";

const Navigation = () => {
  const [location] = useLocation();
  
  // Extract the current tab from the location
  const currentTab = location === "/" ? "/menu" : location;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-2 no-scrollbar">
          <Link href="/menu">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/menu" ? "tab-active" : "text-gray-600"}`}>
              Menu
            </a>
          </Link>
          <Link href="/reserve">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/reserve" ? "tab-active" : "text-gray-600"}`}>
              Reserve
            </a>
          </Link>
          <Link href="/order">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/order" ? "tab-active" : "text-gray-600"}`}>
              Order
            </a>
          </Link>
          <Link href="/rewards">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/rewards" ? "tab-active" : "text-gray-600"}`}>
              Rewards
            </a>
          </Link>
          <Link href="/info">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/info" ? "tab-active" : "text-gray-600"}`}>
              Info
            </a>
          </Link>
          <Link href="/assistant">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/assistant" ? "tab-active" : "text-gray-600"}`}>
              Assistant
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
