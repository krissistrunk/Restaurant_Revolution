import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  
  // Extract the current tab from the location
  const currentTab = location === "/" ? "/" : location;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-2 no-scrollbar">
          {/* Restaurant Revolution v3 Navigation */}
          <Link href="/">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/" ? "tab-active" : "text-gray-600"}`}>
              🏠 Home
            </a>
          </Link>
          
          {/* Experience Dropdown */}
          <div className="relative">
            <button
              className={`flex-shrink-0 px-4 py-2 font-medium text-sm flex items-center gap-1 ${
                ["/customer-experience", "/owner-experience"].includes(currentTab) ? "tab-active" : "text-gray-600"
              } hover:text-primary transition-colors`}
              onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
            >
              🚀 Experience
              <ChevronDown className={`h-3 w-3 transition-transform ${showExperienceDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showExperienceDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <Link href="/customer-experience">
                    <a 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                      onClick={() => setShowExperienceDropdown(false)}
                    >
                      👥 Customer Experience
                    </a>
                  </Link>
                  <Link href="/owner-experience">
                    <a 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                      onClick={() => setShowExperienceDropdown(false)}
                    >
                      🏢 Owner Experience
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Link href="/platform-demos">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/platform-demos" ? "tab-active" : "text-gray-600"}`}>
              🎯 Demos
            </a>
          </Link>
          
          <Link href="/pricing">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/pricing" ? "tab-active" : "text-gray-600"}`}>
              💰 Pricing
            </a>
          </Link>

          {/* Separator */}
          <div className="flex-shrink-0 w-px bg-gray-300 mx-2 my-1"></div>

          {/* Restaurant Demo Navigation */}
          <Link href="/menu">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/menu" ? "tab-active" : "text-gray-600"}`}>
              🍽️ Menu
            </a>
          </Link>
          <Link href="/order">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/order" ? "tab-active" : "text-gray-600"}`}>
              🛒 Order
            </a>
          </Link>
          <Link href="/owner">
            <a className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${currentTab === "/owner" ? "tab-active" : "text-gray-600"}`}>
              🏢 Owner Portal
            </a>
          </Link>
          
          {/* Marketing & Sales */}
          <div className="relative">
            <button
              className={`flex-shrink-0 px-4 py-2 font-medium text-sm flex items-center gap-1 ${
                ["/sales", "/marketing"].includes(currentTab) ? "tab-active" : "text-gray-600"
              } hover:text-primary transition-colors`}
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
            >
              📈 Sales
              <ChevronDown className={`h-3 w-3 transition-transform ${showDemoDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDemoDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <a 
                    href="/marketing/owner-demo/interactive-demo.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                    onClick={() => setShowDemoDropdown(false)}
                  >
                    🃊 Owner Dashboard Demo
                  </a>
                  <a 
                    href="/marketing/customer-demo/interactive-demo.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                    onClick={() => setShowDemoDropdown(false)}
                  >
                    📱 Customer App Demo
                  </a>
                  <a 
                    href="/marketing-materials.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                    onClick={() => setShowDemoDropdown(false)}
                  >
                    📈 Marketing Materials
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
