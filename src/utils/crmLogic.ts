import type {
  ActiveView,
  EmailTemplate,
  FlightOption,
  FlightSearchQuery,
  Lead,
  LeadFilters,
  LeadPriority,
  LeadSource,
  LeadStatus,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  UserRole,
} from '../types/crm';

export interface DashboardKpis {
  newLeads: number;
  inProgress: number;
  quoted: number;
  booked: number;
  totalValue: number;
}

export interface RolePermissions {
  role: UserRole;
  label: string;
  canAccessManagement: boolean;
  canManageAgencySettings: boolean;
  canDeleteLeads: boolean;
  canReassignAgents: boolean;
  canExportReports: boolean;
}

export interface NavItemConfig {
  id: ActiveView;
  label: string;
  section: 'workspace' | 'management';
  description: string;
}

export function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `$${safe.toLocaleString('en-US')}`;
}

export function formatRoute(originCode: string, destinationCode: string): string {
  return `${originCode.toUpperCase()} → ${destinationCode.toUpperCase()}`;
}

export function getLeadRouteKey(lead: Pick<Lead, 'originCode' | 'destinationCode'>): string {
  return formatRoute(lead.originCode, lead.destinationCode);
}

export function getSelectedFlightOption(lead: Lead): FlightOption | undefined {
  return lead.flightOptions.find((f) => f.selected) ?? lead.flightOptions[0];
}

export function calculateLeadValue(lead: Lead): number {
  const selected = getSelectedFlightOption(lead);
  if (selected) {
    return selected.pricePerPassenger * Math.max(1, lead.pax);
  }
  return Math.max(0, lead.estimatedValue);
}

export function calculateDashboardKpis(leads: Lead[]): DashboardKpis {
  let newLeads = 0;
  let inProgress = 0;
  let quoted = 0;
  let booked = 0;
  let totalValue = 0;

  for (const lead of leads) {
    if (lead.status === 'New') newLeads += 1;
    else if (lead.status === 'In Progress') inProgress += 1;
    else if (lead.status === 'Quoted') quoted += 1;
    else if (lead.status === 'Booked') booked += 1;

    if (lead.status !== 'Lost') {
      totalValue += calculateLeadValue(lead);
    }
  }

  return { newLeads, inProgress, quoted, booked, totalValue };
}

export function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  const searchLower = filters.search.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filters.source !== 'All' && lead.source !== filters.source) {
      return false;
    }
    if (filters.route !== 'All' && getLeadRouteKey(lead) !== filters.route) {
      return false;
    }
    if (filters.status !== 'All' && lead.status !== filters.status) {
      return false;
    }
    if (filters.agent !== 'All' && lead.assignedName !== filters.agent) {
      return false;
    }
    if (filters.dateFilter !== 'All Dates' && lead.createdDateKey !== filters.dateFilter) {
      return false;
    }
    if (searchLower) {
      const haystack = [
        lead.id,
        lead.clientName,
        lead.email,
        lead.phone,
        lead.originCode,
        lead.originCity,
        lead.destinationCode,
        lead.destinationCity,
        lead.source,
        lead.status,
        ...lead.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });
}

export function selectFlightOption(lead: Lead, flightId: string): Lead {
  const target = lead.flightOptions.find((f) => f.id === flightId);
  if (!target) return lead;

  const updatedOptions = lead.flightOptions.map((option) => ({
    ...option,
    selected: option.id === flightId,
  }));

  return {
    ...lead,
    flightOptions: updatedOptions,
    estimatedValue: target.pricePerPassenger * Math.max(1, lead.pax),
  };
}

export function toggleFlightBookmark(lead: Lead, flightId: string): Lead {
  return {
    ...lead,
    flightOptions: lead.flightOptions.map((option) =>
      option.id === flightId ? { ...option, bookmarked: !option.bookmarked } : option
    ),
  };
}

export function addFlightOptionToLead(lead: Lead, newFlight: FlightOption): Lead {
  const duplicate = lead.flightOptions.some(
    (f) =>
      f.outbound.flightNumber === newFlight.outbound.flightNumber &&
      f.returnLeg.flightNumber === newFlight.returnLeg.flightNumber &&
      f.cabinClass === newFlight.cabinClass
  );
  if (duplicate) return lead;

  const clonedFlight: FlightOption = {
    ...newFlight,
    id: `${newFlight.id}-${Date.now()}`,
    selected: lead.flightOptions.length === 0,
  };

  const nextOptions = [...lead.flightOptions, clonedFlight];
  return {
    ...lead,
    flightOptions: nextOptions,
    estimatedValue:
      lead.flightOptions.length === 0
        ? clonedFlight.pricePerPassenger * Math.max(1, lead.pax)
        : lead.estimatedValue,
  };
}

