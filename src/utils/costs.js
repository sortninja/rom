import { toNumber } from './validation.js';

export function calculateRoboticsHardwareCost(robots = []) {
  return robots.reduce((total, robot) => {
    const quantity = toNumber(robot.quantity);
    const unitCost = toNumber(robot.unitCost);

    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
    const safeUnitCost = Number.isFinite(unitCost) ? Math.max(0, unitCost) : 0;

    return total + safeQuantity * safeUnitCost;
  }, 0);
}
