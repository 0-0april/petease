import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { messageService } from '../../services/messageService';

const MegaphoneIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const Messages = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    if (location.state?.userId && conversations.length > 0) {
      const conv = conversations.find(c => c.user.id === location.state.userId);
      if (conv) { setSelectedUser(conv.user); setSelectedAnnouncement(null); }
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try { setConversations(await messageService.getConversations()); }
    catch (err) { console.error('conversations:', err); }
  };

  const fetchAnnouncements = async () => {
    try { setAnnouncements(await messageService.getAnnouncements()); }
    catch (err) { console.error('announcements:', err); }
  };

  const fetchMessages = async (userId) => {
    try { setMessages(await messageService.getMessages(userId)); }
    catch (err) { console.error('messages:', err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      await messageService.sendMessage(selectedUser.id, newMessage.trim());
      setNewMessage('');
      fetchMessages(selectedUser.id);
      fetchConversations();
    } catch { alert('Failed to send message.'); }
    finally { setSending(false); }
  };

  const allItems = [
    ...announcements.map(a => ({ _type: 'announcement', id: `ann-${a.id}`, data: a, sortKey: new Date(a.createdAt).getTime() })),
    ...conversations.map(c => ({ _type: 'conversation', id: `conv-${c.id}`, data: c, sortKey: new Date(c.lastMessageTime || 0).getTime() })),
  ]
    .filter(item => {
      if (!search) return true;
      const q = search.toLowerCase();
      return item._type === 'announcement'
        ? item.data.title.toLowerCase().includes(q) || item.data.content.toLowerCase().includes(q)
        : item.data.user.name.toLowerCase().includes(q);
    })
    .sort((a, b) => b.sortKey - a.sortKey);

  const view = selectedUser ? 'chat' : selectedAnnouncement ? 'announcement' : 'empty';

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex" style={{ height: 'calc(100vh - 140px)' }}>

        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {allItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                {search ? 'No results.' : <><p className="font-medium text-gray-500 mb-1">Nothing here yet</p><p>Start a conversation from a pet profile.</p></>}
              </div>
            ) : allItems.map(item => {
              if (item._type === 'announcement') {
                const ann = item.data;
                const sel = selectedAnnouncement?.id === ann.id;
                return (
                  <button key={item.id} onClick={() => { setSelectedAnnouncement(ann); setSelectedUser(null); setMessages([]); }}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${sel ? 'bg-green-50 border-l-4 border-l-primary' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MegaphoneIcon className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm truncate">{ann.title}</p>
                          <span className="text-xs text-gray-400 shrink-0">{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{ann.content}</p>
                        <p className="text-xs text-yellow-600 font-medium mt-0.5">{ann.postedBy}</p>
                      </div>
                    </div>
                  </button>
                );
              }
              const conv = item.data;
              const sel = selectedUser?.id === conv.user.id;
              return (
                <button key={item.id} onClick={() => { setSelectedUser(conv.user); setSelectedAnnouncement(null); }}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${sel ? 'bg-green-50 border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">{conv.user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{conv.user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Chat */}
          {view === 'chat' && (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">{selectedUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-base font-semibold text-gray-900">{selectedUser.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello!</p>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      msg.isSent ? 'bg-primary text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.isSent ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 shrink-0">
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="submit" disabled={sending || !newMessage.trim()}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark disabled:opacity-50 text-sm font-medium">
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Announcement */}
          {view === 'announcement' && (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <MegaphoneIcon className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">PetEase Announcements</p>
                  <p className="text-xs text-gray-400">Official broadcast · read only</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MegaphoneIcon className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 max-w-xl">
                    <p className="text-xs text-gray-500 mb-1">{selectedAnnouncement.postedBy}</p>
                    <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm px-5 py-4">
                      {selectedAnnouncement.type && (
                        <span className="inline-flex items-center gap-1 mb-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          <MegaphoneIcon className="w-3 h-3" />
                          {selectedAnnouncement.type}
                        </span>
                      )}
                      <p className="font-bold text-gray-900 text-base mb-2 leading-snug">{selectedAnnouncement.title}</p>
                      <div className="border-t border-gray-100 mb-3" />
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                      <p className="text-xs text-gray-400 mt-4 text-right">
                        {new Date(selectedAnnouncement.createdAt).toLocaleString('en-US', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm text-gray-400">Replies are disabled for announcements</span>
                </div>
              </div>
            </>
          )}

          {/* Empty */}
          {view === 'empty' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1">Start one by clicking "Message Owner" on a pet profile.</p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Messages;