export function parseDurationToMinutes(duration: string): number {
  const hoursMatch = duration.match(/(\d+)\s*h/i);
  const minsMatch = duration.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours * 60 + mins;
}

export function searchFlights(catalog: FlightOption[], query: FlightSearchQuery): FlightOption[] {
  const originFilter = query.origin.trim().toLowerCase();
  const destFilter = query.destination.trim().toLowerCase();

  const filtered = catalog.filter((flight) => {
    if (originFilter) {
      const originMatch =
        flight.outbound.fromCode.toLowerCase().includes(originFilter) ||
        flight.outbound.fromCity.toLowerCase().includes(originFilter);
      if (!originMatch) return false;
    }
    if (destFilter) {
      const destMatch =
        flight.outbound.toCode.toLowerCase().includes(destFilter) ||
        flight.outbound.toCity.toLowerCase().includes(destFilter);
      if (!destMatch) return false;
    }
    if (query.cabinClass !== 'All' && flight.cabinClass !== query.cabinClass) {
      return false;
    }
    if (query.stops === 'direct' && flight.outbound.stops !== 0) {
      return false;
    }
    if (query.stops === '1-stop' && flight.outbound.stops < 1) {
      return false;
    }
    if (query.airline !== 'All' && flight.airlineName !== query.airline) {
      return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (query.sortBy === 'price_asc') {
      return a.pricePerPassenger - b.pricePerPassenger;
    }
    if (query.sortBy === 'duration_asc') {
      return (
        parseDurationToMinutes(a.outbound.duration) - parseDurationToMinutes(b.outbound.duration)
      );
    }
    return a.outbound.departTime.localeCompare(b.outbound.departTime);
  });
}

export function interpolateEmailTemplate(
  template: EmailTemplate,
  lead?: Lead,
  flight?: FlightOption
): { subject: string; greeting: string; introBody: string; closingBody: string } {
  const clientName = lead?.clientName ?? 'Valued Client';
  const origin = flight?.outbound.fromCode ?? lead?.originCode ?? 'TAS';
  const destination = flight?.outbound.toCode ?? lead?.destinationCode ?? 'DXB';
  const originCity = flight?.outbound.fromCity ?? lead?.originCity ?? 'Tashkent';
  const destinationCity = flight?.outbound.toCity ?? lead?.destinationCity ?? 'Dubai';
  const airline = flight?.airlineName ?? 'Emirates';
  const price = flight ? formatCurrency(flight.pricePerPassenger) : formatCurrency(lead?.estimatedValue ?? 0);
  const travelDates = lead?.travelDatesLabel ?? 'Upcoming Dates';
  const leadId = lead?.id ?? 'LD-0000';

  const replaceTokens = (text: string): string =>
    text
      .replaceAll('{{clientName}}', clientName)
      .replaceAll('{{origin}}', origin)
      .replaceAll('{{destination}}', destination)
      .replaceAll('{{originCity}}', originCity)
      .replaceAll('{{destinationCity}}', destinationCity)
      .replaceAll('{{airline}}', airline)
      .replaceAll('{{price}}', price)
      .replaceAll('{{travelDates}}', travelDates)
      .replaceAll('{{leadId}}', leadId);

  return {
    subject: replaceTokens(template.subject),
    greeting: replaceTokens(template.greeting),
    introBody: replaceTokens(template.introBody),
    closingBody: replaceTokens(template.closingBody),
  };
}

export interface NewLeadValidationInput {
  clientName: string;
  email: string;
  phone: string;
  originCode: string;
  destinationCode: string;
  pax: number;
  departIso: string;
  returnIso: string;
  source?: LeadSource;
  priority?: LeadPriority;
  status?: LeadStatus;
}

export function validateNewLead(input: NewLeadValidationInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.clientName.trim() || input.clientName.trim().length < 2) {
    errors.clientName = 'Client full name is required.';
  }
  if (!input.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!input.phone.trim() || input.phone.trim().length < 7) {
    errors.phone = 'Enter a valid contact phone number.';
  }
  if (!input.originCode.trim() || input.originCode.trim().length !== 3) {
    errors.originCode = 'Use a 3-letter IATA origin code (e.g., TAS).';
  }
  if (!input.destinationCode.trim() || input.destinationCode.trim().length !== 3) {
    errors.destinationCode = 'Use a 3-letter IATA destination code (e.g., DXB).';
  }
  if (
    input.originCode.trim() &&
    input.destinationCode.trim() &&
    input.originCode.trim().toUpperCase() === input.destinationCode.trim().toUpperCase()
  ) {
    errors.destinationCode = 'Destination must differ from origin.';
  }
  if (!Number.isFinite(input.pax) || input.pax < 1 || input.pax > 20) {
    errors.pax = 'Passengers must be between 1 and 20.';
  }
  if (!input.departIso) {
    errors.departIso = 'Departure date is required.';
  }
  if (!input.returnIso) {
    errors.returnIso = 'Return date is required.';
  }
  if (input.departIso && input.returnIso && input.returnIso < input.departIso) {
    errors.returnIso = 'Return date must be on or after departure date.';
  }

  return errors;
}

