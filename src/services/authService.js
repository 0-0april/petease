import { mockUsers } from '../data/mockData';

export const authService = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      token: `mock-token-${Date.now()}`
    };
    mockUsers.push(newUser);
    return newUser;
  }
};
