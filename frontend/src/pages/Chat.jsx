import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiOutlinePaperClip, HiOutlineVideoCamera, HiOutlineDotsVertical, HiOutlineArrowLeft } from 'react-icons/hi';
import api from '../services/api';
import socketService from '../services/socketService';
import useAuthStore from '../store/authStore';

const Chat = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    fetchConsultation();
    fetchMessages();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketService.leaveRoom(consultationId);
        socketRef.current.off('new_message');
        socketRef.current.off('user_status');
        socketRef.current.off('incoming_call');
        socketRef.current.off('user_typing');
      }
    };
  }, [consultationId]);

  const setupSocket = () => {
    const socket = socketService.connect(token);
    socketRef.current = socket;

    socketService.joinRoom(consultationId);

    socket.on('new_message', (message) => {
      console.log('📩 [CHAT] Incoming message event:', message._id);
      
      const msgConsultationId = (message.consultation?._id || message.consultation)?.toString();
      const currentId = consultationId?.toString();

      if (msgConsultationId === currentId) {
        setMessages((prev) => {
          const msgId = message._id?.toString();
          const senderId = (message.sender?._id || message.sender)?.toString();

          const exists = prev.some(m => {
            const mId = m._id?.toString();
            const mSenderId = (m.sender?._id || m.sender)?.toString();
            return mId === msgId || 
                   (m.status === 'pending' && m.content === message.content && mSenderId === senderId);
          });
          
          if (exists) {
            return prev.map(m => {
              const mId = m._id?.toString();
              const mSenderId = (m.sender?._id || m.sender)?.toString();
              if (mId === msgId || (m.status === 'pending' && m.content === message.content && mSenderId === senderId)) {
                return { ...message, status: 'sent' };
              }
              return m;
            });
          }
          
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 50);
      }
    });

    socket.on('user_status', (data) => {
      const partner = user.role === 'client' ? consultation?.lawyer : consultation?.client;
      if (data.userId?.toString() === partner?._id?.toString() || data.userId === partner) {
        setPartnerStatus(data.isOnline);
      }
    });

    socket.on('user_typing', (data) => {
      if (data.userId?.toString() !== user.id?.toString()) {
        setPartnerTyping(data.isTyping);
      }
    });

    socket.on('incoming_call', (data) => {
      toast((t) => (
        <span>
          Incoming {data.callType} call from {data.callerName}...
          <button onClick={() => { toast.dismiss(t.id); navigate(`/video-call/${consultationId}`); }} className="ml-4 bg-green-500 text-white px-3 py-1 rounded">Accept</button>
        </span>
      ), { duration: 10000 });
    });
  };

  const fetchConsultation = async () => {
    try {
      const res = await api.get(`/consultations/${consultationId}`);
      const consult = res.data.consultation;
      setConsultation(consult);
      
      // Set initial partner status
      const partner = user.role === 'client' ? consult.lawyer : consult.client;
      setPartnerStatus(partner.isOnline);
    } catch (err) {
      toast.error('Failed to load chat');
      navigate('/dashboard');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${consultationId}`);
      setMessages(res.data.messages);
      console.log('📚 [CHAT] Fetched', res.data.messages.length, 'messages');
      setTimeout(scrollToBottom, 200);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Not connected to chat server');
      return;
    }

    if (!consultation || !user) {
      console.warn('❌ [CHAT] Cannot send: Consultation or User data missing');
      return;
    }

    const partnerId = user.role === 'client' ? consultation.lawyer?._id : consultation.client?._id;
    if (!partnerId) {
      console.error('❌ [CHAT] Partner ID not found:', consultation);
      return;
    }

    const content = newMessage;

    // Optimistic Update
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      content,
      sender: { _id: user.id || user._id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('📤 [CHAT] Sending message optimistically:', tempId);
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    socketRef.current.emit('send_message', {
      consultationId,
      receiverId: partnerId,
      content,
      messageType: 'text'
    });

    setNewMessage('');
    socketRef.current.emit('typing', { consultationId, isTyping: false });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current) return;

    socketRef.current.emit('typing', { 
      consultationId, 
      isTyping: e.target.value.length > 0 
    });
  };

  const startVideoCall = () => {
    navigate(`/video-call/${consultationId}`);
  };

  if (!consultation) return null;

  const partner = user.role === 'client' ? consultation.lawyer : consultation.client;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col pt-24 md:pt-28 md:p-6 pb-0">
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-6 bg-white md:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 mb-6 h-[calc(100vh-140px)]">
        
        {/* Chat Main Area */}
        <div className="flex-grow flex flex-col h-full relative">
          
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between glass sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="md:hidden text-slate-500">
                <HiOutlineArrowLeft className="w-6 h-6" />
              </button>
              <div className="relative">
                <img src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                {partnerStatus && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{partner.name}</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {partnerTyping ? (
                    <span className="text-primary-600 font-bold animate-pulse italic">typing...</span>
                  ) : (
                    <>{partnerStatus ? 'Online' : 'Offline'} • {user.role === 'client' ? 'Solicitor' : 'Client'}</>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={startVideoCall}
                className="p-3 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                title="Start Video Call"
              >
                <HiOutlineVideoCamera className="w-6 h-6" />
              </button>
              <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                <HiOutlineDotsVertical className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/30">
            {messages.map((msg, i) => {
              const isMe = msg.sender._id === user.id;
              return (
                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                    isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-2 font-bold ${isMe ? 'text-primary-200' : 'text-slate-400'} uppercase tracking-widest`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <button type="button" className="p-3 text-slate-400 hover:text-primary-600 transition-colors">
                <HiOutlinePaperClip className="w-6 h-6" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message here..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-primary-600 text-white p-4 rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:bg-slate-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar (Desktop Only) */}
        <div className="hidden lg:flex w-80 border-l border-slate-100 flex-col bg-slate-50/10">
          <div className="p-8 text-center border-b border-slate-100">
            <img src={partner.avatar || 'https://via.placeholder.com/100'} className="w-24 h-24 rounded-3xl object-cover mx-auto mb-4 border-4 border-white shadow-xl" alt="" />
            <h4 className="font-bold text-lg">{partner.name}</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Consultation Session</p>
          </div>
          
          <div className="p-8 space-y-8 overflow-y-auto">
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Case Details</h5>
              <div className="bg-white p-4 rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-100 shadow-sm">
                {consultation.problemDescription}
              </div>
            </div>
            
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h5>
              <div className="space-y-3">
                <button className="w-full text-left p-4 rounded-xl text-sm font-bold bg-white border border-slate-100 hover:bg-slate-50 transition-all">View Documents</button>
                <button className="w-full text-left p-4 rounded-xl text-sm font-bold bg-white border border-slate-100 hover:bg-slate-50 transition-all">Booking History</button>
                <button className="w-full text-left p-4 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">End Session</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Chat;
