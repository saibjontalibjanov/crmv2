import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import type { Agent, Lead, LeadFilters, LeadStatus, UserRole } from '../types/crm';
import {
  calculateDashboardKpis,
  filterLeads,
  formatCurrency,
  getLeadRouteKey,
  getRolePermissions,
} from '../utils/crmLogic';
import { CountryFlag } from './BrandLogo';

interface LeadsDashboardProps {
  leads: Lead[];
  agents: Agent[];
  currentRole: UserRole;
  onOpenLead: (leadId: string) => void;
  onOpenNewLeadModal: () => void;
  onOpenEmailForLead: (leadId: string) => void;
  onBulkStatusUpdate: (leadIds: string[], status: LeadStatus) => void;
  onDeleteLeads: (leadIds: string[]) => void;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'bg-[#E6F1FC] text-[#1F5E9B]',
  'In Progress': 'bg-[#DFF5E8] text-[#1D7344]',
  Quoted: 'bg-[#E4F7D9] text-[#2B7222]',
  Booked: 'bg-[#CBEFD9] text-[#125530]',
  Lost: 'bg-[#F4ECEC] text-[#8E3C3C]',
};

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  leads,
  agents,
  currentRole,
  onOpenLead,
  onOpenNewLeadModal,
  onOpenEmailForLead,
  onBulkStatusUpdate,
  onDeleteLeads,
}) => {
  const [filters, setFilters] = useState<LeadFilters>({
    source: 'All',
    route: 'All',
    status: 'All',
    agent: 'All',
    search: '',
    dateFilter: 'All Dates',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const permissions = getRolePermissions(currentRole);

  const uniqueRoutes = useMemo(() => {
    const set = new Set(leads.map((l) => getLeadRouteKey(l)));
    return Array.from(set).sort();
  }, [leads]);

  const uniqueDates = useMemo(() => {
    const set = new Set(leads.map((l) => l.createdDateKey));
    return ['All Dates', ...Array.from(set)];
  }, [leads]);

  const kpis = useMemo(() => calculateDashboardKpis(leads), [leads]);
  const filteredLeads = useMemo(() => filterLeads(leads, filters), [leads, filters]);

  const activeFiltersCount = [
    filters.source !== 'All',
    filters.route !== 'All',
    filters.status !== 'All',
    filters.agent !== 'All',
    filters.dateFilter !== 'All Dates',
    filters.search.trim().length > 0,
  ].filter(Boolean).length;

  const allVisibleSelected =
    filteredLeads.length > 0 && filteredLeads.every((l) => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleRow = (leadId: string) => {
    setSelectedIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const clearFilters = () => {
    setFilters({
      source: 'All',
      route: 'All',
      status: 'All',
      agent: 'All',
      search: '',
      dateFilter: 'All Dates',
    });
  };

  const handleKpiClick = (targetStatus: LeadStatus | 'All') => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === targetStatus ? 'All' : targetStatus,
    }));
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-5">
        {/* Page Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#14261C] leading-tight">
              Leads
            </h1>
            <p className="mt-0.5 text-sm text-[#546F5F]">
              Manage incoming requests and client inquiries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Filter Selector */}
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#23804E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Filter leads by date"
                value={filters.dateFilter}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFilter: e.target.value }))}
                className="appearance-none h-11 pl-10 pr-9 rounded-xl bg-white border border-[#D8EAE0] text-sm font-medium text-[#1D3427] shadow-[0_1px_2px_rgba(20,38,28,0.03)] hover:border-[#BBD8C7] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
              >
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All Dates' ? 'Nov 19, 2026 (All)' : d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#5A7464] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Primary CTA: + New Lead */}
            <button
              type="button"
              onClick={onOpenNewLeadModal}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#23804E] hover:bg-[#1B693F] text-white text-sm font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#23804E]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* 5-Card KPI Summary Strip */}
        <section
          aria-label="Pipeline metrics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5"
        >
          <button
            type="button"
            onClick={() => handleKpiClick('New')}
            className={`group flex items-center gap-4 p-4 rounded-2xl bg-white border text-left transition-all ${
              filters.status === 'New'
                ? 'border-[#23804E] ring-2 ring-[#23804E]/15'
                : 'border-[#DCECE2] hover:border-[#B6D9C4]'
            }`}
          >
            <span className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-bold text-[#14261C] leading-none tabular-nums">
                {kpis.newLeads}
              </span>
              <span className="mt-1.5 block text-xs font-medium text-[#5B7465] truncate">
                New Leads
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick('In Progress')}
            className={`group flex items-center gap-4 p-4 rounded-2xl bg-white border text-left transition-all ${
              filters.status === 'In Progress'
                ? 'border-[#23804E] ring-2 ring-[#23804E]/15'
                : 'border-[#DCECE2] hover:border-[#B6D9C4]'
            }`}
          >
            <span className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-bold text-[#14261C] leading-none tabular-nums">
                {kpis.inProgress}
              </span>
              <span className="mt-1.5 block text-xs font-medium text-[#5B7465] truncate">
                In Progress
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick('Quoted')}
            className={`group flex items-center gap-4 p-4 rounded-2xl bg-white border text-left transition-all ${
              filters.status === 'Quoted'
                ? 'border-[#23804E] ring-2 ring-[#23804E]/15'
                : 'border-[#DCECE2] hover:border-[#B6D9C4]'
            }`}
          >
            <span className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-bold text-[#14261C] leading-none tabular-nums">
                {kpis.quoted}
              </span>
              <span className="mt-1.5 block text-xs font-medium text-[#5B7465] truncate">
                Quoted
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick('Booked')}
            className={`group flex items-center gap-4 p-4 rounded-2xl bg-white border text-left transition-all ${
              filters.status === 'Booked'
                ? 'border-[#23804E] ring-2 ring-[#23804E]/15'
                : 'border-[#DCECE2] hover:border-[#B6D9C4]'
            }`}
          >
            <span className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-bold text-[#14261C] leading-none tabular-nums">
                {kpis.booked}
              </span>
              <span className="mt-1.5 block text-xs font-medium text-[#5B7465] truncate">
                Booked
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick('All')}
            className="col-span-2 sm:col-span-1 flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#DCECE2] hover:border-[#B6D9C4] text-left transition-all"
          >
            <span className="w-11 h-11 rounded-xl bg-[#EBF7F0] text-[#23804E] flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-bold text-[#14261C] leading-none tabular-nums">
                {formatCurrency(kpis.totalValue)}
              </span>
              <span className="mt-1.5 block text-xs font-medium text-[#5B7465] truncate">
                Total Value
              </span>
            </span>
          </button>
        </section>

        {/* Filter Toolbar */}
        <section
          aria-label="Filter leads"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
        >
          <div className="relative lg:col-span-2">
            <select
              aria-label="Filter by source"
              value={filters.source}
              onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}
              className="w-full appearance-none h-11 pl-3.5 pr-9 rounded-xl bg-white border border-[#DCECE2] text-sm font-medium text-[#1D3427] hover:border-[#BBD8C7] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
            >
              <option value="All">All Sources</option>
              <option value="Telegram">Telegram</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Website">Website</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#5A7464] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative lg:col-span-2">
            <select
              aria-label="Filter by route"
              value={filters.route}
              onChange={(e) => setFilters((prev) => ({ ...prev, route: e.target.value }))}
              className="w-full appearance-none h-11 pl-3.5 pr-9 rounded-xl bg-white border border-[#DCECE2] text-sm font-medium text-[#1D3427] hover:border-[#BBD8C7] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
            >
              <option value="All">All Routes</option>
              {uniqueRoutes.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#5A7464] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative lg:col-span-2">
            <select
              aria-label="Filter by status"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full appearance-none h-11 pl-3.5 pr-9 rounded-xl bg-white border border-[#DCECE2] text-sm font-medium text-[#1D3427] hover:border-[#BBD8C7] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Quoted">Quoted</option>
              <option value="Booked">Booked</option>
              <option value="Lost">Lost</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#5A7464] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative lg:col-span-2">
            <select
              aria-label="Filter by agent"
              value={filters.agent}
              onChange={(e) => setFilters((prev) => ({ ...prev, agent: e.target.value }))}
              className="w-full appearance-none h-11 pl-3.5 pr-9 rounded-xl bg-white border border-[#DCECE2] text-sm font-medium text-[#1D3427] hover:border-[#BBD8C7] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
            >
              <option value="All">Agent: All</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.shortName}>
                  Agent: {agent.shortName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#5A7464] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="w-4 h-4 text-[#6B8475] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search in leads"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search in leads..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-[#DCECE2] text-sm text-[#14261C] placeholder:text-[#7E9688] hover:border-[#BBD8C7] focus:outline-none focus:ring-2 focus:ring-[#23804E]"
            />
            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8475] hover:text-[#14261C]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Contextual Selection & Filter Bar */}
        {(selectedIds.length > 0 || activeFiltersCount > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#EAF7EF] border border-[#CFE9D9] text-sm">
            <div className="flex flex-wrap items-center gap-3">
              {selectedIds.length > 0 ? (
                <>
                  <span className="font-semibold text-[#185B37] tabular-nums">
                    {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
                  </span>
                  <span aria-hidden="true" className="text-[#99C2AA]">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenEmailForLead(selectedIds[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#CBE5D6] text-xs font-semibold text-[#1C4D32] hover:bg-[#F5FBF7] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#23804E]" />
                    <span>Send Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onBulkStatusUpdate(selectedIds, 'Quoted');
                    }}
                    className="px-3 py-1 rounded-lg bg-white border border-[#CBE5D6] text-xs font-semibold text-[#1C4D32] hover:bg-[#F5FBF7] transition-colors"
                  >
                    Mark Quoted
                  </button>
                  {permissions.canDeleteLeads && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteLeads(selectedIds);
                        setSelectedIds([]);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#EBCACA] text-xs font-semibold text-[#A33636] hover:bg-[#FDF4F4] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-xs font-medium text-[#4A6B58] hover:text-[#14261C]"
                  >
                    Deselect
                  </button>
                </>
              ) : (
                <span className="text-[#29573D] font-medium">
                  Showing {filteredLeads.length} of {leads.length} leads
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#1F7045] hover:underline"
              >
                Reset filters ({activeFiltersCount})
              </button>
            )}
          </div>
        )}

        {/* Full-Width Leads Data Table */}
        <section
          aria-label="Leads directory"
          className="w-full rounded-2xl bg-white border border-[#DCECE2] shadow-[0_1px_3px_rgba(20,38,28,0.03)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[920px]">
              <thead>
                <tr className="border-b border-[#E6F1EA] bg-[#FAFDFA] text-[13px] font-semibold text-[#3C5747]">
                  <th className="py-3.5 pl-5 pr-2 w-11">
                    <input
                      type="checkbox"
                      aria-label="Select all visible leads"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#BBD4C4] accent-[#23804E] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3">Lead ID</th>
                  <th className="py-3.5 px-3">Client</th>
                  <th className="py-3.5 px-3 text-center">Pax</th>
                  <th className="py-3.5 px-3">Route</th>
                  <th className="py-3.5 px-3">Travel Dates</th>
                  <th className="py-3.5 px-3">Source</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-center">Assigned</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5F0] text-sm">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-14 px-6 text-center">
                      <p className="text-base font-semibold text-[#14261C]">
                        No matching leads found
                      </p>
                      <p className="mt-1 text-sm text-[#607A6B]">
                        Try adjusting your route, status, or search filter, or create a new client inquiry.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="px-4 py-2 rounded-xl border border-[#D4E6DB] text-sm font-medium text-[#1F3A2B] hover:bg-[#F3FAF6]"
                        >
                          Clear Filters
                        </button>
                        <button
                          type="button"
                          onClick={onOpenNewLeadModal}
                          className="px-4 py-2 rounded-xl bg-[#23804E] text-white text-sm font-semibold hover:bg-[#1B693F]"
                        >
                          Create New Lead
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isChecked = selectedIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`group transition-colors ${
                          isChecked ? 'bg-[#E6F7EC]' : 'hover:bg-[#F4FBF6]'
                        }`}
                      >
                        <td className="py-3.5 pl-5 pr-2">
                          <input
                            type="checkbox"
                            aria-label={`Select lead ${lead.id} (${lead.clientName})`}
                            checked={isChecked}
                            onChange={() => toggleRow(lead.id)}
                            className="w-4 h-4 rounded border-[#BBD4C4] accent-[#23804E] cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenLead(lead.id)}
                            className="font-mono text-[13px] font-semibold text-[#1E3B2B] group-hover:text-[#1D7344] group-hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E] rounded"
                          >
                            {lead.id}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenLead(lead.id)}
                            className="inline-flex items-center gap-2.5 text-left font-semibold text-[#14261C] hover:text-[#1D7344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23804E] rounded"
                          >
                            <CountryFlag code={lead.countryCode} />
                            <span>{lead.clientName}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-center font-medium text-[#2A4234] tabular-nums">
                          {lead.pax}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#14261C] tabular-nums">
                            <span>{lead.originCode}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#23804E]" />
                            <span>{lead.destinationCode}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#2E4638] tabular-nums">
                          {lead.travelDatesLabel}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#3B5546]">
                          {lead.source}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              STATUS_STYLES[lead.status]
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            title={lead.assignedName}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EEF5F1] border border-[#DCEAE1] text-xs font-bold text-[#244232]"
                          >
                            {lead.assignedInitials}
                          </span>
                        </td>
                        <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap text-[#4B6656] tabular-nums">
                          {lead.createdAt}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};
