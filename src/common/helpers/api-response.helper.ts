export const ok = <T>(data: T, message = 'Success') => ({
  data,
  errors: [],
  message,
  success: true,
});

export const fail = (message: string, errors: string[] = []) => ({
  errors,
  message,
  success: false,
});
