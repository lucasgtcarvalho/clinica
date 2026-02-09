import { useState } from 'react';
import { Search, Plus, Phone, Mail, Calendar } from 'lucide-react';
import { Client } from '@/types';

// Dados mockados
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva',
    phone: '(11) 99999-9999',
    email: 'maria@exemplo.com',
    birthDate: '1990-05-15',
    clinicId: '1',
  },
  {
    id: '2',
    name: 'João Souza',
    phone: '(11) 88888-8888',
    email: 'joao@exemplo.com',
    birthDate: '1985-10-20',
    clinicId: '1',
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    phone: '(11) 77777-7777',
    email: 'ana@exemplo.com',
    birthDate: '1995-03-10',
    clinicId: '1',
  },
];

export function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients] = useState(mockClients);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button className="bg-purple-600 text-white p-2 rounded-full shadow-sm">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{client.name}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </div>
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                  {client.birthDate && (
                    <div className="text-sm text-gray-500">
                      Nascimento: {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
              <button className="text-purple-600">
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
