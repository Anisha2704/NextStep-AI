import { Outlet, NavLink, Link } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left marketing panel on desktop */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-lavender p-12">
          <Link to="/" aria-label="NextStep AI Home">
            <Logo size="lg" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold leading-tight text-text-main">
              Know Your Skills.
              <br />
              Find Your Path.
              <br />
              <span className="text-primary">Take the Next Step.</span>
            </h1>
            <p className="mt-4 max-w-md text-text-secondary leading-relaxed">
              AI-powered career development platform for students and professionals.
              Build your profile, discover skill gaps, and follow personalized learning paths.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <p>© 2026 NextStep AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <NavLink
                to="/privacy-policy"
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'font-medium text-primary' : 'hover:text-primary'}`
                }
              >
                Privacy Policy
              </NavLink>
              <NavLink
                to="/terms-of-service"
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'font-medium text-primary' : 'hover:text-primary'}`
                }
              >
                Terms of Service
              </NavLink>
            </div>
          </div>
        </div>

        {/* Right authentication panel */}
        <div className="flex w-full flex-col justify-between px-6 py-12 lg:w-1/2 min-h-screen">
          <div className="mb-8 lg:hidden">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>

          {/* Main auth form outlet */}
          <div className="my-auto w-full max-w-md mx-auto">
            <Outlet />
          </div>

          {/* Footer navigation */}
          <div className="mx-auto mt-8 flex w-full max-w-md items-center justify-between border-t border-border pt-4 text-xs text-text-secondary">
            <span>© 2026 NextStep AI</span>
            <div className="flex items-center gap-3">
              <NavLink
                to="/privacy-policy"
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'font-medium text-primary' : 'hover:text-primary'}`
                }
              >
                Privacy Policy
              </NavLink>
              <span>•</span>
              <NavLink
                to="/terms-of-service"
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'font-medium text-primary' : 'hover:text-primary'}`
                }
              >
                Terms of Service
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
