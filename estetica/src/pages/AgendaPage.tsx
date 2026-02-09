import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Appointment } from '@/types';
import { cn } from '@/utils/cn';

// Dados mockados
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    services: [
      { id: '1', serviceId: '1', name: 'Limpeza de Pele', duration: 60, price: 150 },
    ],
    start: new Date(new Date().setHours(10, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(11, 0, 0)).toISOString(),
    status: 'scheduled',
    clinicId: '1',
  },
  {
    id: '2',
    clientId: '2',
    services: [
      { id: '1', serviceId: '2', name: 'Botox', duration: 30, price: 800 },
    ],
    start: new Date(new Date().setHours(14, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(14, 30, 0)).toISOString(),
    status: 'confirmed',
    clinicId: '1',
  },
];

export function AgendaPage() {
  const [currentView, setCurrentView] = useState('timeGridWeek');

  const handleDateClick = (info: any) => {
    // Abrir modal de cadastro de atendimento
    console.log('Clicou em data/hora:', info.dateStr);
  };

  const handleEventClick = (info: any) => {
    // Abrir modal de detalhes do atendimento
    console.log('Clicou em evento:', info.event);
  };

  const handleEventDrop = (info: any) => {
    // Atualizar agendamento
    console.log('Evento movido para:', info.event.start);
  };

  const eventColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#6366f1'; // indigo
      case 'confirmed':
        return '#10b981'; // emerald
      case 'in_progress':
        return '#f59e0b'; // amber
      case 'completed':
        return '#14b8a6'; // teal
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6366f1';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('timeGridDay')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium',
              currentView === 'timeGridDay'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            )}
          >
            Dia
          </button>
          <button
            onClick={() => setCurrentView('timeGridWeek')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium',
              currentView === 'timeGridWeek'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            )}
          >
            Semana
          </button>
          <button
            onClick={() => setCurrentView('dayGridMonth')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium',
              currentView === 'dayGridMonth'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            )}
          >
            Mês
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          locales={[ptBrLocale]}
          locale="pt-br"
          events={mockAppointments.map((appt) => ({
            id: appt.id,
            title: appt.services[0].name,
            start: appt.start,
            end: appt.end,
            backgroundColor: eventColor(appt.status),
            borderColor: eventColor(appt.status),
          }))}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
        />
      </div>
    </div>
  );
}
