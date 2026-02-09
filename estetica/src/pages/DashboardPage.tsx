import { useState } from 'react';
import { Users, TrendingUp, Calendar, DollarSign, Clock, Package, BarChart3 } from 'lucide-react';
import { Appointment, Client, FinancialEntry } from '@/types';

// Dados mockados para o dashboard
const mockClients: Client[] = [
  { id: '1', name: 'Maria Silva', phone: '(11) 99999-9999', email: 'maria@exemplo.com', clinicId: '1' },
  { id: '2', name: 'João Souza', phone: '(11) 88888-8888', email: 'joao@exemplo.com', clinicId: '1' },
  { id: '3', name: 'Ana Oliveira', phone: '(11) 77777-7777', email: 'ana@exemplo.com', clinicId: '1' },
  { id: '4', name: 'Carlos Santos', phone: '(11) 66666-6666', email: 'carlos@exemplo.com', clinicId: '1' },
];

const mockAppointments: Appointment[] = [
  { id: '1', clientId: '1', services: [{ id: '1', serviceId: '1', name: 'Limpeza de Pele', duration: 60, price: 150 }], start: new Date().toISOString(), end: new Date(new Date().setHours(11, 0, 0)).toISOString(), status: 'confirmed', clinicId: '1' },
  { id: '2', clientId: '2', services: [{ id: '2', serviceId: '2', name: 'Botox', duration: 30, price: 800 }], start: new Date(new Date().setHours(14, 0, 0)).toISOString(), end: new Date(new Date().setHours(14, 30, 0)).toISOString(), status: 'scheduled', clinicId: '1' },
  { id: '3', clientId: '3', services: [{ id: '3', serviceId: '3', name: 'Hidratação Facial', duration: 45, price: 120 }], start: new Date(new Date().setHours(16, 0, 0)).toISOString(), end: new Date(new Date().setHours(16, 45, 0)).toISOString(), status: 'in_progress', clinicId: '1' },
];

const mockFinancialEntries: FinancialEntry[] = [
  { id: '1', appointmentId: '1', clientId: '1', totalAmount: 150, paymentMethod: 'card', status: 'paid', date: new Date().toISOString(), clinicId: '1' },
  { id: '2', appointmentId: '2', clientId: '2', totalAmount: 800, paymentMethod: 'pix', status: 'paid', date: new Date().toISOString(), clinicId: '1' },
  { id: '3', appointmentId: '3', clientId: '3', totalAmount: 120, paymentMethod: 'cash', status: 'pending', date: new Date().toISOString(), clinicId: '1' },
];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Fev', revenue: 18000 },
  { month: 'Mar', revenue: 15000 },
  { month: 'Abr', revenue: 22000 },
  { month: 'Mai', revenue: 19000 },
  { month: 'Jun', revenue: 25000 },
];

const servicePopularity = [
  { name: 'Limpeza de Pele', value: 45 },
  { name: 'Botox', value: 25 },
  { name: 'Hidratação', value: 20 },
  { name: 'Outros', value: 10 },
];

export function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Cálculos
  const totalClients = mockClients.length;
  const todayAppointments = mockAppointments.filter(appt => {
    const apptDate = new Date(appt.start);
    const today = new Date();
    return apptDate.toDateString() === today.toDateString();
  });
  
  const totalRevenue = mockFinancialEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  const averageDuration = mockAppointments.reduce((sum, appt) => sum + appt.services[0].duration, 0) / mockAppointments.length;
  
  const pendingPayments = mockFinancialEntries.filter(entry => entry.status === 'pending').length;
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumo geral da clínica</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${selectedPeriod === period ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {period === 'today' && 'Hoje'}
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'year' && 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12% este mês
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Atendimentos Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              <p className="text-xs text-gray-500 mt-1">{pendingPayments} pendentes</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faturamento Hoje</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +24% vs ontem
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Duração Média</p>
              <p className="text-2xl font-bold text-gray-900">{averageDuration.toFixed(0)} min</p>
              <p className="text-xs text-gray-500 mt-1">Por atendimento</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Faturamento */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Faturamento Mensal</h2>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {revenueData.map((item) => (
              <div key={item.month} className="flex items-center">
                <div className="w-12 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 rounded-md bg-gradient-to-r from-purple-500 to-purple-300" style={{ width: `${(item.revenue / 30000) * 100}%` }}></div>
                </div>
                <div className="w-16 text-right text-sm font-medium">R$ {(item.revenue / 1000).toFixed(0)}k</div>
              </div>
            ))}
          </div>
        </div>

        {/* Popularidade de Serviços */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Serviços Populares</h2>
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {servicePopularity.map((service) => (
              <div key={service.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-gray-600">{service.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${service.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximos Atendimentos */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Próximos Atendimentos</h2>
          <span className="text-sm text-purple-600 font-medium">Ver todos</span>
        </div>
        <div className="space-y-3">
          {mockAppointments.slice(0, 3).map((appt) => {
            const client = mockClients.find(c => c.id === appt.clientId);
            const time = new Date(appt.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={appt.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">{client?.name}</p>
                  <p className="text-sm text-gray-600">{appt.services[0].name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{time}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                    {appt.status === 'confirmed' ? 'Confirmado' : appt.status === 'scheduled' ? 'Agendado' : 'Em andamento'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h2>
          <span className="text-sm text-purple-600 font-medium">Ver detalhes</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-green-800 mb-1">Receitas do Dia</p>
            <p className="text-2xl font-bold text-green-900">R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-green-700 mt-1">Total recebido</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
            <p className="text-sm text-amber-800 mb-1">Pagamentos Pendentes</p>
            <p className="text-2xl font-bold text-amber-900">{pendingPayments}</p>
            <p className="text-xs text-amber-700 mt-1">Aguardando confirmação</p>
          </div>
        </div>
      </div>
    </div>
  );
}
