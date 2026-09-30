import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, X, Send, Eraser, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import './ChatbotWidget.css';
import { getAccessToken } from '../../../shared/utils/authToken';
import { selectIsAuthenticated } from '../../auth/slice';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const BASE_URL = import.meta.env.DEV
    ? '/api/v1'
    : (import.meta.env.VITE_API_URL || '/api/v1');

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const closeTimerRef = useRef(null);
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
    const [isPackageLimitAlertOpen, setIsPackageLimitAlertOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Khởi tạo session khi component render hoặc khi bấm clear
    const initSession = async () => {
        try {
            const token = getAccessToken();
            const response = await fetch(`${BASE_URL}/chatbot/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                // Body có thể trống theo mô tả
                body: JSON.stringify({}),
            });

            if (response.ok) {
                const data = await response.json();
                setSessionId(data.id);
                setMessages([
                    {
                        id: 'welcome',
                        role: 'bot',
                        content: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
                    },
                ]);

                // Nếu muốn load lại tin nhắn cũ (Option 3), gọi ở đây nếu lấy sessionId từ localStorage
            }
        } catch (error) {
            console.error('Lỗi khi khởi tạo session chatbot:', error);
        }
    };

    // Khởi tạo session khi mở chatbot
    useEffect(() => {
        if (isOpen && !sessionId && isAuthenticated) {
            initSession();
        }
    }, [isOpen, sessionId, isAuthenticated]);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    const handleOpen = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setIsClosing(false);
        setIsOpen(true);
    };

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        closeTimerRef.current = setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            closeTimerRef.current = null;
        }, 180);
    };

    const handleClear = () => {
        setSessionId(null);
        setMessages([]);
        initSession();
    };

    // Hàm regex để dọn dẹp các mảng text của Function Calling bị leak từ Backend
    const cleanBotMessage = (text) => {
        if (!text) return '';
        return text.replace(/\(function=[a-zA-Z_0-9]+>[\s\S]*?<\/function>/gi, '').trim();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !sessionId || isLoading) return;

        const userMsg = inputValue.trim();
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const token = getAccessToken();
            const response = await fetch(`${BASE_URL}/chatbot/sessions/${sessionId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ content: userMsg }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: 'bot',
                        content: cleanBotMessage(data.content) || 'Xin lỗi, tôi không thể trả lời lúc này.',
                        rooms: data.rooms_data || []
                    },
                ]);
            } else if (response.status === 402) {
                setIsPackageLimitAlertOpen(true);
            } else {
                throw new Error('Lỗi từ server');
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* Nút Toggle */}
            {!isOpen && (
                <button className="chatbot-toggle-btn" onClick={() => {
                    if (!isAuthenticated) {
                        setIsLoginAlertOpen(true);
                        return;
                    }
                    setIsOpen(true);
                }}>
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Cửa sổ Chat */}
            {(isOpen || isClosing) && (
                <div className={`chatbot-window ${isClosing ? 'is-closing' : ''}`}>
                    {/* Header */}
                    <div className="chatbot-header">
                        <h3>
                            <Bot size={20} /> Roomie AI
                        </h3>
                        <div className="chatbot-header-actions">
                            <button
                                className="chatbot-action-btn"
                                onClick={handleClear}
                                title="Tạo phiên mới"
                            >
                                <Eraser size={18} />
                            </button>
                            <button
                                className="chatbot-action-btn"
                                onClick={handleClose}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Danh sách tin nhắn */}
                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chatbot-message ${msg.role}`}>
                                {msg.role === 'bot' ? (
                                    <>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        {msg.rooms && msg.rooms.length > 0 && (
                                            <div className="chatbot-room-cards">
                                                {msg.rooms.map(room => (
                                                    <div
                                                        key={room.id}
                                                        className="chatbot-room-thumbnail"
                                                        onClick={() => {
                                                            handleClose();
                                                            navigate(`/rooms/${room.id}`);
                                                        }}
                                                    >
                                                        <img src={room.thumbnail} alt={room.title} />
                                                        <div className="thumbnail-info">
                                                            <h4>{room.title}</h4>
                                                            <p className="price">{room.price.toLocaleString()} VNĐ/tháng</p>
                                                            <p className="address">{room.address}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message bot">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form className="chatbot-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputValue.trim() || isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={isLoginAlertOpen}
                title="Yêu cầu đăng nhập"
                message="Vui lòng đăng nhập để sử dụng tính năng Chatbot AI!"
                confirmText="Đăng nhập ngay"
                cancelText="Đóng"
                onConfirm={() => {
                    setIsLoginAlertOpen(false);
                    navigate('/login');
                }}
                onCancel={() => setIsLoginAlertOpen(false)}
                type="alert"
            />

            <ConfirmModal
                isOpen={isPackageLimitAlertOpen}
                title="Hết lượt sử dụng"
                message="Bạn đã hết lượt sử dụng Chatbot AI. Vui lòng nâng cấp gói dịch vụ để tiếp tục."
                confirmText="Xem gói dịch vụ"
                cancelText="Đóng"
                onConfirm={() => {
                    setIsPackageLimitAlertOpen(false);
                    const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; } })();
                    const benefitsPath = user?.account_type === 'landlord' ? '/landlord/package-management' : '/user/package-management';
                    navigate(benefitsPath);
                }}
                onCancel={() => setIsPackageLimitAlertOpen(false)}
                type="alert"
            />
        </div>
    );
};

export default ChatbotWidget;
