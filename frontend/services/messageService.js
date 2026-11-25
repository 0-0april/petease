import api from './api';

export const messageService = {
  sendMessage: async (receiverId, content) => {
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

  // Returns { messages: [...], blockStatus: { blocked, iBlockedThem, theyBlockedMe } }
  getMessages: async (userId) => {
    const response = await api.get(`/messages/with/${userId}`);
    const { messages, blockStatus } = response.data;
    const mapped = (messages || []).map(msg => ({
      id: msg.MessID,
      senderId: msg.MessFrom,
      receiverId: msg.MessTo,
      content: msg.MessContent,
      createdAt: msg.MessTimeStamp,
      isSent: msg.is_mine,
    }));
    return {
      messages: mapped,
      blockStatus: blockStatus || { blocked: false, iBlockedThem: false, theyBlockedMe: false },
    };
  },

  getAnnouncements: async () => {
    const response = await api.get('/users/announcements');
    return response.data;
  },

  reportUser: async ({ reportedUserId, reason, description, messageLog }) => {
    const response = await api.post('/users/report', { reportedUserId, reason, description, messageLog });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    await api.delete(`/messages/${messageId}`);
  },

  blockUser: async (userId) => {
    const response = await api.post(`/messages/block/${userId}`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.delete(`/messages/block/${userId}`);
    return response.data;
  },

  getBlockStatus: async (userId) => {
    const response = await api.get(`/messages/block-status/${userId}`);
    return response.data;
  },
};