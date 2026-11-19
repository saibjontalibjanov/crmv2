import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ExternalLink,
  Mail,
  Plane,
  Plus,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import type {
  Agent,
  BookingRecord,
  CrmTask,
  Lead,
  UserRole,
} from '../types/crm';
import {
  calculateDashboardKpis,
  calculateLeadValue,
  formatCurrency,
  getLeadRouteKey,
  getRolePermissions,
} from '../utils/crmLogic';
import { AirlineBadge, CountryFlag } from './BrandLogo';

/* ============================================================================
 * BOOKINGS VIEW
 * ========================================================================== */
export const BookingsView: React.FC<{
  bookings: BookingRecord[];
  onOpenLead: (leadId: string) => void;
}> = ({ bookings, onOpenLead }) => (
  <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">Bookings</h1>
        <p className="mt-0.5 text-sm text-[#546F5F]">
          Confirmed PNRs, ticket issuance status, and client settlements
        </p>
      </div>

      <section className="rounded-2xl bg-white border border-[#DCECE2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#FAFDFA] border-b border-[#E6F1EA] text-xs font-semibold text-[#3C5747]">
                <th className="py-3.5 pl-5 pr-3">Booking / PNR</th>
                <th className="py-3.5 px-3">Client</th>
                <th className="py-3.5 px-3">Carrier & Route</th>
                <th className="py-3.5 px-3">Travel Dates</th>
                <th className="py-3.5 px-3 text-center">Pax</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Ticket Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5F0] text-sm">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-[#F5FBF7]">
                  <td className="py-3.5 pl-5 pr-3">
                    <p className="font-mono font-bold text-[#14261C]">{bk.pnr}</p>
                    <button
                      type="button"
                      onClick={() => onOpenLead(bk.leadId)}
                      className="text-xs font-medium text-[#23804E] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{bk.leadId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#14261C]">{bk.clientName}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <AirlineBadge code={bk.airlineCode} size="sm" />
                      <div>
                        <p className="font-semibold text-[#14261C]">{bk.airlineName}</p>
                        <p className="text-xs text-[#5A7464]">{bk.route}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[#2E4638] tabular-nums">{bk.travelDates}</td>
                  <td className="py-3.5 px-3 text-center tabular-nums">{bk.pax}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#E2F5E9] text-[#176439] text-xs font-semibold">
                      {bk.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EDF7F1] text-[#244D36] text-xs font-semibold">
                      {bk.ticketStatus}
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 pr-5 text-right font-bold text-[#14261C] tabular-nums">
                    {formatCurrency(bk.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
);

/* ============================================================================
 * CLIENTS DIRECTORY VIEW
 * ========================================================================== */
export const ClientsView: React.FC<{
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
  onEmailLead: (leadId: string) => void;
}> = ({ leads, onOpenLead, onEmailLead }) => (
  <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">Clients</h1>
        <p className="mt-0.5 text-sm text-[#546F5F]">
          Corporate and leisure travelers with route preferences and inquiry value
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="rounded-2xl bg-white border border-[#DCECE2] p-5 flex flex-col justify-between gap-4 hover:border-[#B6D9C4] transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CountryFlag code={lead.countryCode} />
                  <h2 className="text-base font-bold text-[#14261C]">{lead.clientName}</h2>
                </div>
                <span className="font-mono text-xs font-semibold text-[#23804E]">{lead.id}</span>
              </div>
              <p className="mt-2 text-xs text-[#4C6858]">{lead.email}</p>
              <p className="text-xs text-[#4C6858] tabular-nums">{lead.phone}</p>
              <div className="mt-3 pt-3 border-t border-[#EEF5F0] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14261C]">
                  {lead.originCode} → {lead.destinationCode} ({lead.cabinClass})
                </span>
                <span className="font-bold text-[#1A6B3E] tabular-nums">
                  {formatCurrency(calculateLeadValue(lead))}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenLead(lead.id)}
                className="flex-1 h-9 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-xs font-semibold"
              >
                Open Lead
              </button>
              <button
                type="button"
                onClick={() => onEmailLead(lead.id)}
                className="h-9 px-3 rounded-xl border border-[#D4E6DB] hover:bg-[#F2FAF5] text-xs font-semibold text-[#1D3B2B] inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#23804E]" />
                <span>Email</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  </main>
);

/* ============================================================================
 * ANALYTICS VIEW
 * ========================================================================== */
export const AnalyticsView: React.FC<{ leads: Lead[]; agents: Agent[] }> = ({ leads, agents }) => {
  const kpis = useMemo(() => calculateDashboardKpis(leads), [leads]);
  const routeStats = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const l of leads) {
      const key = getLeadRouteKey(l);
      const prev = map.get(key) ?? { count: 0, value: 0 };
      map.set(key, { count: prev.count + 1, value: prev.value + calculateLeadValue(l) });
    }
    return Array.from(map.entries())
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const maxRouteValue = Math.max(1, ...routeStats.map((r) => r.value));

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">Analytics</h1>
          <p className="mt-0.5 text-sm text-[#546F5F]">
            Live pipeline value, top routes, and agent performance across Staraviatravel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-7 rounded-2xl bg-white border border-[#DCECE2] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#14261C]">Pipeline Value by Route</h2>
              <span className="text-sm font-bold text-[#23804E] tabular-nums">
                {formatCurrency(kpis.totalValue)} total
              </span>
            </div>

            <div className="space-y-3.5">
              {routeStats.map((item) => (
                <div key={item.route} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#14261C]">
                      {item.route}{' '}
                      <span className="font-normal text-xs text-[#5E7868]">
                        ({item.count} lead{item.count > 1 ? 's' : ''})
                      </span>
                    </span>
                    <span className="font-bold text-[#14261C] tabular-nums">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#ECF6F0] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#23804E]"
                      style={{ width: `${Math.max(8, Math.round((item.value / maxRouteValue) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-5 rounded-2xl bg-white border border-[#DCECE2] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#14261C]">Agent Conversion & Revenue</h2>
            <div className="divide-y divide-[#EEF5F0]">
              {agents.map((agent) => (
                <div key={agent.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#E5F6EC] text-[#18683C] text-xs font-bold flex items-center justify-center">
                      {agent.initials}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#14261C]">{agent.name}</p>
                      <p className="text-xs text-[#5E7868] tabular-nums">
                        {agent.activeLeads} active leads · {agent.conversionRate}% conversion
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#14261C] tabular-nums">
                    {formatCurrency(agent.monthlyRevenue)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

/* ============================================================================
 * CALENDAR VIEW
 * ========================================================================== */
export const CalendarView: React.FC<{
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
}> = ({ leads, onOpenLead }) => {
  const sorted = useMemo(
    () => [...leads].sort((a, b) => a.departIso.localeCompare(b.departIso)),
    [leads]
  );

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">Departure Calendar</h1>
          <p className="mt-0.5 text-sm text-[#546F5F]">
            Chronological view of client departures and return flights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => onOpenLead(lead.id)}
              className="text-left rounded-2xl bg-white border border-[#DCECE2] hover:border-[#9AD4B2] p-5 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#1D7344] tabular-nums">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {lead.travelDatesLabel}
                </span>
                <span className="font-mono font-semibold text-[#5E7868]">{lead.id}</span>
              </div>
              <p className="text-base font-bold text-[#14261C] flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#23804E]" />
                <span>{lead.originCode}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5E7868]" />
                <span>{lead.destinationCode}</span>
              </p>
              <p className="text-sm text-[#365242]">
                {lead.clientName} · {lead.pax} pax · {lead.cabinClass}
              </p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

/* ============================================================================
 * TASKS VIEW
 * ========================================================================== */
export const TasksView: React.FC<{
  tasks: CrmTask[];
  onToggleTask: (taskId: string) => void;
  onCreateTask: (title: string, dueDate: string) => void;
  onOpenLead: (leadId: string) => void;
}> = ({ tasks, onToggleTask, onCreateTask, onOpenLead }) => {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('Tomorrow, 10:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateTask(title.trim(), due);
    setTitle('');
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1160px] mx-auto space-y-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">Tasks</h1>
          <p className="mt-0.5 text-sm text-[#546F5F]">
            Follow-up actions, seat holds, and ticketing deadlines
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-white border border-[#DCECE2] flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new follow-up task..."
            className="flex-1 h-10 px-3.5 rounded-xl border border-[#D7E8DD] text-sm focus:outline-none focus:ring-2 focus:ring-[#23804E]"
          />
          <input
            type="text"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Due date"
            className="w-full sm:w-44 h-10 px-3 rounded-xl border border-[#D7E8DD] text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </form>

        <section className="rounded-2xl bg-white border border-[#DCECE2] divide-y divide-[#EEF5F0]">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-[#23804E] border-[#23804E] text-white'
                      : 'border-[#B5D2C0] bg-white hover:border-[#23804E]'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      task.completed ? 'line-through text-[#7B9285]' : 'text-[#14261C]'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5E7868]">
                    Due {task.dueDate} · {task.assignedName}
                    {task.leadId && (
                      <>
                        {' · '}
                        <button
                          type="button"
                          onClick={() => onOpenLead(task.leadId!)}
                          className="font-semibold text-[#23804E] hover:underline"
                        >
                          {task.leadId}
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#EEF8F2] text-xs font-semibold text-[#20663E] shrink-0">
                {task.priority}
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

/* ============================================================================
 * ROLE-BASED MANAGEMENT: TEAM & PERMISSIONS VIEW
 * ========================================================================== */
export const TeamManagementView: React.FC<{
  agents: Agent[];
  currentRole: UserRole;
  onUpdateAgentRole: (agentId: string, role: UserRole) => void;
}> = ({ agents, currentRole, onUpdateAgentRole }) => {
  const perms = getRolePermissions(currentRole);

  if (!perms.canAccessManagement) {
    return (
      <main className="w-full min-h-[calc(100vh-4rem)] px-6 py-16 text-center">
        <ShieldCheck className="w-10 h-10 text-[#23804E] mx-auto mb-3" />
        <h1 className="text-xl font-bold text-[#14261C]">Manager or Admin Access Required</h1>
        <p className="mt-1 text-sm text-[#5B7465]">
          Switch to Operations Manager or Administrator in the profile dropdown to manage team roles.
        </p>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1400px] mx-auto space-y-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">
            Team & Role Permissions
          </h1>
          <p className="mt-0.5 text-sm text-[#546F5F]">
            Role-based management controls accessible from the profile menu ({perms.label})
          </p>
        </div>

        <section className="rounded-2xl bg-white border border-[#DCECE2] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FAFDFA] border-b border-[#E6F1EA] text-xs font-semibold text-[#3C5747]">
                  <th className="py-3.5 pl-5 pr-3">Team Member</th>
                  <th className="py-3.5 px-3">Email</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3 text-center">Active Leads</th>
                  <th className="py-3.5 px-3 text-right">Monthly Revenue</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5F0] text-sm">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-[#F5FBF7]">
                    <td className="py-3.5 pl-5 pr-3 font-semibold text-[#14261C]">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-[#E4F6EB] text-[#1A6B3E] text-xs font-bold flex items-center justify-center">
                          {agent.initials}
                        </span>
                        <span>{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#4C6858]">{agent.email}</td>
                    <td className="py-3.5 px-3">
                      <select
                        aria-label={`Change role for ${agent.name}`}
                        value={agent.role}
                        onChange={(e) => onUpdateAgentRole(agent.id, e.target.value as UserRole)}
                        className="h-9 px-3 rounded-xl border border-[#D7E8DD] bg-white text-xs font-semibold text-[#14261C]"
                      >
                        <option value="sales_agent">Sales Agent</option>
                        <option value="manager">Operations Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-center tabular-nums">{agent.activeLeads}</td>
                    <td className="py-3.5 px-3 text-right font-semibold tabular-nums">
                      {formatCurrency(agent.monthlyRevenue)}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          agent.status === 'Active'
                            ? 'bg-[#E2F5E9] text-[#176439]'
                            : 'bg-[#F2F5F3] text-[#5F7668]'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

/* ============================================================================
 * ROLE-BASED MANAGEMENT: AGENCY SETTINGS VIEW (ADMIN ONLY)
 * ========================================================================== */
export const AgencySettingsView: React.FC<{ currentRole: UserRole }> = ({ currentRole }) => {
  const [markupPct, setMarkupPct] = useState('4.5');
  const [slaHours, setSlaHours] = useState('2');
  const [saved, setSaved] = useState(false);
  const perms = getRolePermissions(currentRole);

  if (!perms.canManageAgencySettings) {
    return (
      <main className="w-full min-h-[calc(100vh-4rem)] px-6 py-16 text-center">
        <Sliders className="w-10 h-10 text-[#23804E] mx-auto mb-3" />
        <h1 className="text-xl font-bold text-[#14261C]">Administrator Access Required</h1>
        <p className="mt-1 text-sm text-[#5B7465]">
          Only Administrators can modify Staraviatravel agency ticketing markups and SLA thresholds.
        </p>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#14261C]">Agency Settings</h1>
          <p className="mt-0.5 text-sm text-[#546F5F]">
            Staraviatravel quotation markup defaults and customer support SLA policies
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
          }}
          className="rounded-2xl bg-white border border-[#DCECE2] p-6 space-y-4"
        >
          <div>
            <label htmlFor="as-markup" className="block text-sm font-semibold text-[#14261C] mb-1">
              Default Service Fee / GDS Markup (%)
            </label>
            <input
              id="as-markup"
              type="number"
              step="0.5"
              value={markupPct}
              onChange={(e) => setMarkupPct(e.target.value)}
              className="w-full sm:w-48 h-10 px-3.5 rounded-xl border border-[#D7E8DD] text-sm tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="as-sla" className="block text-sm font-semibold text-[#14261C] mb-1">
              Urgent Support Ticket SLA Target (Hours)
            </label>
            <input
              id="as-sla"
              type="number"
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              className="w-full sm:w-48 h-10 px-3.5 rounded-xl border border-[#D7E8DD] text-sm tabular-nums"
            />
          </div>

          <div className="pt-3 border-t border-[#E6F1EA] flex items-center gap-3">
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold"
            >
              Save Settings
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#23804E]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </main>
  );
};
