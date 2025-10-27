import { useState } from 'react';
import { UserProfile } from './components/UserProfile';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <UserProfile />
      <Toaster />
    </div>
  );
}
