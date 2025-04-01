import { useAuth } from "@/hooks/useAuth";
import RewardsButton from "@/components/loyalty/RewardsButton";
import { Link, useLocation } from "wouter";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
            alt="Bistro 23 Logo"
            className="h-10 w-10 rounded-full"
          />
          <h1 className="ml-3 font-heading font-bold text-xl text-dark">Bistro 23</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              <RewardsButton points={user.loyaltyPoints} />
              <div className="relative">
                <button className="bg-light rounded-full p-1 focus:outline-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-dark"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                  <div className="py-1">
                    <span className="block px-4 py-2 text-sm text-gray-700">{user.name}</span>
                    <span className="block px-4 py-2 text-sm text-gray-700">{user.loyaltyPoints} points</span>
                    <Link href="/rewards">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Rewards</a>
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link href="/login">
              <a className="bg-light rounded-full p-1 focus:outline-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
