import { API_BASE_URL, DEFAULT_HEADERS, handleResponse } from '@/config/api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  userIds?: string[];
  topic?: string;
  status: 'sent' | 'scheduled' | 'failed';
  createdAt: string;
  messageId?: string;
}

export interface SendNotificationParams {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  userIds?: string[];
  topic?: string;
}

export const sendNotification = async (data: SendNotificationParams): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getNotificationHistory = async ({
  limit = 50,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: Notification[]; total: number }> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });

  return handleResponse(response);
};

export const getNotificationDetails = async (id: string): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
};
