export function toNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized.length === 0) return NaN;
    return Number(normalized);
  }

  return Number(value);
}

export function validateOperationalData(formData) {
  const errors = {};

  const peak = toNumber(formData?.throughput?.peakUnitsPerHour);
  const average = toNumber(formData?.throughput?.averageUnitsPerHour);
  const shiftsPerDay = toNumber(formData?.operatingHours?.shiftsPerDay);
  const daysPerWeek = toNumber(formData?.operatingHours?.daysPerWeek);

  if (!Number.isFinite(peak) || peak <= 0) {
    errors.peakUnitsPerHour = 'Peak units/hour must be greater than 0.';
  }

  if (!Number.isFinite(average) || average <= 0) {
    errors.averageUnitsPerHour = 'Average units/hour must be greater than 0.';
  }

  if (Number.isFinite(peak) && Number.isFinite(average) && average > peak) {
    errors.averageUnitsPerHour = 'Average units/hour cannot be greater than peak units/hour.';
  }

  if (!Number.isInteger(shiftsPerDay) || shiftsPerDay < 1 || shiftsPerDay > 3) {
    errors.shiftsPerDay = 'Shifts/day must be between 1 and 3.';
  }

  if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
    errors.daysPerWeek = 'Days/week must be between 1 and 7.';
  }

  return errors;
}

export function validateRobotFleet(robots = []) {
  const errors = [];

  robots.forEach((robot, index) => {
    const rowErrors = {};
    const quantity = toNumber(robot.quantity);
    const unitCost = toNumber(robot.unitCost);

    if (!robot.vendor || robot.vendor.trim().length === 0) {
      rowErrors.vendor = 'Vendor is required.';
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      rowErrors.quantity = 'Quantity must be a whole number greater than 0.';
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      rowErrors.unitCost = 'Unit cost must be 0 or greater.';
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[index] = rowErrors;
    }
  });

  return errors;
}

export function validateConveyanceSegments(segments = []) {
  const errors = [];

  segments.forEach((segment, index) => {
    const rowErrors = {};
    const length = toNumber(segment.length);
    const zones = toNumber(segment.zones);

    if (!Number.isInteger(length) || length < 1) {
      rowErrors.length = 'Length must be a whole number greater than 0.';
    }

    if (!Number.isInteger(zones) || zones < 1) {
      rowErrors.zones = 'Zones must be a whole number greater than 0.';
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[index] = rowErrors;
    }
  });

  return errors;
}
