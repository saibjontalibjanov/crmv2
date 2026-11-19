import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  LifeBuoy,
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
} from 'lucide-react';
import type {
  Lead,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../types/crm';
import { validateSupportTicket } from '../utils/crmLogic';

interface SupportTicketsViewProps {
  tickets: SupportTicket[];
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onReplyTicket: (ticketId: string, body: string) => void;
  onCreateTicket: (payload: {
    clientName: string;
    clientEmail: string;
    leadId?: string;
    pnr?: string;
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
  }) => void;
}

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Urgent: 'bg-[#FDECEC] text-[#B22E2E]',
  High: 'bg-[#FEF4E4] text-[#9E5B13]',
  Normal: 'bg-[#E6F5EC] text-[#1D7344]',
  Low: 'bg-[#EEF3F0] text-[#536D5E]',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: 'bg-[#E6F1FC] text-[#1F5E9B]',
  'In Progress': 'bg-[#DFF5E8] text-[#1D7344]',
  'Waiting Client': 'bg-[#FEF6E6] text-[#996012]',
  Resolved: 'bg-[#E8F4ED] text-[#3B624B]',
};

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({
  tickets,
  leads,
  onOpenLead,
  onUpdateTicketStatus,
  onReplyTicket,
  onCreateTicket,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(tickets[0]?.id ?? '');
  const [replyText, setReplyText] = useState('');

  // Create Ticket modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newLeadId, setNewLeadId] = useState('');
  const [newPnr, setNewPnr] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('Rebooking');
  const [newPriority, setNewPriority] = useState<TicketPriority>('High');
  const [newMessage, setNewMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (q) {
        const hay = `${t.id} ${t.clientName} ${t.subject} ${t.pnr ?? ''} ${t.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, search]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? filteredTickets[0],
    [tickets, selectedId, filteredTickets]
  );

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === 'Open').length,
      inProgress: tickets.filter((t) => t.status === 'In Progress').length,
      waiting: tickets.filter((t) => t.status === 'Waiting Client').length,
      resolved: tickets.filter((t) => t.status === 'Resolved').length,
    }),
    [tickets]
  );

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    onReplyTicket(activeTicket.id, replyText.trim());
    setReplyText('');
  };

  const handleLeadPrefill = (leadId: string) => {
    setNewLeadId(leadId);
    const matched = leads.find((l) => l.id === leadId);
    if (matched) {
      setNewClientName(matched.clientName);
      setNewClientEmail(matched.email);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateSupportTicket({
      clientName: newClientName,
      clientEmail: newClientEmail,
      subject: newSubject,
      message: newMessage,
      category: newCategory,
      priority: newPriority,
    });
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    onCreateTicket({
      clientName: newClientName.trim(),
      clientEmail: newClientEmail.trim(),
      leadId: newLeadId || undefined,
      pnr: newPnr.trim().toUpperCase() || undefined,
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      message: newMessage.trim(),
    });
    setShowCreateModal(false);
    setNewClientName('');
    setNewClientEmail('');
    setNewLeadId('');
    setNewPnr('');
    setNewSubject('');
    setNewMessage('');
    setFormErrors({});
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#14261C] leading-tight">
              Support Tickets
            </h1>
            <p className="mt-0.5 text-sm text-[#546F5F]">
              Organized ticketing queue for rebookings, refunds, baggage, and post-booking assistance
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* 4 Status Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: 'Open', count: counts.open, status: 'Open', icon: LifeBuoy },
            { label: 'In Progress', count: counts.inProgress, status: 'In Progress', icon: Clock },
            { label: 'Waiting Client', count: counts.waiting, status: 'Waiting Client', icon: MessageSquare },
            { label: 'Resolved', count: counts.resolved, status: 'Resolved', icon: CheckCircle2 },
          ].map((stat) => {
            const Icon = stat.icon;
            const active = statusFilter === stat.status;
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => setStatusFilter(active ? 'All' : stat.status)}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-white border text-left transition-all ${
                  active
                    ? 'border-[#23804E] ring-2 ring-[#23804E]/15'
                    : 'border-[#DCECE2] hover:border-[#B6D9C4]'
                }`}
              >
                <span className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <span className="block text-2xl font-bold text-[#14261C] tabular-nums leading-none">
                    {stat.count}
                  </span>
                  <span className="mt-1.5 block text-xs font-medium text-[#5B7465]">
                    {stat.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Split Queue + Conversation Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Queue */}
          <section className="lg:col-span-5 rounded-2xl bg-white border border-[#DCECE2] overflow-hidden">
            <div className="p-3.5 border-b border-[#E6F1EA] flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B8475] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  aria-label="Search support tickets"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ticket ID, PNR, or client..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#DCECE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                />
              </div>
              {statusFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className="px-3 h-10 rounded-xl bg-[#EAF7EF] text-xs font-semibold text-[#18683C]"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="divide-y divide-[#EEF5F0] max-h-[600px] overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#607A6B]">
                  No tickets match your current filter.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = activeTicket?.id === ticket.id;
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedId(ticket.id)}
                      className={`w-full text-left p-4 transition-colors ${
                        isSelected ? 'bg-[#E8F7EE]' : 'hover:bg-[#F5FBF7]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-[#1D5E3A]">
                          {ticket.id}
                          {ticket.pnr ? ` · PNR ${ticket.pnr}` : ''}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            PRIORITY_STYLES[ticket.priority]
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-[#14261C] line-clamp-1">
                        {ticket.subject}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#5B7465]">
                        <span>
                          {ticket.clientName} · {ticket.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            STATUS_STYLES[ticket.status]
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Conversation Thread */}
          <section className="lg:col-span-7 rounded-2xl bg-white border border-[#DCECE2] overflow-hidden flex flex-col min-h-[540px]">
            {!activeTicket ? (
              <div className="flex-1 flex items-center justify-center p-10 text-sm text-[#607A6B]">
                Select a ticket from the queue to review and reply.
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-[#E6F1EA] bg-[#FAFDFB] flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[#1B663D]">{activeTicket.id}</span>
                      <span className="text-[#9AB5A4]">·</span>
                      <span className="font-semibold text-[#3C5848]">{activeTicket.category}</span>
                      {activeTicket.pnr && (
                        <>
                          <span className="text-[#9AB5A4]">·</span>
                          <span className="font-mono font-semibold text-[#14261C]">
                            PNR {activeTicket.pnr}
                          </span>
                        </>
                      )}
                      <span className="text-[#9AB5A4]">·</span>
                      <span className="text-[#5B7465] tabular-nums">SLA: {activeTicket.slaDue}</span>
                    </div>
                    <h2 className="mt-1.5 text-lg font-bold text-[#14261C]">
                      {activeTicket.subject}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#546F5F]">
                      <span>
                        Client: <strong className="text-[#14261C]">{activeTicket.clientName}</strong> (
                        {activeTicket.clientEmail})
                      </span>
                      {activeTicket.leadId && (
                        <button
                          type="button"
                          onClick={() => onOpenLead(activeTicket.leadId!)}
                          className="inline-flex items-center gap-1 font-semibold text-[#23804E] hover:underline"
                        >
                          <span>Open Lead {activeTicket.leadId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="ticket-status-select" className="text-xs font-medium text-[#5A7464]">
                      Status
                    </label>
                    <select
                      id="ticket-status-select"
                      value={activeTicket.status}
                      onChange={(e) =>
                        onUpdateTicketStatus(activeTicket.id, e.target.value as TicketStatus)
                      }
                      className="h-9 px-3 rounded-xl bg-[#E4F6EB] border border-[#C1E5CF] text-xs font-semibold text-[#155E36] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting Client">Waiting Client</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-5 space-y-3.5 overflow-y-auto max-h-[380px]">
                  {activeTicket.messages.map((msg) => {
                    const isAgent = msg.role === 'Agent';
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border ${
                          isAgent
                            ? 'bg-[#EFF9F3] border-[#D3ECDD] ml-6'
                            : 'bg-white border-[#E2EFE7] mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#14261C]">
                            {msg.author}{' '}
                            <span className="font-normal text-[#5A7464]">({msg.role})</span>
                          </span>
                          <span className="text-[#6E8577] tabular-nums">{msg.timestamp}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-[#243E2F] leading-relaxed">{msg.body}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Box */}
                <form
                  onSubmit={handleReplySubmit}
                  className="p-4 border-t border-[#E6F1EA] bg-[#FAFDFA] flex flex-col sm:flex-row gap-2.5"
                >
                  <label htmlFor="ticket-reply-input" className="sr-only">
                    Write a reply to {activeTicket.clientName}
                  </label>
                  <input
                    id="ticket-reply-input"
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeTicket.clientName} or log resolution...`}
                    className="flex-1 h-11 px-4 rounded-xl bg-white border border-[#D7E8DD] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Create Ticket Pop-up */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-ticket-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2418]/40 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#D4E6DB] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5F1E9] flex items-center justify-between">
              <h2 id="create-ticket-title" className="text-lg font-bold text-[#14261C]">
                Create Support Ticket
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create ticket dialog"
                className="w-9 h-9 rounded-xl text-[#567261] hover:bg-[#F1FAF4] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} noValidate className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nt-lead" className="block text-xs font-semibold text-[#3C5848] mb-1">
                    Link to Existing Lead (optional)
                  </label>
                  <select
                    id="nt-lead"
                    value={newLeadId}
                    onChange={(e) => handleLeadPrefill(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
                  >
                    <option value="">None</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id} — {l.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="nt-pnr" className="block text-xs font-semibold text-[#3C5848] mb-1">
                    PNR Reference (optional)
                  </label>
                  <input
                    id="nt-pnr"
                    type="text"
                    value={newPnr}
                    onChange={(e) => setNewPnr(e.target.value.toUpperCase())}
                    placeholder="EK74K9"
                    className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label htmlFor="nt-client" className="block text-xs font-semibold text-[#3C5848] mb-1">
                    Client Name *
                  </label>
                  <input
                    id="nt-client"
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] text-sm"
                  />
                  {formErrors.clientName && (
                    <p className="mt-1 text-xs text-[#C23434]">{formErrors.clientName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nt-email" className="block text-xs font-semibold text-[#3C5848] mb-1">
                    Client Email *
                  </label>
                  <input
                    id="nt-email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] text-sm"
                  />
                  {formErrors.clientEmail && (
                    <p className="mt-1 text-xs text-[#C23434]">{formErrors.clientEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nt-category" className="block text-xs font-semibold text-[#3C5848] mb-1">
                    Category
                  </label>
                  <select
                    id="nt-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
                  >
                    <option value="Rebooking">Rebooking</option>
                    <option value="Refund">Refund</option>
                    <option value="Baggage">Baggage</option>
                    <option value="Seat & Meal">Seat & Meal</option>
                    <option value="Visa & Docs">Visa & Docs</option>
                    <option value="Ticketing">Ticketing</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nt-priority" className="block text-xs font-semibold text-[#3C5848] mb-1">
                    Priority
                  </label>
                  <select
                    id="nt-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] bg-white text-sm"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="nt-subject" className="block text-xs font-semibold text-[#3C5848] mb-1">
                  Subject *
                </label>
                <input
                  id="nt-subject"
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Seat upgrade request for outbound flight"
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E8DD] text-sm"
                />
                {formErrors.subject && (
                  <p className="mt-1 text-xs text-[#C23434]">{formErrors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="nt-message" className="block text-xs font-semibold text-[#3C5848] mb-1">
                  Request Details *
                </label>
                <textarea
                  id="nt-message"
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe the traveler's issue, schedule change, or documentation request..."
                  className="w-full p-3 rounded-xl border border-[#D7E8DD] text-sm"
                />
                {formErrors.message && (
                  <p className="mt-1 text-xs text-[#C23434]">{formErrors.message}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E6F1EA] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#D4E6DB] text-sm font-semibold text-[#314C3C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
