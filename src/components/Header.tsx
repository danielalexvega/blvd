import { useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import IconSpain from "../icons/IconSpain";
import IconUnitedStates from "../icons/IconUnitedStates";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { IconButton } from "../icons/IconButton";

const Header: React.FC = () => {
  const location = useLocation();
  const isResearchPage = location.pathname.match(/^\/research\/[\w-]+$/);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${isScrolled ? 'bg-white' : 'bg-transparent'} hover:bg-white transition-colors duration-200 sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div 
          className="grid items-center"
          style={{
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            columnGap: '1rem'
          }}
        >
          {/* Logo - spans 2 columns */}
          <div className="col-span-2">
            <Logo />
          </div>
          
          {/* Navigation - spans 6 columns (center) */}
          <div className="col-span-6 flex justify-center">
            <Navigation />
          </div>
          
          {/* Secondary links and CTA - spans 4 columns (right) */}
          <div className="col-span-4 flex items-center justify-end gap-6">
            <a href="#" className="text-black hover:text-gray-700 transition-colors duration-200 font-normal">
              We're Hiring
            </a>
            <a href="#" className="text-black hover:text-gray-700 transition-colors duration-200 font-normal">
              Login
            </a>
            <button className="bg-amber-200 hover:bg-amber-300 text-black px-4 py-2 rounded-md font-normal transition-colors duration-200">
              GET A DEMO
            </button>
          </div>
        </div>
      </div>
      
      {/* Language selector for research pages */}
      {isResearchPage && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2 justify-end items-center">
            <IconButton
              icon={
                <IconUnitedStates
                  className={`hover:cursor-pointer hover:scale-110`}
                />
              }
              isSelected={lang === "en-US" || lang === null}
              onClick={() =>
                setSearchParams(prev => {
                  prev.delete("lang");
                  return prev;
                })}
            />
            <IconButton
              icon={
                <IconSpain
                  className={`hover:cursor-pointer hover:scale-110`}
                />
              }
              isSelected={lang === "es-ES"}
              onClick={() => {
                setSearchParams(prev => {
                  prev.set("lang", "es-ES");
                  return prev;
                });
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
