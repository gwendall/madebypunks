'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { UserMenu } from './UserMenu';
import { WalletModal } from './WalletModal';

export function AuthButton() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-20 h-9 bg-foreground/10 animate-pulse" />
    );
  }

  // Authenticated - show user menu
  if (isAuthenticated) {
    return <UserMenu />;
  }

  // Not authenticated - show connect button
  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="primary"
        size="sm"
      >
        Connect
      </Button>
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
