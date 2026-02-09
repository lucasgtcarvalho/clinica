import { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { Service, Package } from '@/types';

// Dados mockados
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Limpeza de Pele',
    description: 'Limpeza profunda com extração de cravos e pontos negros',
    duration: 60,
    price: 150,
    clinicId: '1',
  },
  {
    id: '2',
    name: 'Botox',
    description: 'Aplicação de botox para redução de rugas',
    duration: 30,
    price: 800,
    clinicId: '1',
  },
  {
    id: '3',
    name: 'Hidratação Facial',
    description: 'Hidratação profunda com máscara nutritiva',
    duration: 45,
    price: 120,
    clinicId: '1',
  },
];

const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Pacote de Limpezas',
    services: [mockServices[0]],
    sessionCount: 5,
    totalPrice: 600,
    clinicId: '1',
  },
];

export function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <button className="bg-purple-600 text-white p-2 rounded-full shadow-sm">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'services'
              ? 'bg-white text-purple-600 border-b-2 border-purple-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          Serviços
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'packages'
              ? 'bg-white text-purple-600 border-b-2 border-purple-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          Pacotes
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {activeTab === 'services' && (
          <div className="space-y-4">
            {mockServices.map((service) => (
              <div key={service.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    )}
                  </div>
                  <p className="font-bold text-purple-600">R$ {service.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-4">
            {mockPackages.map((pkg) => (
              <div key={pkg.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {pkg.sessionCount} sessões de {pkg.services[0].name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">R$ {pkg.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 line-through">
                      R$ {(pkg.services[0].price * pkg.sessionCount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
