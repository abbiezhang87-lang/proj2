// Shared frontend constants.

export const ROLES = Object.freeze({
  EMPLOYEE: 'employee',
  HR: 'hr',
});

export const APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const VISA_STEPS = Object.freeze(['optReceipt', 'optEad', 'i983', 'i20']);

export const STEP_STATUS = Object.freeze({
  NOT_UPLOADED: 'not_uploaded',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const WORK_AUTH_TYPES = Object.freeze(['H1-B', 'L2', 'F1', 'H4', 'Other']);
