import api from './api';

export const messageService = {
  sendMessage: async (receiverId, content) => {
    console.log('Sending message to:', receiverId, 'content:', content);
    const response = await api.post('/messages', {
      messTo: receiverId,
      messContent: content
    });
    console.log('Send message response:', response.data);
    return response.data;
  },

  getConversations: async () => {
    console.log('Getting conversations...');
    const response = await api.get('/messages/conversations');
    console.log('Conversations API response:', response.data);
    
    // Map backend fields to frontend format
    const mapped = response.data.map(conv => ({
      id: conv.other_user_id,
      user: {
        id: conv.other_user_id,
        name: conv.other_user_name
      },
      lastMessage: conv.last_message,
      lastMessageTime: conv.last_message_time
    }));
    
    console.log('Mapped conversations:', mapped);
    return mapped;
  },

  getMessages: async (userId) => {
    console.log('Getting messages with userId:', userId);
    const response = await api.get(`/messages/with/${userId}`);
    console.log('Messages API response:', response.data);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user from localStorage:', user);
    console.log('Current user UserID:', user.UserID);
    
    // Map backend fields to frontend format
    const mapped = response.data.map(msg => {
      const isSent = msg.MessFrom === user.UserID;
      console.log(`Message ${msg.MessID}: MessFrom=${msg.MessFrom}, user.UserID=${user.UserID}, isSent=${isSent}`);
      
      return {
        id: msg.MessID,
        senderId: msg.MessFrom,
        receiverId: msg.MessTo,
        content: msg.MessContent,
        createdAt: msg.MessTimeStamp,
        isSent: isSent
      };
    });
    
    console.log('Mapped messages:', mapped);
    return mapped;
  }
};
