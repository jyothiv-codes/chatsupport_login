'use client';

import { Box, Button, Stack, TextField, Tooltip, IconButton } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import Header from './components/Header'; // Adjust import path as needed
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Import the icon

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Add state for email

  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = () => {
      const user = sessionStorage.getItem('user');
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user); // Set the email
      }
    };

    checkLoginStatus();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor="white"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" padding={2}>
        {!isLoggedIn && <Header />}
        {isLoggedIn && (
          <Tooltip title={userEmail} arrow>
            <IconButton sx={{ ml: 'auto' }}>
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Stack
        direction="column"
        width="100%"
        height="calc(100% - 64px)"
        maxWidth="600px"
        margin="0 auto"
        spacing={2}
        padding={2}
        overflow="hidden"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          height="100%"
          bgcolor="white" // Set inside of the box to white
          borderRadius={4}
          padding={2}
          boxShadow={1}
          border={1} // Add border property
          borderColor="grey.500" // Set border color to grey
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color="white"
                  borderRadius={16}
                  padding={2}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" marginTop={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button 
              variant="contained" 
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
