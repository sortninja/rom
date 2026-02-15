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

export function getConveyanceCostPerFoot(type) {
  if (type === 'MDR') return 350;
  if (type === 'Gravity') return 100;
  return 500;
}

export function calculateConveyanceHardwareCost(segments = []) {
  return segments.reduce((total, segment) => {
    const length = toNumber(segment.length);
    const safeLength = Number.isFinite(length) ? Math.max(0, length) : 0;

    return total + safeLength * getConveyanceCostPerFoot(segment.type);
  }, 0);
}
