import { useState } from 'react';
import { TrendingUp, Wallet, Calendar } from 'lucide-react';
import { FinancialEntry } from '@/types';

// Dados mockados
const mockFinancialEntries: FinancialEntry[] = [
  {
    id: '1',
    appointmentId: '1',
    clientId: '1',
    totalAmount: 150,
    paymentMethod: 'card',
    status: 'paid',
    date: new Date().toISOString(),
    clinicId: '1',
  },
  {
    id: '2',
    appointmentId: '2',
    clientId: '2',
    totalAmount: 800,
    paymentMethod: 'pix',
    status: 'paid',
    date: new Date().toISOString(),
    clinicId: '1',
  },
];

export function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const totalRevenue = mockFinancialEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faturamento Hoje</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Caixa Atual</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 mb-4">
        {['today', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              selectedPeriod === period
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {period === 'today' && 'Hoje'}
            {period === 'week' && 'Semana'}
            {period === 'month' && 'Mês'}
            {period === 'year' && 'Ano'}
          </button>
        ))}
      </div>

      {/* Lançamentos */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Lançamentos Recentes</h2>
        {mockFinancialEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <p className="font-medium text-gray-900">Cliente {entry.clientId}</p>
                <p className="text-sm text-gray-500">
                  Forma de pagamento: {entry.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">R$ {entry.totalAmount.toFixed(2)}</p>
                <p
                  className={`text-xs font-medium ${
                    entry.status === 'paid'
                      ? 'text-green-600'
                      : entry.status === 'pending'
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  {entry.status === 'paid' && 'Pago'}
                  {entry.status === 'pending' && 'Pendente'}
                  {entry.status === 'installment' && 'Parcelado'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
