import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { messageService } from '../../services/messageService';
import { useBadge } from '../../contexts/BadgeContext';

const CONV_SEEN_KEY = 'messages_seen_snapshot';
const MegaphoneIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ color:'hsla(140,100%,7%,0.36)' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const FlagIcon = ({ className }) => (
  <svg className={className || 'w-4 h-4'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 21V4l7-1 4 1 7-1v13l-7 1-4-1-7 1z" />
    <line x1="3" y1="4" x2="3" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── Sidebar thread row — shared styling for both types ───────────── */
const ThreadRow = ({ selected, onClick, avatar, name, preview, meta, pinned }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
      selected
        ? 'border-l-[3px] border-l-[hsl(130,100%,30%)]'
        : 'border-l-[3px] border-l-transparent'
    }`}
    style={{
      background: selected
        ? 'hsla(130,100%,30%,0.08)'
        : 'transparent',
      borderBottom: '1px solid rgba(255,255,255,0.30)',
    }}
  >
    {/* Avatar */}
    <div className="flex-shrink-0 mt-0.5">{avatar}</div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {pinned && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ background:'hsla(130,100%,30%,0.13)', color:'hsl(130,100%,28%)' }}>
              Pinned
            </span>
          )}
          <p className="text-sm font-semibold truncate" style={{ color:'hsl(140,100%,7%)' }}>{name}</p>
        </div>
        {meta && <span className="text-xs shrink-0" style={{ color:'hsla(140,100%,7%,0.38)' }}>{meta}</span>}
      </div>
      <p className="text-xs truncate" style={{ color:'hsla(140,100%,7%,0.50)' }}>{preview}</p>
    </div>
  </button>
);

export default function Messages() {
  const location = useLocation();
  const { notify, clear } = useBadge();

  const [conversations,       setConversations]       = useState([]);
  const [announcements,       setAnnouncements]       = useState([]);
  const [selectedUser,        setSelectedUser]        = useState(null);
  // null = nothing selected; 'announcements' = pinned thread open
  const [announcementOpen,    setAnnouncementOpen]    = useState(false);
  const [messages,            setMessages]            = useState([]);
  const [newMessage,          setNewMessage]          = useState('');
  const [search,              setSearch]              = useState('');
  const [sending,             setSending]             = useState(false);
  const messagesEndRef = useRef(null);

  // Report modal state
  const [showReport,    setShowReport]    = useState(false);
  const [reportReason,  setReportReason]  = useState('Inappropriate Behavior');
  const [reportDesc,    setReportDesc]    = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportDone,    setReportDone]    = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState([]);

  /* ── data fetching ──────────────────────────────────────────── */
  useEffect(() => {
    fetchConversations();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const t = setInterval(fetchConversations, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const t = setInterval(() => fetchMessages(selectedUser.id), 3000);
    return () => clearInterval(t);
  }, [selectedUser]);

  useEffect(() => {
    if (location.state?.userId && conversations.length > 0) {
      const conv = conversations.find(c => c.user.id === location.state.userId);
      if (conv) { setSelectedUser(conv.user); setAnnouncementOpen(false); }
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
    setSelectedMsgIds([]); // clear selection on conversation change
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      // User is on the page — update snapshot and clear badge
      const snapshot = {};
      data.forEach(c => { snapshot[c.id] = c.lastMessageTime || ''; });
      localStorage.setItem(CONV_SEEN_KEY, JSON.stringify(snapshot));
      clear('/messages');
    }
    catch (e) { console.error('conversations:', e); }
  };

  const fetchAnnouncements = async () => {
    try { setAnnouncements(await messageService.getAnnouncements()); }
    catch (e) { console.error('announcements:', e); }
  };

  const fetchMessages = async (userId) => {
    try { setMessages(await messageService.getMessages(userId)); }
    catch (e) { console.error('messages:', e); }
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

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setReportSending(true);

    // Build message log — selected messages sorted by time, each on its own line
    const selectedMessages = messages
      .filter(m => selectedMsgIds.includes(m.id))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const messageLog = selectedMessages.length > 0
      ? selectedMessages.map(m => {
          const time = new Date(m.createdAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
          const sender = m.isSent ? 'Me' : selectedUser.name;
          return `[${time}] ${sender}: ${m.content}`;
        }).join('\n---\n')
      : null;

    try {
      await messageService.reportUser({
        reportedUserId: selectedUser.id,
        reason: reportReason,
        description: reportDesc,
        messageLog,
      });
      setReportDone(true);
      setReportDesc('');
      setSelectedMsgIds([]);
      setTimeout(() => { setShowReport(false); setReportDone(false); }, 2000);
    } catch { alert('Failed to submit report.'); }
    finally { setReportSending(false); }
  };

  const toggleMsgSelect = (id) => {
    setSelectedMsgIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ── open the pinned Announcements thread ───────────────────── */
  const openAnnouncements = () => {
    setAnnouncementOpen(true);
    setSelectedUser(null);
    setMessages([]);
  };

  /* ── filtered conversation list (never includes announcements) ─ */
  const filteredConversations = conversations.filter(c => {
    if (!search) return true;
    return c.user.name.toLowerCase().includes(search.toLowerCase());
  });

  /* ── latest announcement preview text ──────────────────────── */
  const latestAnn = announcements[0];
  const annPreview = latestAnn
    ? latestAnn.content?.slice(0, 60) + (latestAnn.content?.length > 60 ? '…' : '')
    : 'No announcements yet';
  const annMeta = latestAnn
    ? new Date(latestAnn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  /* ── view state ─────────────────────────────────────────────── */
  const view = announcementOpen ? 'announcements' : selectedUser ? 'chat' : 'empty';

  /* ── avatar helpers ─────────────────────────────────────────── */
  const AnnouncementAvatar = () => (
    <div className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background:'hsla(42,90%,55%,0.18)' }}>
      <MegaphoneIcon className="w-4 h-4" style={{ color:'hsl(38,65%,42%)' }} />
    </div>
  );

  const UserAvatar = ({ name }) => (
    <div className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background:'hsla(130,100%,30%,0.13)' }}>
      <span className="text-sm font-semibold" style={{ color:'hsl(130,100%,28%)' }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  return (
    <Layout>
      <div className="glass-card overflow-hidden flex" style={{ height:'calc(100vh - 140px)' }}>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="w-72 flex flex-col flex-shrink-0"
          style={{ borderRight:'1px solid rgba(255,255,255,0.35)' }}>

          {/* Header */}
          <div className="p-4 shrink-0" style={{ borderBottom:'1px solid rgba(255,255,255,0.35)' }}>
            <h2 className="heading-dark text-base mb-3">Messages</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color:'hsla(140,100%,7%,0.38)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm" />
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">

            {/* ── PINNED: Announcements — always first, never filtered out ── */}
            <ThreadRow
              selected={announcementOpen}
              onClick={openAnnouncements}
              avatar={<AnnouncementAvatar />}
              name="Announcements"
              preview={annPreview}
              meta={annMeta}
              pinned
            />

            {/* ── Regular conversations (filtered by search) ── */}
            {filteredConversations.length === 0 && search ? (
              <p className="p-4 text-center text-sm" style={{ color:'hsla(140,100%,7%,0.42)' }}>
                No conversations match "{search}"
              </p>
            ) : filteredConversations.length === 0 ? (
              <p className="p-4 text-center text-sm" style={{ color:'hsla(140,100%,7%,0.42)' }}>
                No conversations yet. Start one from a pet profile.
              </p>
            ) : filteredConversations
                .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0))
                .map(conv => (
                  <ThreadRow
                    key={conv.id}
                    selected={selectedUser?.id === conv.user.id}
                    onClick={() => { setSelectedUser(conv.user); setAnnouncementOpen(false); }}
                    avatar={<UserAvatar name={conv.user.name} />}
                    name={conv.user.name}
                    preview={conv.lastMessage || ''}
                    meta={conv.lastMessageTime
                      ? new Date(conv.lastMessageTime).toLocaleDateString('en-US', { month:'short', day:'numeric' })
                      : ''}
                  />
                ))
            }
          </div>
        </div>

        {/* ── Main panel ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── ANNOUNCEMENTS view (read-only feed) ── */}
          {view === 'announcements' && (
            <>
              {/* Header */}
              <div className="p-4 shrink-0 flex items-center gap-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.35)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background:'hsla(42,90%,55%,0.18)' }}>
                  <MegaphoneIcon className="w-4 h-4" style={{ color:'hsl(38,65%,42%)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide" style={{ color:'hsl(140,100%,7%)' }}>
                    Announcements
                  </p>
                  <p className="text-xs" style={{ color:'hsla(140,100%,7%,0.45)' }}>
                    official broadcast · read only
                  </p>
                </div>
              </div>

              {/* Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4"
                style={{ background:'rgba(255,255,255,0.10)' }}>
                {announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <MegaphoneIcon className="w-12 h-12 mb-4" style={{ color:'hsla(140,100%,7%,0.20)' }} />
                    <p className="text-sm font-medium" style={{ color:'hsla(140,100%,7%,0.50)' }}>
                      No announcements yet
                    </p>
                  </div>
                ) : announcements.map(ann => (
                  <div key={ann.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background:'hsla(42,90%,55%,0.18)' }}>
                      <MegaphoneIcon className="w-3.5 h-3.5" style={{ color:'hsl(38,65%,42%)' }} />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <p className="text-xs mb-1" style={{ color:'hsla(140,100%,7%,0.45)' }}>
                        {ann.postedBy}
                      </p>
                      {/* Announcement bubble — same visual weight as a received message */}
                      <div className="glass-inner px-5 py-4 rounded-2xl rounded-tl-sm">
                        {ann.type && (
                          <span className="inline-flex items-center gap-1 mb-3 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                            style={{ background:'hsla(42,90%,55%,0.16)', color:'hsl(38,65%,42%)' }}>
                            <MegaphoneIcon className="w-3 h-3" />
                            {ann.type}
                          </span>
                        )}
                        <p className="text-sm font-bold mb-2 leading-snug" style={{ color:'hsl(140,100%,7%)' }}>
                          {ann.title}
                        </p>
                        <div style={{ borderTop:'1px solid rgba(255,255,255,0.45)', marginBottom:'0.75rem' }} />
                        <p className="text-sm leading-relaxed whitespace-pre-wrap"
                          style={{ color:'hsla(140,100%,7%,0.72)' }}>
                          {ann.content}
                        </p>
                        <p className="text-xs mt-4 text-right"
                          style={{ color:'hsla(140,100%,7%,0.38)' }}>
                          {new Date(ann.createdAt).toLocaleString('en-US', {
                            weekday:'short', year:'numeric', month:'short',
                            day:'numeric', hour:'2-digit', minute:'2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disabled compose bar */}
              <div className="p-4 shrink-0" style={{ borderTop:'1px solid rgba(255,255,255,0.35)' }}>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{ background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.40)' }}>
                  <LockIcon />
                  <span className="text-sm" style={{ color:'hsla(140,100%,7%,0.42)' }}>
                    Replies are disabled for announcements
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── CHAT view ── */}
          {view === 'chat' && (
            <>
              <div className="p-4 shrink-0 flex items-center gap-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.35)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background:'hsla(130,100%,30%,0.13)' }}>
                  <span className="text-sm font-semibold" style={{ color:'hsl(130,100%,28%)' }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide flex-1" style={{ color:'hsl(140,100%,7%)' }}>
                  {selectedUser.name}
                </p>
                {/* Report button — only visible when messages are selected */}
                {selectedMsgIds.length > 0 && (
                  <button
                    onClick={() => { setShowReport(true); setReportDone(false); }}
                    title={`Report ${selectedUser.name}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-50"
                    style={{ color:'hsla(0,70%,50%,0.85)' }}
                  >
                    <FlagIcon className="w-4 h-4" />
                    <span>Report ({selectedMsgIds.length})</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ background:'rgba(255,255,255,0.10)' }}>
                {messages.length === 0 ? (
                  <p className="text-center text-sm py-8" style={{ color:'hsla(140,100%,7%,0.40)' }}>
                    No messages yet. Say hello!
                  </p>
                ) : messages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => toggleMsgSelect(msg.id)}
                    className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'} cursor-pointer`}
                  >
                    {/* Selection indicator for received messages — only when selected */}
                    {!msg.isSent && selectedMsgIds.includes(msg.id) && (
                      <div className="flex items-center mr-2 self-center">
                        <div className="w-4 h-4 rounded-full border-2 border-red-400 bg-red-400 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm transition-all ${
                      msg.isSent
                        ? 'rounded-br-sm text-white'
                        : 'glass-inner rounded-bl-sm'
                    } ${selectedMsgIds.includes(msg.id) ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
                      style={msg.isSent
                        ? { background: selectedMsgIds.includes(msg.id) ? 'hsl(130,80%,22%)' : 'hsl(130,100%,28%)' }
                        : { color:'hsl(140,100%,7%)' }
                      }>
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1"
                        style={{ color: msg.isSent ? 'rgba(255,255,255,0.55)' : 'hsla(140,100%,7%,0.40)' }}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    {/* Selection indicator for sent messages — only when selected */}
                    {msg.isSent && selectedMsgIds.includes(msg.id) && (
                      <div className="flex items-center ml-2 self-center">
                        <div className="w-4 h-4 rounded-full border-2 border-red-400 bg-red-400 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Selection hint */}
              {messages.length > 0 && selectedMsgIds.length === 0 && (
                <div className="px-4 py-1.5 text-center">
                  <p className="text-xs" style={{ color:'hsla(140,100%,7%,0.32)' }}>
                    Click messages to select them for a report
                  </p>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 shrink-0"
                style={{ borderTop:'1px solid rgba(255,255,255,0.35)' }}>
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm" />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="btn-pay"
                    style={{ padding:'10px 20px', fontSize:'0.8125rem' }}>
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── EMPTY state ── */}
          {view === 'empty' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <svg className="w-14 h-14 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color:'hsla(140,100%,7%,0.18)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color:'hsla(140,100%,7%,0.55)' }}>
                Select a conversation
              </p>
              <p className="text-xs mt-1 font-light" style={{ color:'hsla(140,100%,7%,0.40)' }}>
                Start one by clicking "Message Owner" on a pet profile.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── Report User Modal ── */}
      {showReport && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.35)' }}
          onClick={() => setShowReport(false)}>
          <div className="glass-card w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            {reportDone ? (
              <div className="text-center py-4">
                <p className="text-sm font-bold" style={{ color:'hsl(130,100%,28%)' }}>
                  Report submitted. Thank you.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlagIcon className="w-4 h-4" style={{ color:'hsl(0,65%,50%)' }} />
                    <p className="text-sm font-bold uppercase tracking-wide" style={{ color:'hsl(140,100%,7%)' }}>
                      Report {selectedUser.name}
                    </p>
                  </div>
                  <button onClick={() => setShowReport(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color:'hsla(140,100%,7%,0.60)' }}>
                      Reason
                    </label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                      required
                    >
                      <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                      <option value="Spam / Scammer Activity">Spam / Scammer Activity</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Fraud">Fraud</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color:'hsla(140,100%,7%,0.60)' }}>
                      Description (optional)
                    </label>
                    <textarea
                      value={reportDesc}
                      onChange={e => setReportDesc(e.target.value)}
                      rows={3}
                      placeholder="Describe the issue…"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <button type="submit" disabled={reportSending}
                    className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                    style={{ background:'hsl(0,65%,50%)' }}>
                    {reportSending ? 'Submitting…' : 'Submit Report'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </Layout>
  );
}