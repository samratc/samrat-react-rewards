import { Link } from "react-router-dom";
import { useState, useCallback } from "react";

const TopNavigationBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-[1001] bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 shadow-lg border-b border-dark-700 px-5 py-4 md:px-8 flex justify-between items-center transition-all duration-300 h-[70px] md:h-auto">
      <div className="flex items-center gap-4 md:mr-12">
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-black font-bold text-xl md:text-2xl tracking-tight font-sans">
            Rewards Report
          </span>
        </div>
        
        <nav className="hidden md:flex">
          <ul className="flex gap-6 list-none m-0 p-0">
            <li>
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="text-white text-base font-medium no-underline transition-all duration-300 hover:text-primary-400 hover:scale-105 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div
          data-testid="hamburger-menu"
          className={`relative w-8 h-6 cursor-pointer z-[11] md:hidden transition-transform duration-300 ${
            mobileMenuOpen ? "rotate-90" : ""
          }`}
          onClick={toggleMobileMenu}
        >
          <div
            className={`absolute w-full h-0.5 bg-white transition-all duration-300 rounded ${
              mobileMenuOpen
                ? "top-1/2 -translate-y-1/2 rotate-45"
                : "top-0"
            }`}
          ></div>
          <div
            className={`absolute w-full h-0.5 bg-white transition-all duration-300 top-1/2 -translate-y-1/2 rounded ${
              mobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></div>
          <div
            className={`absolute w-full h-0.5 bg-white transition-all duration-300 rounded ${
              mobileMenuOpen
                ? "bottom-1/2 translate-y-1/2 -rotate-45"
                : "bottom-0"
            }`}
          ></div>
        </div>
      </div>
      
      <div
        data-testid="mobile-menu"
        className={`fixed right-0 top-[70px] w-full h-full bg-gradient-to-br from-dark-900 to-dark-800 z-[1000] overflow-auto transition-transform duration-300 md:hidden shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-10 h-full flex flex-col justify-center items-center gap-8 box-border">
          <ul className="flex flex-col gap-8 list-none m-0 p-0">
            <li>
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="font-semibold text-3xl leading-tight text-white no-underline transition-all duration-300 relative hover:text-primary-400 hover:scale-105 group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-primary-400 transition-all duration-300 group-hover:w-full rounded"></span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default TopNavigationBar;
