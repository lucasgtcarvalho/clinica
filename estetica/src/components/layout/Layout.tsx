import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
