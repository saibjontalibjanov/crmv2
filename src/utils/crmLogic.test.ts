import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addFlightOptionToLead,
  calculateDashboardKpis,
  filterLeads,
  generateNextLeadId,
  generateNextTicketId,
  getRolePermissions,
  getVisibleNavItems,
  interpolateEmailTemplate,
  searchFlights,
  selectFlightOption,
  toggleFlightBookmark,
  validateNewLead,
  validateSupportTicket,
} from './crmLogic';
import { FLIGHT_CATALOG, INITIAL_EMAIL_TEMPLATES, INITIAL_LEADS, INITIAL_TICKETS } from '../data/seedData';

test('calculateDashboardKpis aggregates status counts and non-lost pipeline value accurately', () => {
  const kpis = calculateDashboardKpis(INITIAL_LEADS);
  assert.equal(kpis.newLeads, 3);
  assert.equal(kpis.inProgress, 2);
  assert.equal(kpis.quoted, 2);
  assert.equal(kpis.booked, 3);
  assert.ok(kpis.totalValue > 40000);
});

test('filterLeads filters by status, source, route, agent, date, and free-text query', () => {
  const inProgress = filterLeads(INITIAL_LEADS, {
    source: 'All',
    route: 'All',
    status: 'In Progress',
    agent: 'All',
    search: '',
    dateFilter: 'All Dates',
  });
  assert.equal(inProgress.length, 2);
  assert.ok(inProgress.every((l) => l.status === 'In Progress'));

  const amina = filterLeads(INITIAL_LEADS, {
    source: 'WhatsApp',
    route: 'TAS → DXB',
    status: 'All',
    agent: 'Saibjon T.',
    search: 'amina',
    dateFilter: 'Nov 19, 2026',
  });
  assert.equal(amina.length, 1);
  assert.equal(amina[0].id, 'LD-3846');
});

test('selectFlightOption switches active flight and updates lead estimated value', () => {
  const lead = INITIAL_LEADS.find((l) => l.id === 'LD-3846')!;
  const updated = selectFlightOption(lead, 'opt-3846-tk');
  assert.equal(updated.flightOptions.find((f) => f.id === 'opt-3846-tk')?.selected, true);
  assert.equal(updated.flightOptions.find((f) => f.id === 'opt-3846-ek')?.selected, false);
  assert.equal(updated.estimatedValue, 1780);
});

test('addFlightOptionToLead appends unique flight options and prevents duplicates', () => {
  const lead = INITIAL_LEADS.find((l) => l.id === 'LD-3846')!;
  const uzAir = FLIGHT_CATALOG.find((f) => f.id === 'cat-hy-dxb-biz')!;
  const withNew = addFlightOptionToLead(lead, uzAir);
  assert.equal(withNew.flightOptions.length, lead.flightOptions.length + 1);

  const duplicateAttempt = addFlightOptionToLead(withNew, uzAir);
  assert.equal(duplicateAttempt.flightOptions.length, withNew.flightOptions.length);
});

test('toggleFlightBookmark toggles bookmark status cleanly', () => {
  const lead = INITIAL_LEADS.find((l) => l.id === 'LD-3846')!;
  const toggled = toggleFlightBookmark(lead, 'opt-3846-tk');
  assert.equal(toggled.flightOptions.find((f) => f.id === 'opt-3846-tk')?.bookmarked, true);
});

test('searchFlights filters by destination, stops, and sorts by lowest price', () => {
  const results = searchFlights(FLIGHT_CATALOG, {
    origin: 'TAS',
    destination: 'DXB',
    cabinClass: 'All',
    stops: 'direct',
    airline: 'All',
    sortBy: 'price_asc',
  });
  assert.ok(results.length >= 3);
  assert.ok(results.every((f) => f.outbound.toCode === 'DXB' && f.outbound.stops === 0));
  for (let i = 1; i < results.length; i += 1) {
    assert.ok(results[i].pricePerPassenger >= results[i - 1].pricePerPassenger);
  }
});

test('interpolateEmailTemplate replaces client, route, airline, and price placeholders', () => {
  const lead = INITIAL_LEADS.find((l) => l.id === 'LD-3846')!;
  const flight = lead.flightOptions[0];
  const tpl = INITIAL_EMAIL_TEMPLATES.find((t) => t.id === 'tpl-flight-offer')!;
  const rendered = interpolateEmailTemplate(tpl, lead, flight);
  assert.equal(rendered.subject, 'Flight Offer: TAS ↔ DXB | StarAviaTravel');
  assert.equal(rendered.greeting, 'Dear Amina Karimova,');
});

test('validateNewLead rejects empty/invalid inputs and accepts valid lead data', () => {
  const invalidErrors = validateNewLead({
    clientName: '',
    email: 'not-an-email',
    phone: '123',
    originCode: 'TAS',
    destinationCode: 'TAS',
    pax: 0,
    departIso: '2026-12-15',
    returnIso: '2026-12-10',
  });
  assert.ok(invalidErrors.clientName);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.phone);
  assert.ok(invalidErrors.destinationCode);
  assert.ok(invalidErrors.pax);
  assert.ok(invalidErrors.returnIso);

  const validErrors = validateNewLead({
    clientName: 'Sardor Alimov',
    email: 'sardor@example.com',
    phone: '+998 90 111 22 33',
    originCode: 'TAS',
    destinationCode: 'DXB',
    pax: 2,
    departIso: '2026-12-10',
    returnIso: '2026-12-17',
  });
  assert.equal(Object.keys(validErrors).length, 0);
});

test('validateSupportTicket enforces required customer support fields', () => {
  const errors = validateSupportTicket({
    clientName: '',
    clientEmail: 'bad',
    subject: 'Hi',
    message: 'Short',
  });
  assert.equal(Object.keys(errors).length, 4);
});

test('role-based access control gates management navigation items properly', () => {
  const agentNav = getVisibleNavItems('sales_agent');
  const managerNav = getVisibleNavItems('manager');
  const adminNav = getVisibleNavItems('admin');

  assert.equal(agentNav.some((i) => i.section === 'management'), false);
  assert.equal(managerNav.some((i) => i.id === 'team_management'), true);
  assert.equal(managerNav.some((i) => i.id === 'agency_settings'), false);
  assert.equal(adminNav.some((i) => i.id === 'agency_settings'), true);
  assert.equal(getRolePermissions('sales_agent').canDeleteLeads, false);
  assert.equal(getRolePermissions('admin').canDeleteLeads, true);
});

test('ID generators increment cleanly from existing sequences', () => {
  assert.equal(generateNextLeadId(INITIAL_LEADS), 'LD-3848');
  assert.equal(generateNextTicketId(INITIAL_TICKETS), 'TK-1049');
});
