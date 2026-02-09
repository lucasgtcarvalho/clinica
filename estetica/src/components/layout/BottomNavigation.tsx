import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, DollarSign, Scissors, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

export function BottomNavigation() {
  const location = useLocation();

  const routes = [
    { path: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/agenda', icon: <Calendar className="h-5 w-5" />, label: 'Agenda' },
    { path: '/clients', icon: <Users className="h-5 w-5" />, label: 'Clientes' },
    { path: '/financial', icon: <DollarSign className="h-5 w-5" />, label: 'Financeiro' },
    { path: '/services', icon: <Scissors className="h-5 w-5" />, label: 'Serviços' },
    { path: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Configurações' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-16">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1',
                location.pathname === route.path
                  ? 'text-purple-600 font-medium'
                  : 'text-gray-500'
              )}
            >
              {route.icon}
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
