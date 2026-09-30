import { Outlet } from 'react-router-dom';
import Header from '../shared/components/Header';
import ChatbotWidget from '../features/chatbot/components/ChatbotWidget';

const RootLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <ChatbotWidget />
    </>
  );
};

export default RootLayout;
