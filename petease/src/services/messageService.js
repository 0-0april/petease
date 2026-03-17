import { mockMessages, mockConversations } from '../data/mockData';

let messages = [...mockMessages];

export const messageService = {
  sendMessage: async (receiverId, content) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newMessage = {
      id: messages.length + 1,
      senderId: user.id,
      receiverId,
      content,
      isSent: true,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    return newMessage;
  },

  getConversations: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockConversations;
  },

  getMessages: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return messages
      .filter(m => 
        (m.senderId === user.id && m.receiverId === parseInt(userId)) ||
        (m.receiverId === user.id && m.senderId === parseInt(userId))
      )
      .map(m => ({
        ...m,
        isSent: m.senderId === user.id
      }));
  }
};
