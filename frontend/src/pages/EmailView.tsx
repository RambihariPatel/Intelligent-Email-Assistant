import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ArrowLeft, Sparkles, Send, Loader2, CheckSquare, ShieldAlert, ShieldCheck, User, Clock } from 'lucide-react';

export default function EmailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // AI States
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [replyDraft, setReplyDraft] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  
  // Bonus Feature: Tone Selection
  const [replyTone, setReplyTone] = useState('Professional');

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await api.get(`/emails/${id}`);
        setEmail(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmail();
  }, [id]);

  // Decode Base64 safely
  const decodeBase64 = (str: string) => {
    try {
      return decodeURIComponent(escape(window.atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
    } catch (e) {
      return str;
    }
  };

  const getEmailBody = () => {
    if (!email) return '';
    let body = '';
    const parts = email.payload?.parts;
    
    if (parts) {
      const htmlPart = parts.find((p: any) => p.mimeType === 'text/html');
      const textPart = parts.find((p: any) => p.mimeType === 'text/plain');
      
      if (htmlPart && htmlPart.body?.data) {
        body = decodeBase64(htmlPart.body.data);
      } else if (textPart && textPart.body?.data) {
        body = decodeBase64(textPart.body.data);
      }
    } else if (email.payload?.body?.data) {
      body = decodeBase64(email.payload.body.data);
    }
    return body;
  };

  const getPlainText = () => {
    // Very rough HTML to text for the AI prompt
    const div = document.createElement('div');
    div.innerHTML = getEmailBody();
    return div.textContent || div.innerText || '';
  };

  // Action Items State
  const [actionItems, setActionItems] = useState('');
  const [loadingActionItems, setLoadingActionItems] = useState(false);

  const handleSummarize = async () => {
    try {
      setLoadingSummary(true);
      const text = getPlainText();
      const res = await api.post('/ai/summarize', { content: text });
      setSummary(res.data.summary);
    } catch (error) {
      console.error(error);
      setSummary('Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Spam State
  const [spamStatus, setSpamStatus] = useState<{ isSpam: boolean, reason: string } | null>(null);
  const [loadingSpam, setLoadingSpam] = useState(false);

  const handleExtractActions = async () => {
    try {
      setLoadingActionItems(true);
      const text = getPlainText();
      const res = await api.post('/ai/action-items', { content: text });
      setActionItems(res.data.actionItems);
    } catch (error) {
      console.error(error);
      setActionItems('Failed to extract action items.');
    } finally {
      setLoadingActionItems(false);
    }
  };

  const handleSpamCheck = async () => {
    try {
      setLoadingSpam(true);
      const text = getPlainText();
      const headers = email.payload?.headers || [];
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const res = await api.post('/ai/spam-check', { content: text, sender: from });
      setSpamStatus(res.data.result);
    } catch (error) {
      console.error(error);
      alert('Failed to run spam check.');
    } finally {
      setLoadingSpam(false);
    }
  };

  const handleGenerateReply = async () => {
    try {
      setLoadingReply(true);
      const text = getPlainText();
      const res = await api.post('/ai/reply', { content: text, tone: replyTone.toLowerCase() });
      setReplyDraft(res.data.reply);
    } catch (error) {
      console.error(error);
      setReplyDraft('Failed to generate reply.');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyDraft) return;
    try {
      setSendingReply(true);
      const toHeader = email.payload.headers.find((h: any) => h.name === 'From')?.value;
      const subjectHeader = email.payload.headers.find((h: any) => h.name === 'Subject')?.value;
      const threadId = email.threadId;
      const messageId = email.payload.headers.find((h: any) => h.name === 'Message-ID')?.value;

      await api.post('/emails/send', {
        to: toHeader,
        subject: subjectHeader.startsWith('Re:') ? subjectHeader : `Re: ${subjectHeader}`,
        body: replyDraft,
        threadId,
        messageId
      });
      alert('Reply sent successfully!');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!email) return <div className="p-8 text-center text-slate-500">Email not found</div>;

  const headers = email.payload?.headers || [];
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
  const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
  const dateStr = headers.find((h: any) => h.name === 'Date')?.value || '';

  const handleTrash = async () => {
    try {
      await api.post(`/emails/${id}/modify`, { addLabelIds: ['TRASH'], removeLabelIds: ['INBOX'] });
      alert('Moved to Trash');
      navigate('/');
    } catch (e) {
      alert('Failed to delete email');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 gap-4 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 truncate flex-1">{subject}</h1>
        <button 
          onClick={handleSpamCheck}
          disabled={loadingSpam}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-50"
          title="Scan for Phishing/Spam"
        >
          {loadingSpam ? <Loader2 size={20} className="animate-spin text-indigo-600" /> : <ShieldAlert size={20} />}
        </button>
        <button onClick={handleTrash} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </header>

      {/* Spam Alert Banner */}
      {spamStatus && (
        <div className={`px-8 py-3 flex items-center gap-3 font-medium shadow-sm z-20 ${spamStatus.isSpam ? 'bg-red-50 text-red-700 border-b border-red-200' : 'bg-green-50 text-green-700 border-b border-green-200'}`}>
          {spamStatus.isSpam ? <ShieldAlert size={22} className="text-red-600" /> : <ShieldCheck size={22} className="text-green-600" />}
          <div>
            <span className="font-bold">{spamStatus.isSpam ? 'WARNING! Potential Scam/Phishing Detected.' : 'SAFE: No Spam/Phishing Detected.'}</span>
            <span className="ml-2 opacity-90 font-normal">{spamStatus.reason}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Email Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-md">
                  {from.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-base sm:text-lg leading-tight truncate">{from}</h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-1">
                    <User size={14} /> to me
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full w-fit">
                <Clock size={14} />
                {new Date(dateStr).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="p-8 flex-1 overflow-y-auto">
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: getEmailBody() }}
            />
          </div>
        </div>

          {/* AI Sidebar */}
          <div className="w-full md:w-96 flex flex-col gap-6">
            {/* AI Summary Card */}
            <div className="bg-gradient-to-b from-indigo-50 to-white rounded-2xl shadow-sm border border-indigo-100 p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600" /> AI Summary
              </h3>
              
              {summary ? (
                <div className="bg-white p-4 rounded-xl border border-indigo-50 text-slate-700 text-sm leading-relaxed shadow-sm">
                  {summary}
                </div>
              ) : (
                <button 
                  onClick={handleSummarize}
                  disabled={loadingSummary}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {loadingSummary ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {loadingSummary ? 'Summarizing...' : 'Summarize Email'}
                </button>
              )}
            </div>

            {/* AI Action Items Card */}
            <div className="bg-gradient-to-b from-green-50 to-white rounded-2xl shadow-sm border border-green-100 p-6">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <CheckSquare size={20} className="text-green-600" /> Action Items
              </h3>
              
              {actionItems ? (
                <div className="bg-white p-4 rounded-xl border border-green-50 text-slate-700 text-sm leading-relaxed shadow-sm prose prose-sm max-w-none">
                  {/* Basic markdown rendering for bullet points */}
                  {actionItems.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line.replace(/^-\s*/, '• ')}</p>
                  ))}
                </div>
              ) : (
                <button 
                  onClick={handleExtractActions}
                  disabled={loadingActionItems}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md shadow-green-200 flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {loadingActionItems ? <Loader2 className="animate-spin" size={18} /> : <CheckSquare size={18} />}
                  {loadingActionItems ? 'Extracting...' : 'Find Action Items'}
                </button>
              )}
            </div>

          {/* AI Reply Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Send size={18} className="text-blue-600" /> Smart Reply
              </h3>
              {!replyDraft && (
                <select 
                  value={replyTone} 
                  onChange={(e) => setReplyTone(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Formal">Formal</option>
                  <option value="Concise">Concise</option>
                </select>
              )}
            </div>
            
            {!replyDraft ? (
              <button 
                onClick={handleGenerateReply}
                disabled={loadingReply}
                className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 py-3 px-4 rounded-xl font-medium transition-all flex justify-center items-center gap-2 disabled:opacity-70 mt-auto"
              >
                {loadingReply ? <Loader2 className="animate-spin" size={18} /> : 'Magic Draft'}
                {loadingReply ? 'Drafting...' : `Generate ${replyTone} Reply`}
              </button>
            ) : (
              <div className="flex flex-col h-full flex-1 gap-4">
                <textarea 
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  className="flex-1 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm text-slate-700 min-h-[200px]"
                />
                <button 
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {sendingReply ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
