import { toNumber } from './validation.js';

export function calculateRobotLineCost(robot = {}) {
  const quantity = toNumber(robot.quantity);
  const unitCost = toNumber(robot.unitCost);

  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  const safeUnitCost = Number.isFinite(unitCost) ? Math.max(0, unitCost) : 0;

  return safeQuantity * safeUnitCost;
}

export function calculateRoboticsHardwareCost(robots = []) {
  return robots.reduce((total, robot) => total + calculateRobotLineCost(robot), 0);
}

export function getConveyanceCostPerFoot(type) {
  if (type === 'MDR') return 350;
  if (type === 'Gravity') return 100;
  return 500;
}

export function calculateConveyanceSegmentCost(segment = {}) {
  const length = toNumber(segment.length);
  const safeLength = Number.isFinite(length) ? Math.max(0, length) : 0;

  return safeLength * getConveyanceCostPerFoot(segment.type);
}

export function calculateConveyanceHardwareCost(segments = []) {
  return segments.reduce((total, segment) => total + calculateConveyanceSegmentCost(segment), 0);
}


export function getStorageCostPerPosition(type) {
  if (type === 'Selective Racking') return 60;
  if (type === 'Push Back') return 120;
  return 40;
}

export function calculateStorageZoneCost(zone = {}) {
  const positions = toNumber(zone.positions);
  const safePositions = Number.isFinite(positions) ? Math.max(0, positions) : 0;

  return safePositions * getStorageCostPerPosition(zone.type);
}

export function calculateStorageInfrastructureCost(zones = []) {
  return zones.reduce((total, zone) => total + calculateStorageZoneCost(zone), 0);
}

export function calculateControlPanelCost(panel = {}) {
  const quantity = toNumber(panel.quantity);
  const unitCost = toNumber(panel.unitCost);

  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  const safeUnitCost = Number.isFinite(unitCost) ? Math.max(0, unitCost) : 0;

  return safeQuantity * safeUnitCost;
}

export function calculateControlsElectricalCost(panels = []) {
  return panels.reduce((total, panel) => total + calculateControlPanelCost(panel), 0);
}


export function calculateSoftwareApplicationAnnualCost(application = {}) {
  const annualCost = toNumber(application.annualCost);
  const safeAnnualCost = Number.isFinite(annualCost) ? Math.max(0, annualCost) : 0;

  return safeAnnualCost;
}

export function calculateSoftwareSystemsCost(applications = []) {
  return applications.reduce((total, application) => total + calculateSoftwareApplicationAnnualCost(application), 0);
}

export function calculateImplementationServiceCost(service = {}) {
  const hours = toNumber(service.hours);
  const hourlyRate = toNumber(service.hourlyRate);

  const safeHours = Number.isFinite(hours) ? Math.max(0, hours) : 0;
  const safeHourlyRate = Number.isFinite(hourlyRate) ? Math.max(0, hourlyRate) : 0;

  return safeHours * safeHourlyRate;
}

export function calculateImplementationServicesCost(services = []) {
  return services.reduce((total, service) => total + calculateImplementationServiceCost(service), 0);
}
