const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(
    message: string,
    status: number,
    data: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions
  extends RequestInit {
  token?: string | null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    token,
    headers,
    ...requestOptions
  } = options;

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...requestOptions,
        headers: {
          'Content-Type':
            'application/json',
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
          ...headers,
        },
      },
    );

  const contentType =
    response.headers.get(
      'content-type',
    );

  const data =
    contentType?.includes(
      'application/json',
    )
      ? await response.json()
      : null;

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'Request failed';

    throw new ApiError(
      message,
      response.status,
      data,
    );
  }

  return data as T;
}