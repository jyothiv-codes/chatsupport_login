'use client';

import { Box, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for App Router

export default function Header() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/sign-in'); // Adjust the path if needed
  };

  const handleSignUp = () => {
    router.push('/sign-up'); // Adjust the path if you have a sign-up page
  };

  return (
    <Box
      width="100%"
      bgcolor="primary.main"
      color="white"
      p={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack direction="row" spacing={2}>
        <Button color="inherit" onClick={handleLogin}>
          Login
        </Button>
        <Button color="inherit" onClick={handleSignUp}>
          Sign Up
        </Button>
      </Stack>
    </Box>
  );
}
