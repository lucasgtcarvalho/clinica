import { useState } from 'react';
import { ChevronRight, Upload, User, Shield, Palette } from 'lucide-react';
import { Clinic } from '@/types';

// Dados mockados
const mockClinic: Clinic = {
  id: '1',
  name: 'Clínica Bella',
  address: 'Rua das Flores, 123 - São Paulo',
  themeColor: '#8b5cf6',
  workingHours: [
    { day: 1, start: '08:00', end: '18:00' },
    { day: 2, start: '08:00', end: '18:00' },
    { day: 3, start: '08:00', end: '18:00' },
    { day: 4, start: '08:00', end: '18:00' },
    { day: 5, start: '08:00', end: '18:00' },
  ],
};

export function SettingsPage() {
  const [clinic] = useState(mockClinic);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie as configurações da sua clínica</p>
      </div>

      {/* Seção da clínica */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clínica</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Nome da Clínica</p>
              <p className="font-medium">{clinic.name}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Endereço</p>
              <p className="font-medium">{clinic.address}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Logo</p>
              <p className="font-medium">Carregar logo</p>
            </div>
            <Upload className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Seção de horários */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Horários de Funcionamento</h2>
        <div className="space-y-3">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="font-medium">{day}</p>
              <p className="text-gray-600">
                {index >= 1 && index <= 5 ? '08:00 - 18:00' : 'Fechado'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de preferências */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <p className="font-medium">Tema da Clínica</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-600"></div>
          </div>
        </div>
      </div>

      {/* Seção de usuários */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usuários</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <p className="font-medium">Gerenciar Usuários</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <p className="font-medium">Permissões</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
