import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const AdminLayout = () => {
  return (
    <DashboardLayout title="Admin">
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
