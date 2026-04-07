import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUser, FaVideo } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";

const navItems = [
  { to: "/", icon: FaHome, text: "Home" },
  { to: "/my-videos", icon: FaVideo, text: "My Videos" },
  { to: "/library", icon: MdLibraryAdd, text: "Library" },
  { to: "/user-profile", icon: FaUser, text: "Profile" },
 
];

function NavigatorBar({ isSidebarOpen }) {
  return (
    <>
      {/* Sidebar for PC */}
      <div
        className={`hidden lg:block fixed left-0 bg-[#0f0f0f] text-[#f1f1f1] z-40 overflow-y-auto overflow-x-hidden ${
          isSidebarOpen ? "w-[240px]" : "w-[72px]"
        }`}
        style={{ top: "56px", height: "calc(100vh - 56px)" }}
      >
        <div className={`flex flex-col h-full ${isSidebarOpen ? "p-3" : "py-1"}`}>
          <nav className="flex-1 flex flex-col pt-1">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex ${
                      isSidebarOpen 
                        ? "flex-row items-center gap-5 px-3 py-2.5 rounded-xl" 
                        : "flex-col items-center justify-center gap-1.5 py-4 px-1 rounded-lg"
                    } hover:bg-[#272727] transition-colors focus:outline-none ${
                      isActive ? (isSidebarOpen ? "bg-[#272727] font-medium" : "bg-transparent font-medium") : "font-normal"
                    }`
                  }
                  aria-current={({ isActive }) =>
                    isActive ? "page" : undefined
                  }
                >
                  <div className="flex items-center justify-center">
                    <item.icon className={isSidebarOpen ? "text-[22px]" : "text-[24px]"} />
                  </div>
                  {isSidebarOpen ? (
                    <span className="text-sm truncate leading-tight">
                      {item.text}
                    </span>
                  ) : (
                    <span className="text-[10px] truncate max-w-full leading-none">
                      {item.text}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Navbar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] text-[#f1f1f1] z-50 border-t border-[#272727] h-[48px]">
        <nav className="flex justify-around items-center h-full px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1 rounded-lg hover:bg-[#272727] transition-colors focus:outline-none ${
                  isActive ? "text-[#f1f1f1]" : "text-[#aaaaaa]"
                }`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              <item.icon className="text-[20px]" />
              <span className="text-[10px] leading-none">{item.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default NavigatorBar;
