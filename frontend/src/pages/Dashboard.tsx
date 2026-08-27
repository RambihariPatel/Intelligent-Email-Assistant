import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { LogOut, Search, Star, Inbox, Send, Edit3, Trash2, Mail, Clock, X, Loader2, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [tags, setTags] = useState<Record<string, string>>({});
  const [taggingId, setTaggingId] = useState<string | null>(null);
  
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchEmails = async (query = '', currentFilter = '') => {
    try {
      setLoading(true);
      let finalQuery = query;
      if (currentFilter === 'starred') finalQuery += ' is:starred';
      if (currentFilter === 'sent') finalQuery += ' in:sent';
      if (currentFilter === 'trash') finalQuery += ' in:trash';
      
      const res = await api.get(`/emails?q=${encodeURIComponent(finalQuery.trim())}`);
      setEmails(res.data.messages || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorize = async (e: React.MouseEvent, emailId: string, subject: string, snippet: string) => {
    e.stopPropagation();
    if (tags[emailId] || taggingId === emailId) return;
    
    try {
      setTaggingId(emailId);
      const res = await api.post('/ai/categorize', { subject, snippet });
      setTags(prev => ({ ...prev, [emailId]: res.data.category }));
    } catch (error) {
      console.error(error);
    } finally {
      setTaggingId(null);
    }
  };

  useEffect(() => {
    fetchEmails(search, filter);
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails(search, filter);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) return alert('Fill all fields');
    
    try {
      setSendingEmail(true);
      await api.post('/emails/send', {
        to: composeTo,
        subject: composeSubject,
        body: composeBody
      });
      alert('Email Sent!');
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const extractName = (from: string) => {
    const match = from.match(/^([^<]+)/);
    return match ? match[1].replace(/"/g, '').trim() : from;
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
            <Mail size={22} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            AgentMail AI
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            <li>
              <button onClick={() => setFilter('')} className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer font-semibold transition-colors ${filter === '' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Inbox size={20} /> Inbox
              </button>
            </li>
            <li>
              <button onClick={() => setFilter('starred')} className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer font-semibold transition-colors ${filter === 'starred' ? 'bg-yellow-50 text-yellow-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Star size={20} /> Starred
              </button>
            </li>
            <li>
              <button onClick={() => setFilter('sent')} className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer font-semibold transition-colors ${filter === 'sent' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Send size={20} /> Sent
              </button>
            </li>
            <li>
              <button onClick={() => setFilter('trash')} className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer font-semibold transition-colors ${filter === 'trash' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Trash2 size={20} /> Trash
              </button>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button onClick={logout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 w-full p-3 rounded-xl transition-colors font-medium">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-8 justify-between z-10 sticky top-0">
          <form onSubmit={handleSearch} className="flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 px-4 py-2.5 rounded-full w-[450px] transition-all shadow-sm border border-transparent focus-within:border-indigo-300">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search in mail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none ml-3 w-full text-slate-700 placeholder-slate-400"
            />
          </form>
          <button onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:translate-y-0">
            <Edit3 size={18} /> Compose
          </button>
        </header>

        {/* Email List */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-slate-800 capitalize">{filter || 'Primary Inbox'}</h2>
              <span className="text-sm font-medium text-slate-500">{emails.length} Messages</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Syncing your emails...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {emails.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Inbox size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium text-lg">No emails found</p>
                    <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {emails.map((email: any) => {
                      const headers = email.payload?.headers || [];
                      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
                      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
                      const dateStr = headers.find((h: any) => h.name === 'Date')?.value || '';
                      
                      const senderName = extractName(filter === 'sent' ? (headers.find((h: any) => h.name === 'To')?.value || '') : from);
                      const initial = senderName.charAt(0).toUpperCase() || 'U';
                      
                      let timeString = '';
                      try {
                        const dateObj = new Date(dateStr);
                        if (dateObj.toDateString() === new Date().toDateString()) {
                          timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } else {
                          timeString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        }
                      } catch(e) { timeString = dateStr.split(' ')[0] || ''; }
                      
                      return (
                        <div 
                          key={email.id} 
                          onClick={() => navigate(`/email/${email.id}`)}
                          className="group flex items-center gap-4 p-4 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm border border-indigo-200 group-hover:from-indigo-200 group-hover:to-blue-200 transition-colors">
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center gap-4">
                            <div className="w-48 flex-shrink-0">
                              <p className="font-semibold text-slate-800 truncate">{filter === 'sent' ? `To: ${senderName}` : senderName}</p>
                            </div>
                            <div className="flex-1 truncate">
                              <span className="font-medium text-slate-800">{subject}</span>
                              <span className="text-slate-400 mx-2">-</span>
                              <span className="text-slate-500 text-sm truncate">{email.snippet}</span>
                            </div>
                          </div>
                          {/* Time & Actions */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">{timeString}</span>
                            
                            {/* AI Tag */}
                            {tags[email.id] ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 whitespace-nowrap">
                                {tags[email.id]}
                              </span>
                            ) : (
                              <button 
                                onClick={(e) => handleCategorize(e, email.id, subject, email.snippet)}
                                disabled={taggingId === email.id}
                                className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {taggingId === email.id ? <Loader2 size={12} className="animate-spin" /> : <Tag size={12} />}
                                {taggingId === email.id ? 'Tagging...' : 'AI Tag'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">New Message</h3>
              <button onClick={() => setIsComposeOpen(false)} className="hover:bg-indigo-500 p-1 rounded transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendEmail} className="flex flex-col p-6 gap-4">
              <input 
                type="email" 
                placeholder="To" 
                required
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="w-full border-b border-slate-200 pb-2 focus:border-indigo-600 outline-none transition-colors"
              />
              <input 
                type="text" 
                placeholder="Subject" 
                required
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="w-full border-b border-slate-200 pb-2 focus:border-indigo-600 outline-none transition-colors font-semibold"
              />
              <textarea 
                placeholder="Write your email here..." 
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full h-64 mt-2 outline-none resize-none text-slate-700"
              />
              <div className="flex justify-between items-center mt-4">
                <button type="button" onClick={() => setIsComposeOpen(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-full font-medium transition-colors">Discard</button>
                <button type="submit" disabled={sendingEmail} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                  {sendingEmail ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
