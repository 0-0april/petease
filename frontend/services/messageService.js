import api from './api';

export const messageService = {
  sendMessage: async (receiverId, content) => {
    console.log('Sending message to:', receiverId, 'content:', content);
    const response = await api.post('/messages', {
      messTo: receiverId,
      messContent: content
    });
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data.map(conv => ({
      id: conv.other_user_id,
      user: {
        id: conv.other_user_id,
        name: conv.other_user_name
      },
      lastMessage: conv.last_message,
      lastMessageTime: conv.last_message_time
    }));
  },

  getMessages: async (userId) => {
    const response = await api.get(`/messages/with/${userId}`);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return response.data.map(msg => ({
      id: msg.MessID,
      senderId: msg.MessFrom,
      receiverId: msg.MessTo,
      content: msg.MessContent,
      createdAt: msg.MessTimeStamp,
      isSent: msg.MessFrom === user.UserID
    }));
  },

  getAnnouncements: async () => {
    const response = await api.get('/users/announcements');
    return response.data;
  }
};
