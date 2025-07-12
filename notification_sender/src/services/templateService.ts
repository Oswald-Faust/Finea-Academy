import { API_BASE_URL, DEFAULT_HEADERS, handleResponse } from '@/config/api';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateTemplateParams {
  name: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface UpdateTemplateParams extends Partial<CreateTemplateParams> {
  id: string;
}

export const getTemplates = async (): Promise<NotificationTemplate[]> => {
  const response = await fetch(`${API_BASE_URL}/templates`, {
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createTemplate = async (
  data: CreateTemplateParams
): Promise<NotificationTemplate> => {
  const response = await fetch(`${API_BASE_URL}/templates`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(response);
};

export const updateTemplate = async (
  id: string,
  data: Partial<CreateTemplateParams>
): Promise<NotificationTemplate> => {
  const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
    method: 'PUT',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(response);
};

export const deleteTemplate = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
    method: 'DELETE',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getTemplate = async (id: string): Promise<NotificationTemplate> => {
  const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
};
