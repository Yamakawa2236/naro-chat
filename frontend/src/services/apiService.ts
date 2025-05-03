import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

interface SendMessageResponse {
  response: string;
}

export const sendMessage = async (message: string): Promise<SendMessageResponse> => {
  try {
    const apiUrl = `${API_BASE_URL}/chat`;
    console.log('Sending message to API:', message);
    console.log('API URL:', apiUrl);

    const response = await axios.post<SendMessageResponse>(apiUrl, { message });

    console.log('Received response from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);

    if (axios.isAxiosError(error)) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    } else if (error instanceof Error) {
        console.error('Generic Error:', error.message);
    }

    throw error;
  }
};