export interface NewTicketValidationInput {
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export function validateSupportTicket(input: NewTicketValidationInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.clientName.trim()) {
    errors.clientName = 'Client name is required.';
  }
  if (!input.clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.clientEmail.trim())) {
    errors.clientEmail = 'Valid client email is required.';
  }
  if (!input.subject.trim() || input.subject.trim().length < 4) {
    errors.subject = 'Please provide a descriptive ticket subject.';
  }
  if (!input.message.trim() || input.message.trim().length < 8) {
    errors.message = 'Describe the customer request or issue.';
  }

  return errors;
}

export function generateNextLeadId(leads: Pick<Lead, 'id'>[]): string {
  let maxNum = 3840;
  for (const lead of leads) {
    const match = lead.id.match(/LD-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `LD-${maxNum + 1}`;
}

export function generateNextTicketId(tickets: Pick<SupportTicket, 'id'>[]): string {
  let maxNum = 1040;
  for (const ticket of tickets) {
    const match = ticket.id.match(/TK-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return `TK-${maxNum + 1}`;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  if (role === 'admin') {
    return {
      role,
      label: 'Administrator',
      canAccessManagement: true,
      canManageAgencySettings: true,
      canDeleteLeads: true,
      canReassignAgents: true,
      canExportReports: true,
    };
  }
  if (role === 'manager') {
    return {
      role,
      label: 'Operations Manager',
      canAccessManagement: true,
      canManageAgencySettings: false,
      canDeleteLeads: true,
      canReassignAgents: true,
      canExportReports: true,
    };
  }
  return {
    role,
    label: 'Sales Agent',
    canAccessManagement: false,
    canManageAgencySettings: false,
    canDeleteLeads: false,
    canReassignAgents: false,
    canExportReports: false,
  };
}

export function getVisibleNavItems(role: UserRole): NavItemConfig[] {
  const permissions = getRolePermissions(role);
  const workspaceItems: NavItemConfig[] = [
    { id: 'leads', label: 'Leads', section: 'workspace', description: 'Incoming travel requests' },
    { id: 'bookings', label: 'Bookings', section: 'workspace', description: 'Confirmed PNRs & tickets' },
    { id: 'clients', label: 'Clients', section: 'workspace', description: 'Traveler directory' },
    { id: 'tickets', label: 'Support Tickets', section: 'workspace', description: 'Rebookings & service queue' },
    { id: 'analytics', label: 'Analytics', section: 'workspace', description: 'Pipeline & route revenue' },
    { id: 'calendar', label: 'Calendar', section: 'workspace', description: 'Departures & follow-ups' },
    { id: 'tasks', label: 'Tasks', section: 'workspace', description: 'Daily agent checklist' },
  ];

  const managementItems: NavItemConfig[] = [];
  if (permissions.canAccessManagement) {
    managementItems.push({
      id: 'team_management',
      label: 'Team & Permissions',
      section: 'management',
      description: 'Roles, agents & lead quotas',
    });
  }
  if (permissions.canManageAgencySettings) {
    managementItems.push({
      id: 'agency_settings',
      label: 'Agency Settings',
      section: 'management',
      description: 'GDS markup, branding & SLAs',
    });
  }

  return [...workspaceItems, ...managementItems];
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatShortDateRange(departIso: string, returnIso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parse = (iso: string) => {
    const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
    if (!y || !m || !d) return iso;
    return `${String(d).padStart(2, '0')} ${months[m - 1] ?? 'Dec'}`;
  };
  return `${parse(departIso)} – ${parse(returnIso)}`;
}
