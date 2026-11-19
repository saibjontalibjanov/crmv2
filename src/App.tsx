import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type {
  ActiveView,
  Agent,
  BookingRecord,
  CrmTask,
  EmailTemplate,
  FlightOption,
  Lead,
  LeadDocument,
  LeadStatus,
  NotificationItem,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserRole,
} from './types/crm';
import {
  FLIGHT_CATALOG,
  INITIAL_AGENTS,
  INITIAL_BOOKINGS,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_LEADS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TASKS,
  INITIAL_TICKETS,
} from './data/seedData';
import {
  addFlightOptionToLead,
  generateNextLeadId,
  generateNextTicketId,
  selectFlightOption,
  toggleFlightBookmark,
} from './utils/crmLogic';
import { TopBar } from './components/TopBar';
import { LeadsDashboard } from './components/LeadsDashboard';
import { LeadDetailsPage } from './components/LeadDetailsPage';
import { EmailTemplatesModal } from './components/EmailTemplatesModal';
import { ItineraryPreviewModal } from './components/ItineraryPreviewModal';
import { TicketSearchModal } from './components/TicketSearchModal';
import { LeadFormModal } from './components/LeadFormModal';
import { SupportTicketsView } from './components/SupportTicketsView';
import {
  AgencySettingsView,
  AnalyticsView,
  BookingsView,
  CalendarView,
  ClientsView,
  TasksView,
  TeamManagementView,
} from './components/SecondaryViews';

const STORAGE_KEYS = {
  leads: 'staravia_crm_leads_v1',
  templates: 'staravia_crm_templates_v1',
  tickets: 'staravia_crm_tickets_v1',
  tasks: 'staravia_crm_tasks_v1',
  agents: 'staravia_crm_agents_v1',
  role: 'staravia_crm_role_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseRouteFromLocation(): { view: ActiveView; leadId?: string } {
  const path = window.location.pathname;
  const leadMatch = path.match(/^\/leads\/(LD-\d+)/i);
  if (leadMatch) {
    return { view: 'lead_detail', leadId: leadMatch[1].toUpperCase() };
  }
  const viewMap: Record<string, ActiveView> = {
    '/bookings': 'bookings',
    '/clients': 'clients',
    '/tickets': 'tickets',
    '/analytics': 'analytics',
    '/calendar': 'calendar',
    '/tasks': 'tasks',
    '/team': 'team_management',
    '/settings': 'agency_settings',
  };
  return { view: viewMap[path] ?? 'leads' };
}

