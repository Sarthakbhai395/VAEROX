const CUSTOM_FIT_POLICY_TEXT =
  'Once measurements are confirmed, custom-fit products are not eligible for return or exchange due to incorrect customer-provided measurements.\n\n' +
  'If the customer receives a damaged or defective product, exchange only will be provided. No refund will be available.';

const REQUIRED_MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest / Bust' },
  { key: 'shoulder', label: 'Shoulder Width' },
  { key: 'waist', label: 'Waist Size' },
  { key: 'thigh', label: 'Thigh Size' },
  { key: 'torso', label: 'Torso / Length' },
  { key: 'hips', label: 'Hips Size' }
];

const VALID_FIT_PREFERENCES = ['Slim Fit', 'Tailored Fit', 'Relaxed Fit'];

/**
 * Validates custom-fit measurement object.
 * Returns { valid: boolean, error?: string, normalized?: object }
 */
const validateCustomMeasurements = (rawMeasurements, options = { requireConfirmed: true }) => {
  if (!rawMeasurements || typeof rawMeasurements !== 'object') {
    return { valid: false, error: 'Custom fit measurements are required.' };
  }

  const normalized = {};

  for (const field of REQUIRED_MEASUREMENT_FIELDS) {
    const rawVal = rawMeasurements[field.key];
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
      return { valid: false, error: `${field.label} measurement is required.` };
    }

    const numVal = Number(rawVal);
    if (!Number.isFinite(numVal) || numVal <= 0 || numVal > 120) {
      return {
        valid: false,
        error: `${field.label} must be a valid measurement between 1 and 120 inches.`
      };
    }

    normalized[field.key] = String(Number(numVal.toFixed(2)));
    normalized[`${field.key}Num`] = Number(numVal.toFixed(2));
  }

  const fitPref = typeof rawMeasurements.fitPreference === 'string'
    ? rawMeasurements.fitPreference.trim()
    : '';

  if (!fitPref) {
    return { valid: false, error: 'Fit preference is required.' };
  }

  // Normalize legacy 'Tailored' value if ever encountered, otherwise accept valid preference
  normalized.fitPreference = fitPref === 'Tailored' ? 'Tailored Fit' : fitPref;

  const isConfirmed = rawMeasurements.confirmed === true;
  const isPolicyAccepted = rawMeasurements.policyAccepted === true;

  if (options.requireConfirmed && (!isConfirmed || !isPolicyAccepted)) {
    return {
      valid: false,
      error: 'Custom fit measurements must be confirmed and policy accepted before proceeding.'
    };
  }

  normalized.confirmed = isConfirmed;
  normalized.policyAccepted = isPolicyAccepted;
  normalized.confirmedAt = rawMeasurements.confirmedAt ? new Date(rawMeasurements.confirmedAt) : new Date();

  return { valid: true, normalized };
};

module.exports = {
  CUSTOM_FIT_POLICY_TEXT,
  REQUIRED_MEASUREMENT_FIELDS,
  VALID_FIT_PREFERENCES,
  validateCustomMeasurements
};

