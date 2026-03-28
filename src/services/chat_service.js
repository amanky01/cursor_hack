// frontend/services/chat_service.js
import api from '@/network/core/axiosInstance';

// Sends a message to the backend Express AI route, which proxies to FastAPI
export async function sendAIChat({ message, domain, update_profile }) {
  if (!message || typeof message !== 'string') {
    throw new Error('message is required');
  }
  const res = await api.post('/api/user/chat/ai', {
    message,
    domain,
    update_profile,
  });
  return res.data;
}

// Health status of the chatbot microservice via Express proxy
export async function getChatbotHealth() {
  try {
    const res = await api.get('/api/chatbot/health');
    return Boolean(res?.data?.ok);
  } catch (e) {
    return false;
  }
}