function getPathForRoute(view: ActiveView, leadId?: string): string {
  if (view === 'lead_detail' && leadId) return `/leads/${leadId}`;
  const pathMap: Record<ActiveView, string> = {
    leads: '/',
    lead_detail: '/',
    bookings: '/bookings',
    clients: '/clients',
    tickets: '/tickets',
    analytics: '/analytics',
    calendar: '/calendar',
    tasks: '/tasks',
    team_management: '/team',
    agency_settings: '/settings',
  };
  return pathMap[view];
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => loadStored(STORAGE_KEYS.leads, INITIAL_LEADS));
  const [templates, setTemplates] = useState<EmailTemplate[]>(() =>
    loadStored(STORAGE_KEYS.templates, INITIAL_EMAIL_TEMPLATES)
  );
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    loadStored(STORAGE_KEYS.tickets, INITIAL_TICKETS)
  );
  const [tasks, setTasks] = useState<CrmTask[]>(() => loadStored(STORAGE_KEYS.tasks, INITIAL_TASKS));
  const [agents, setAgents] = useState<Agent[]>(() =>
    loadStored(STORAGE_KEYS.agents, INITIAL_AGENTS)
  );
  const [bookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [currentRole, setCurrentRole] = useState<UserRole>(() =>
    loadStored<UserRole>(STORAGE_KEYS.role, 'sales_agent')
  );

  // Route state synced with unique Lead ID URL (/leads/LD-3846)
  const initialRoute = useMemo(() => parseRouteFromLocation(), []);
  const [activeView, setActiveView] = useState<ActiveView>(initialRoute.view);
  const [activeLeadId, setActiveLeadId] = useState<string | undefined>(initialRoute.leadId);

  // Pop-up Modal states
  const [emailModal, setEmailModal] = useState<{
    open: boolean;
    lead?: Lead;
    flight?: FlightOption;
  }>({ open: false });
  const [itineraryModal, setItineraryModal] = useState<{
    open: boolean;
    lead?: Lead;
    flight?: FlightOption;
  }>({ open: false });
  const [ticketSearchModal, setTicketSearchModal] = useState<{
    open: boolean;
    lead?: Lead;
  }>({ open: false });
  const [leadFormModal, setLeadFormModal] = useState<{
    open: boolean;
    editingLead?: Lead;
  }>({ open: false });

  // Brief confirmation toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 3000);
  }, []);

  // Persist domain state
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
    } catch {
      /* ignore quota errors */
    }
  }, [leads]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
    } catch {
      /* ignore */
    }
  }, [templates]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets));
    } catch {
      /* ignore */
    }
  }, [tickets]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.agents, JSON.stringify(agents));
    } catch {
      /* ignore */
    }
  }, [agents]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.role, JSON.stringify(currentRole));
    } catch {
      /* ignore */
    }
  }, [currentRole]);

  // Browser back/forward sync
  useEffect(() => {
    const onPopState = () => {
      const parsed = parseRouteFromLocation();
      setActiveView(parsed.view);
      setActiveLeadId(parsed.leadId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((view: ActiveView, leadId?: string) => {
    setActiveView(view);
    setActiveLeadId(leadId);
    const nextPath = getPathForRoute(view, leadId);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const activeLead = useMemo(
    () => (activeLeadId ? leads.find((l) => l.id === activeLeadId) : undefined),
    [leads, activeLeadId]
  );

  const openTicketsCount = useMemo(
    () => tickets.filter((t) => t.status !== 'Resolved').length,
    [tickets]
  );

  // Lead Operations
  const handleSaveLead = (data: Parameters<React.ComponentProps<typeof LeadFormModal>['onSaveLead']>[0]) => {
    const agent = agents.find((a) => a.id === data.assignedAgentId) ?? agents[0];
    const nowTime = '19 Nov, 20:10';

    if (data.id) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === data.id
            ? {
                ...lead,
                clientName: data.clientName,
                countryCode: data.countryCode,
                email: data.email,
                phone: data.phone,
                telegramHandle: data.telegramHandle,
                whatsappPhone: data.whatsappPhone,
                originCode: data.originCode,
                originCity: data.originCity,
                destinationCode: data.destinationCode,
                destinationCity: data.destinationCity,
                departIso: data.departIso,
                returnIso: data.returnIso,
                travelDatesLabel: data.travelDatesLabel,
                departDateLabel: `${data.departIso}, 10:00`,
                returnDateLabel: `${data.returnIso}, 18:00`,
                cabinClass: data.cabinClass,
                pax: data.pax,
                source: data.source,
                status: data.status,
                priority: data.priority,
                assignedAgentId: agent.id,
                assignedInitials: agent.initials,
                assignedName: agent.shortName,
                tags: data.tags,
                history: [
                  {
                    id: `h-${Date.now()}`,
                    timestamp: nowTime,
                    actor: 'Saibjon T.',
                    action: 'Lead updated',
                    detail: `Updated travel route (${data.originCode} → ${data.destinationCode}) and passenger details.`,
                  },
                  ...lead.history,
                ],
              }
            : lead
        )
      );
      showToast(`Updated lead ${data.id}`);
    } else {
      const nextId = generateNextLeadId(leads);
      const matchingCatalogFlights = FLIGHT_CATALOG.filter(
        (f) => f.outbound.toCode === data.destinationCode
      ).slice(0, 2);

      const initialOptions: FlightOption[] = matchingCatalogFlights.map((f, idx) => ({
        ...f,
        id: `opt-${nextId}-${idx + 1}`,
        selected: idx === 0,
      }));

      const estimated = initialOptions[0]
        ? initialOptions[0].pricePerPassenger * data.pax
        : data.cabinClass === 'Business Class'
          ? 1650 * data.pax
          : 580 * data.pax;

      const createdLead: Lead = {
        id: nextId,
        clientName: data.clientName,
        countryCode: data.countryCode,
        phone: data.phone,
        email: data.email,
        telegramHandle: data.telegramHandle,
        whatsappPhone: data.whatsappPhone,
        pax: data.pax,
        originCode: data.originCode,
        originCity: data.originCity,
        destinationCode: data.destinationCode,
        destinationCity: data.destinationCity,
        travelDatesLabel: data.travelDatesLabel,
        departDateLabel: `${data.departIso}, 10:00`,
        returnDateLabel: `${data.returnIso}, 18:00`,
        departIso: data.departIso,
        returnIso: data.returnIso,
        cabinClass: data.cabinClass,
        source: data.source,
        status: data.status,
        priority: data.priority,
        assignedAgentId: agent.id,
        assignedInitials: agent.initials,
        assignedName: agent.shortName,
        createdAt: nowTime,
        createdDateKey: 'Nov 19, 2026',
        tags: data.tags,
        estimatedValue: estimated,
        flightOptions: initialOptions,
        notes: [],
        history: [
          {
            id: `h-${Date.now()}`,
            timestamp: nowTime,
            actor: 'Saibjon T.',
            action: 'Lead created',
            detail: `Created new inquiry for ${data.originCode} → ${data.destinationCode} (${data.pax} pax).`,
          },
        ],
        documents: [],
        communications: [],
      };
      setLeads((prev) => [createdLead, ...prev]);
      showToast(`Created lead ${nextId} for ${createdLead.clientName}`);
    }
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status,
              history: [
                {
                  id: `h-${Date.now()}`,
                  timestamp: 'Just now',
                  actor: 'Saibjon T.',
                  action: 'Status updated',
                  detail: `Changed lead status from ${lead.status} to ${status}.`,
                },
                ...lead.history,
              ],
            }
          : lead
      )
    );
    showToast(`Lead ${leadId} marked ${status}`);
  };

  const handleBulkStatusUpdate = (leadIds: string[], status: LeadStatus) => {
    const idSet = new Set(leadIds);
    setLeads((prev) =>
      prev.map((lead) => (idSet.has(lead.id) ? { ...lead, status } : lead))
    );
    showToast(`Updated ${leadIds.length} lead(s) to ${status}`);
  };

  const handleDeleteLeads = (leadIds: string[]) => {
    const idSet = new Set(leadIds);
    setLeads((prev) => prev.filter((l) => !idSet.has(l.id)));
    if (activeLeadId && idSet.has(activeLeadId)) {
      navigate('leads');
    }
    showToast(`Removed ${leadIds.length} lead(s)`);
  };

  const handleAssignAgent = (leadId: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              assignedAgentId: agent.id,
              assignedInitials: agent.initials,
              assignedName: agent.shortName,
            }
          : lead
      )
    );
    showToast(`Reassigned ${leadId} to ${agent.shortName}`);
  };

  const handleSelectFlight = (leadId: string, flightId: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? selectFlightOption(lead, flightId) : lead))
    );
    showToast('Updated primary flight option');
  };

  const handleToggleBookmark = (leadId: string, flightId: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? toggleFlightBookmark(lead, flightId) : lead))
    );
  };

  const handleAddFlightToLead = (leadId: string, flight: FlightOption) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const updated = addFlightOptionToLead(lead, flight);
        if (updated.flightOptions.length === lead.flightOptions.length) return lead;
        return {
          ...updated,
          history: [
            {
              id: `h-${Date.now()}`,
              timestamp: 'Just now',
              actor: 'Saibjon T.',
              action: 'Flight option added',
              detail: `Attached ${flight.airlineName} ${flight.outbound.flightNumber} ($${flight.pricePerPassenger}/pax) from Ticket Search.`,
            },
            ...updated.history,
          ],
        };
      })
    );
    showToast(`Added ${flight.airlineName} option to ${leadId}`);
  };

  const handleAddNote = (leadId: string, content: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              notes: [
                {
                  id: `n-${Date.now()}`,
                  author: 'Saibjon T.',
                  authorInitials: 'ST',
                  createdAt: 'Just now',
                  content,
                },
                ...lead.notes,
              ],
              history: [
                {
                  id: `h-${Date.now()}`,
                  timestamp: 'Just now',
                  actor: 'Saibjon T.',
                  action: 'Note added',
                  detail: content.slice(0, 90),
                },
                ...lead.history,
              ],
            }
          : lead
      )
    );
    showToast('Client note saved');
  };

  const handleAddTag = (leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId && !lead.tags.includes(tag)
          ? { ...lead, tags: [...lead.tags, tag] }
          : lead
      )
    );
  };

  const handleRemoveTag = (leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, tags: lead.tags.filter((t) => t !== tag) } : lead
      )
    );
  };

  const handleLogCall = (leadId: string, summary: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              communications: [
                {
                  id: `comm-${Date.now()}`,
                  channel: 'Phone',
                  subject: 'Outbound consultation call',
                  summary,
                  timestamp: 'Just now',
                  direction: 'Outbound',
                  agentName: 'Saibjon T.',
                  status: 'Completed',
                },
                ...lead.communications,
              ],
              history: [
                {
                  id: `h-${Date.now()}`,
                  timestamp: 'Just now',
                  actor: 'Saibjon T.',
                  action: 'Phone call logged',
                  detail: summary,
                },
                ...lead.history,
              ],
            }
          : lead
      )
    );
    showToast('Phone call logged');
  };

  const handleAddDocument = (
    leadId: string,
    doc: Omit<LeadDocument, 'id' | 'uploadedAt' | 'uploadedBy'>
  ) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              documents: [
                {
                  ...doc,
                  id: `doc-${Date.now()}`,
                  uploadedAt: 'Just now',
                  uploadedBy: 'Saibjon T.',
                },
                ...lead.documents,
              ],
              history: [
                {
                  id: `h-${Date.now()}`,
                  timestamp: 'Just now',
                  actor: 'Saibjon T.',
                  action: 'Document uploaded',
                  detail: `Attached ${doc.name} (${doc.category}).`,
                },
                ...lead.history,
              ],
            }
          : lead
      )
    );
    showToast(`Uploaded ${doc.name}`);
  };

  const handleCreateTemplate = (tpl: Omit<EmailTemplate, 'id'>): EmailTemplate => {
    const created: EmailTemplate = {
      ...tpl,
      id: `tpl-custom-${Date.now()}`,
    };
    setTemplates((prev) => [...prev, created]);
    showToast(`Saved template "${created.name}"`);
    return created;
  };

  const handleSendEmail = (payload: {
    leadId?: string;
    recipientEmail: string;
    subject: string;
    bodySummary: string;
    isDraft: boolean;
    templateName: string;
  }) => {
    if (payload.leadId) {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== payload.leadId) return lead;
          const nextStatus: LeadStatus =
            !payload.isDraft &&
            payload.templateName.toLowerCase().includes('offer') &&
            (lead.status === 'New' || lead.status === 'In Progress')
              ? 'Quoted'
              : lead.status;

          return {
            ...lead,
            status: nextStatus,
            communications: [
              {
                id: `comm-${Date.now()}`,
                channel: 'Email',
                subject: payload.subject,
                summary: payload.bodySummary,
                timestamp: 'Just now',
                direction: 'Outbound',
                agentName: 'Saibjon T.',
                status: payload.isDraft ? 'Draft' : 'Sent',
              },
              ...lead.communications,
            ],
            history: [
              {
                id: `h-${Date.now()}`,
                timestamp: 'Just now',
                actor: 'Saibjon T.',
                action: payload.isDraft ? 'Email draft saved' : 'Email sent',
                detail: `${payload.subject} → ${payload.recipientEmail}`,
              },
              ...lead.history,
            ],
          };
        })
      );
    }
    showToast(
      payload.isDraft
        ? `Draft saved for ${payload.recipientEmail}`
        : `Email sent to ${payload.recipientEmail}`
    );
  };

  // Support Tickets Operations
  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status, slaDue: status === 'Resolved' ? 'Resolved' : t.slaDue }
          : t
      )
    );
    showToast(`Ticket ${ticketId} updated to ${status}`);
  };

  const handleReplyTicket = (ticketId: string, body: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: t.status === 'Open' ? 'In Progress' : t.status,
              messages: [
                ...t.messages,
                {
                  id: `tm-${Date.now()}`,
                  author: 'Saibjon T.',
                  role: 'Agent',
                  timestamp: 'Just now',
                  body,
                },
              ],
            }
          : t
      )
    );
    showToast(`Reply posted on ${ticketId}`);
  };

  const handleCreateTicket = (payload: {
    clientName: string;
    clientEmail: string;
    leadId?: string;
    pnr?: string;
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
  }) => {
    const nextId = generateNextTicketId(tickets);
    const created: SupportTicket = {
      id: nextId,
      leadId: payload.leadId,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      pnr: payload.pnr,
      subject: payload.subject,
      category: payload.category,
      priority: payload.priority,
      status: 'Open',
      assignedName: 'Saibjon T.',
      assignedInitials: 'ST',
      createdAt: 'Just now',
      slaDue: payload.priority === 'Urgent' ? '1h 00m left' : '4h 00m left',
      messages: [
        {
          id: `tm-${Date.now()}`,
          author: payload.clientName,
          role: 'Client',
          timestamp: 'Just now',
          body: payload.message,
        },
      ],
    };
    setTickets((prev) => [created, ...prev]);
    showToast(`Created support ticket ${nextId}`);
  };

  // Tasks Operations
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCreateTask = (
    title: string,
    dueDate: string,
    leadId?: string,
    clientName?: string
  ) => {
    const nextTask: CrmTask = {
      id: `task-${Date.now()}`,
      title,
      leadId,
      clientName,
      dueDate,
      priority: 'High',
      assignedName: 'Saibjon T.',
      completed: false,
    };
    setTasks((prev) => [nextTask, ...prev]);
    showToast('Task added to checklist');
  };

  return (
    <div className="min-h-screen w-full bg-[#F4FAF6] text-[#14261C] flex flex-col">
      <TopBar
        activeView={activeView}
        activeLeadId={activeLead?.id}
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'sales_agent' && (activeView === 'team_management' || activeView === 'agency_settings')) {
            navigate('leads');
          }
          showToast(
            `Switched access role to ${
              role === 'admin' ? 'Administrator' : role === 'manager' ? 'Operations Manager' : 'Sales Agent'
            }`
          );
        }}
        onNavigate={(view, leadId) => navigate(view, leadId)}
        onOpenTicketSearch={() => setTicketSearchModal({ open: true, lead: activeLead })}
        onOpenEmailTemplates={() => setEmailModal({ open: true, lead: activeLead })}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
        }
        onNotificationClick={(item) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
          );
          navigate(item.targetView, item.targetLeadId);
        }}
        openTicketsCount={openTicketsCount}
      />

      {/* Full-Screen Active Workspace (No Permanent Sidebar) */}
      {activeView === 'leads' && (
        <LeadsDashboard
          leads={leads}
          agents={agents}
          currentRole={currentRole}
          onOpenLead={(leadId) => navigate('lead_detail', leadId)}
          onOpenNewLeadModal={() => setLeadFormModal({ open: true })}
          onOpenEmailForLead={(leadId) => {
            const lead = leads.find((l) => l.id === leadId);
            setEmailModal({ open: true, lead });
          }}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onDeleteLeads={handleDeleteLeads}
        />
      )}

      {activeView === 'lead_detail' && activeLead && (
        <LeadDetailsPage
          lead={activeLead}
          agents={agents}
          currentRole={currentRole}
          onBack={() => navigate('leads')}
          onUpdateStatus={handleUpdateLeadStatus}
          onAssignAgent={handleAssignAgent}
          onSelectFlight={handleSelectFlight}
          onToggleBookmark={handleToggleBookmark}
          onPreviewFlight={(lead, flight) => setItineraryModal({ open: true, lead, flight })}
          onOpenEmailModal={(lead, flight) => setEmailModal({ open: true, lead, flight })}
          onOpenTicketSearch={(lead) => setTicketSearchModal({ open: true, lead })}
          onEditLead={(lead) => setLeadFormModal({ open: true, editingLead: lead })}
          onAddNote={handleAddNote}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onLogCall={handleLogCall}
          onAddDocument={handleAddDocument}
          onCreateTask={(title, leadId, clientName, dueDate) =>
            handleCreateTask(title, dueDate, leadId, clientName)
          }
          onDeleteLead={(leadId) => handleDeleteLeads([leadId])}
        />
      )}

      {activeView === 'lead_detail' && !activeLead && (
        <main className="w-full py-20 px-6 text-center">
          <h1 className="text-xl font-bold text-[#14261C]">Lead not found</h1>
          <p className="mt-1 text-sm text-[#5E7868]">
            The requested lead ID could not be located in your pipeline.
          </p>
          <button
            type="button"
            onClick={() => navigate('leads')}
            className="mt-4 h-10 px-5 rounded-xl bg-[#23804E] text-white text-sm font-semibold"
          >
            Back to Leads
          </button>
        </main>
      )}

      {activeView === 'tickets' && (
        <SupportTicketsView
          tickets={tickets}
          leads={leads}
          onOpenLead={(leadId) => navigate('lead_detail', leadId)}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onReplyTicket={handleReplyTicket}
          onCreateTicket={handleCreateTicket}
        />
      )}

      {activeView === 'bookings' && (
        <BookingsView bookings={bookings} onOpenLead={(leadId) => navigate('lead_detail', leadId)} />
      )}

      {activeView === 'clients' && (
        <ClientsView
          leads={leads}
          onOpenLead={(leadId) => navigate('lead_detail', leadId)}
          onEmailLead={(leadId) => {
            const lead = leads.find((l) => l.id === leadId);
            setEmailModal({ open: true, lead });
          }}
        />
      )}

      {activeView === 'analytics' && <AnalyticsView leads={leads} agents={agents} />}

      {activeView === 'calendar' && (
        <CalendarView leads={leads} onOpenLead={(leadId) => navigate('lead_detail', leadId)} />
      )}

      {activeView === 'tasks' && (
        <TasksView
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onCreateTask={(title, due) => handleCreateTask(title, due)}
          onOpenLead={(leadId) => navigate('lead_detail', leadId)}
        />
      )}

      {activeView === 'team_management' && (
        <TeamManagementView
          agents={agents}
          currentRole={currentRole}
          onUpdateAgentRole={(agentId, role) => {
            setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, role } : a)));
            showToast('Updated team member permissions');
          }}
        />
      )}

      {activeView === 'agency_settings' && <AgencySettingsView currentRole={currentRole} />}

      {/* POP-UP MODALS */}
      <EmailTemplatesModal
        isOpen={emailModal.open}
        onClose={() => setEmailModal({ open: false })}
        leads={leads}
        initialLead={emailModal.lead ?? activeLead}
        initialFlight={emailModal.flight}
        templates={templates}
        onCreateTemplate={handleCreateTemplate}
        onSendEmail={handleSendEmail}
      />

      <ItineraryPreviewModal
        isOpen={itineraryModal.open}
        onClose={() => setItineraryModal({ open: false })}
        lead={itineraryModal.lead}
        flight={itineraryModal.flight}
        onSendViaEmail={(lead, flight) => {
          setItineraryModal({ open: false });
          setEmailModal({ open: true, lead, flight });
        }}
      />

      <TicketSearchModal
        isOpen={ticketSearchModal.open}
        onClose={() => setTicketSearchModal({ open: false })}
        catalog={FLIGHT_CATALOG}
        leads={leads}
        targetLead={ticketSearchModal.lead ?? activeLead}
        onAddFlightToLead={handleAddFlightToLead}
        onPreviewFlight={(lead, flight) => {
          setTicketSearchModal({ open: false });
          setItineraryModal({ open: true, lead, flight });
        }}
      />

      <LeadFormModal
        isOpen={leadFormModal.open}
        onClose={() => setLeadFormModal({ open: false })}
        agents={agents}
        editingLead={leadFormModal.editingLead}
        onSaveLead={handleSaveLead}
      />

      {/* Action Confirmation Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#14261C] text-white text-sm font-medium shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-[#6CE09C] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
