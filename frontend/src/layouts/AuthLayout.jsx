import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-lavender p-12">
          <Logo size="lg" />
          <div>
            <h1 className="text-4xl font-bold leading-tight text-text-main">
              Know Your Skills.
              <br />
              Find Your Path.
              <br />
              <span className="text-primary">Take the Next Step.</span>
            </h1>
            <p className="mt-4 max-w-md text-text-secondary">
              AI-powered career development platform for students and professionals.
              Build your profile, discover skill gaps, and follow personalized learning paths.
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            © 2026 NextStep AI. All rights reserved.
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
