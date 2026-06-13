export function toInt(
  value: string | number | undefined,
  fallback: number,
  max?: number,
): number {
  const parsed = Number(value ?? fallback);
  const safe = Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  return max ? Math.min(safe, max) : safe;
}

export function getPagination(
  pageValue: string | number | undefined,
  pageSizeValue: string | number | undefined,
  defaultPageSize = 20,
) {
  const page = toInt(pageValue, 1);
  const pageSize = toInt(pageSizeValue, defaultPageSize, 100);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function toBool(value: boolean | string | undefined): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === undefined) {
    return undefined;
  }

  if (value.toLowerCase() === 'true') {
    return true;
  }

  if (value.toLowerCase() === 'false') {
    return false;
  }

  return undefined;
}

export function rawBodyValue<T = string>(body: unknown, key = 'value'): T {
  if (body && typeof body === 'object' && key in body) {
    return (body as Record<string, T>)[key];
  }

  return body as T;
}

export function toJson<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === 'bigint' ? item.toString() : item,
    ),
  ) as T;
}
