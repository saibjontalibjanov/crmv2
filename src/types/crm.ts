export type UserRole = 'sales_agent' | 'manager' | 'admin';

export type ActiveView =
  | 'leads'
  | 'lead_detail'
  | 'bookings'
  | 'clients'
  | 'tickets'
  | 'analytics'
  | 'calendar'
  | 'tasks'
  | 'team_management'
  | 'agency_settings';

export type LeadStatus = 'New' | 'In Progress' | 'Quoted' | 'Booked' | 'Lost';

export type LeadSource = 'Telegram' | 'WhatsApp' | 'Website' | 'Phone' | 'Email';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business Class' | 'First Class';

export type CountryCode = 'UZ' | 'RU' | 'KZ' | 'AT' | 'SG' | 'AE' | 'TR' | 'GB';

export type AirlineCode = 'EK' | 'TK' | 'QR' | 'HY' | 'LH' | 'KC' | 'EY' | 'CX' | 'NH';

export interface Agent {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  email: string;
  role: UserRole;
  activeLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  status: 'Active' | 'Away';
}

export interface FlightLeg {
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  dateLabel: string;
  isoDate: string;
  departTime: string;
  arriveTime: string;
  nextDay?: boolean;
  duration: string;
  flightNumber: string;
  stops: number;
}

export interface FlightOption {
  id: string;
  airlineCode: AirlineCode;
  airlineName: string;
  cabinClass: CabinClass;
  outbound: FlightLeg;
  returnLeg: FlightLeg;
  baggage: string;
  fareCondition: 'Refundable' | 'Changeable' | 'Non-refundable';
  changeable: boolean;
  refundable: boolean;
  pricePerPassenger: number;
  selected?: boolean;
  bookmarked?: boolean;
}

export interface LeadNote {
  id: string;
  author: string;
  authorInitials: string;
  createdAt: string;
  content: string;
}

export interface LeadHistoryEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface LeadDocument {
  id: string;
  name: string;
  category: 'Passport' | 'Itinerary' | 'Invoice' | 'E-Ticket' | 'Visa';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface LeadCommunication {
  id: string;
  channel: 'Email' | 'Phone' | 'Note';
  subject: string;
  summary: string;
  timestamp: string;
  direction: 'Outbound' | 'Inbound';
  agentName: string;
  status: 'Sent' | 'Draft' | 'Completed';
}

export interface Lead {
  id: string;
  clientName: string;
  countryCode: CountryCode;
  phone: string;
  email: string;
  telegramHandle?: string;
  whatsappPhone?: string;
  pax: number;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  travelDatesLabel: string;
  departDateLabel: string;
  returnDateLabel: string;
  departIso: string;
  returnIso: string;
  cabinClass: CabinClass;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedAgentId: string;
  assignedInitials: string;
  assignedName: string;
  createdAt: string;
  createdDateKey: string;
  tags: string[];
  estimatedValue: number;
  flightOptions: FlightOption[];
  notes: LeadNote[];
  history: LeadHistoryEvent[];
  documents: LeadDocument[];
  communications: LeadCommunication[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'Sales' | 'Operations' | 'Billing' | 'Support';
  subject: string;
  greeting: string;
  introBody: string;
  closingBody: string;
  includeFlightCard: boolean;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Waiting Client' | 'Resolved';
export type TicketPriority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type TicketCategory = 'Rebooking' | 'Refund' | 'Baggage' | 'Seat & Meal' | 'Visa & Docs' | 'Ticketing';

export interface TicketMessage {
  id: string;
  author: string;
  role: 'Agent' | 'Client';
  timestamp: string;
  body: string;
}

export interface SupportTicket {
  id: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  pnr?: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedName: string;
  assignedInitials: string;
  createdAt: string;
  slaDue: string;
  messages: TicketMessage[];
}

export interface CrmTask {
  id: string;
  title: string;
  leadId?: string;
  clientName?: string;
  dueDate: string;
  priority: LeadPriority;
  assignedName: string;
  completed: boolean;
}

export interface BookingRecord {
  id: string;
  pnr: string;
  leadId: string;
  clientName: string;
  route: string;
  airlineName: string;
  airlineCode: AirlineCode;
  travelDates: string;
  pax: number;
  cabinClass: CabinClass;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending Deposit' | 'Invoiced';
  ticketStatus: 'Issued' | 'Processing' | 'Confirmed';
  agentName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetView: ActiveView;
  targetLeadId?: string;
}

export interface LeadFilters {
  source: string;
  route: string;
  status: string;
  agent: string;
  search: string;
  dateFilter: string;
}

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  cabinClass: string;
  stops: 'all' | 'direct' | '1-stop';
  airline: string;
  sortBy: 'price_asc' | 'duration_asc' | 'depart_asc';
}
