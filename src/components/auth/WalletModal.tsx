'use client';

import { useEffect, useCallback, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect, useAccount, useDisconnect, useSignMessage, Connector } from 'wagmi';
import { IoClose, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { SiweMessage } from 'siwe';
import { useQueryClient } from '@tanstack/react-query';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'connect' | 'verify' | 'success' | 'error';

// Wallet icons (inline SVGs for common wallets)
const walletIcons: Record<string, string> = {
  metaMask: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSA4OC4zMTMgMTgwLjU2MyA4OC4zMTMgMTcxIDkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAgMTA2LjMxMyAxODcuODc1IDg5LjQzOCAxODcuODc1IDY4LjYyNSAxNzguODc1Ii8+PHBvbHlnb24gZmlsbD0iI0NEQkRCMiIgcG9pbnRzPSIxMDUuNzUgMTczLjI1IDEzMi43NSAxODAuNTYzIDEzMi43NSAxNzEgMTM1IDE2OC43NSAxNTAuNzUgMTY4Ljc1IDE1MC43NSAxODAgMTUwLjc1IDE4Ny44NzUgMTMzLjg3NSAxODcuODc1IDExMy4wNjMgMTc4Ljg3NSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjU2LjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzEgOTEuMTI1IDE2OC43NSAxMjAuMzc1IDE2OC43NSAxMjMuNzUgMTcxIDEyMS41IDE1Mi40MzggMTE3IDE0OS42MjUgOTQuNSAxNTAuMTg4Ii8+PHBvbHlnb24gZmlsbD0iI0Y4OUMzNSIgcG9pbnRzPSI3NS4zNzUgMjcgODguODc1IDU4LjUgOTUuMDYzIDE1MC4xODggMTE3IDE1MC4xODggMTIzLjc1IDU4LjUgMTM2LjEyNSAyNyIvPjxwb2x5Z29uIGZpbGw9IiNGODlEMzUiIHBvaW50cz0iMTYuMzEzIDk2LjE4OCAuNTYzIDE0MS43NSAzOS45MzggMTM5LjUgNjUuMjUgMTM5LjUgNjUuMjUgMTE5LjgxMyA2NC4xMjUgNzkuMzEzIDU4LjUgODMuODEzIi8+PHBvbHlnb24gZmlsbD0iI0Q4N0MzMCIgcG9pbnRzPSI0Ni4xMjUgMTAxLjI1IDkyLjI1IDEwMi4zNzUgODcuMTg4IDEyNiA2NS4yNSAxMjAuMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VBOEQzQSIgcG9pbnRzPSI0Ni4xMjUgMTAxLjgxMyA2NS4yNSAxMTkuODEzIDY1LjI1IDEzNy44MTMiLz48cG9seWdvbiBmaWxsPSIjRjg5RDM1IiBwb2ludHM9IjY1LjI1IDEyMC4zNzUgODcuNzUgMTI2IDk1LjA2MyAxNTAuMTg4IDkwIDE1MyA2NS4yNSAxMzguMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VCOEYzNSIgcG9pbnRzPSI2NS4yNSAxMzguMzc1IDYwLjc1IDE3My4yNSA5MC41NjMgMTUyLjQzOCIvPjxwb2x5Z29uIGZpbGw9IiNFQThFM0EiIHBvaW50cz0iOTIuMjUgMTAyLjM3NSA5NS4wNjMgMTUwLjE4OCA4Ni42MjUgMTI1LjcxOSIvPjxwb2x5Z29uIGZpbGw9IiNEODdDMzAiIHBvaW50cz0iMzkuMzc1IDEzOC45MzggNjUuMjUgMTM4LjM3NSA2MC43NSAxNzMuMjUiLz48cG9seWdvbiBmaWxsPSIjRUI4RjM1IiBwb2ludHM9IjEyLjkzOCAxODguNDM4IDYwLjc1IDE3My4yNSAzOS4zNzUgMTM4LjkzOCAuNTYzIDE0MS43NSIvPjxwb2x5Z29uIGZpbGw9IiNFODgyMUUiIHBvaW50cz0iODguODc1IDU4LjUgNjQuNjg4IDc4Ljc1IDQ2LjEyNSAxMDEuMjUgOTIuMjUgMTAyLjkzOCIvPjxwb2x5Z29uIGZpbGw9IiNERkNFQzMiIHBvaW50cz0iNjAuNzUgMTczLjI1IDkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzAuNDM4IDg4LjMxMyAxODAuNTYzIDY4LjA2MyAxNzYuNjI1Ii8+PHBvbHlnb24gZmlsbD0iI0RGQ0VDMyIgcG9pbnRzPSIxMjEuNSAxNzMuMjUgMTUwLjc1IDE1Mi40MzggMTQ4LjUgMTcwLjQzOCAxNDguNSAxODAuNTYzIDEyOC4yNSAxNzYuNjI1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyNzIuMjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjcwLjMxMyAxMTIuNSA2NC4xMjUgMTI1LjQzOCA4Ni4wNjMgMTE5LjgxMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMTUwLjE4OCAwKSIvPjxwb2x5Z29uIGZpbGw9IiNFODhGMzUiIHBvaW50cz0iMTIuMzc1IC41NjMgODguODc1IDU4LjUgNzUuOTM4IDI3Ii8+PHBvbHlnb24gZmlsbD0iIzhFNUEzMCIgcG9pbnRzPSIxMi4zNzUgLjU2MyAyLjI1IDMxLjUgNy44NzUgODkuNDM4IDEuMzEzIDk0LjUgMTAuMTI1IDEwMS4yNSA0LjUgMTA1Ljc1IDEzLjUgMTE0LjU2MyA4LjQzOCAxMjAuMzc1IDE2LjMxMyA5Ni4xODggNTguNSA4My44MTMgNjQuNjg4IDc4Ljc1IDg4Ljg3NSA1OC41Ii8+PHBvbHlnb24gZmlsbD0iI0Y4OUQzNSIgcG9pbnRzPSIxOTUuMTg4IDk2LjE4OCAyMTAuOTM4IDE0MS43NSAxNzEuNTYzIDEzOS41IDE0Ni4yNSAxMzkuNSAxNDYuMjUgMTE5LjgxMyAxNDcuMzc1IDc5LjMxMyAxNTMgODMuODEzIi8+PHBvbHlnb24gZmlsbD0iI0Q4N0MzMCIgcG9pbnRzPSIxNjUuMzc1IDEwMS4yNSAxMTkuMjUgMTAyLjM3NSAxMjQuMzEzIDEyNiAxNDYuMjUgMTIwLjM3NSIvPjxwb2x5Z29uIGZpbGw9IiNFQThEM0EiIHBvaW50cz0iMTY1LjM3NSAxMDEuODEzIDE0Ni4yNSAxMTkuODEzIDE0Ni4yNSAxMzcuODEzIi8+PHBvbHlnb24gZmlsbD0iI0Y4OUQzNSIgcG9pbnRzPSIxNDYuMjUgMTIwLjM3NSAxMjMuNzUgMTI2IDExNi40MzggMTUwLjE4OCAxMjEuNSAxNTMgMTQ2LjI1IDEzOC4zNzUiLz48cG9seWdvbiBmaWxsPSIjRUI4RjM1IiBwb2ludHM9IjE0Ni4yNSAxMzguMzc1IDE1MC43NSAxNzMuMjUgMTIwLjkzOCAxNTIuNDM4Ii8+PHBvbHlnb24gZmlsbD0iI0VBOEUzQSIgcG9pbnRzPSIxMTkuMjUgMTAyLjM3NSAxMTYuNDM4IDE1MC4xODggMTI0Ljg3NSAxMjUuNzE5Ii8+PHBvbHlnb24gZmlsbD0iI0Q4N0MzMCIgcG9pbnRzPSIxNzIuMTI1IDEzOC45MzggMTQ2LjI1IDEzOC4zNzUgMTUwLjc1IDE3My4yNSIvPjxwb2x5Z29uIGZpbGw9IiNFQjhGMzUiIHBvaW50cz0iMTk4LjU2MyAxODguNDM4IDE1MC43NSAxNzMuMjUgMTcyLjEyNSAxMzguOTM4IDIxMC45MzggMTQxLjc1Ii8+PHBvbHlnb24gZmlsbD0iI0U4ODIxRSIgcG9pbnRzPSIxMjIuNjI1IDU4LjUgMTQ2LjgxMyA3OC43NSAxNjUuMzc1IDEwMS4yNSAxMTkuMjUgMTAyLjkzOCIvPjxwb2x5Z29uIGZpbGw9IiMzOTM5MzkiIHBvaW50cz0iMTQxLjE4OCAxMTIuNSAxNDcuMzc1IDEyNS40MzggMTI1LjQzOCAxMTkuODEzIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyNzIuNjI1IDApIi8+PHBvbHlnb24gZmlsbD0iI0U4OEYzNSIgcG9pbnRzPSIxOTkuMTI1IC41NjMgMTIyLjYyNSA1OC41IDEzNS41NjMgMjciLz48cG9seWdvbiBmaWxsPSIjOEU1QTMwIiBwb2ludHM9IjE5OS4xMjUgLjU2MyAyMDkuMjUgMzEuNSAyMDMuNjI1IDg5LjQzOCAyMTAuMTg4IDk0LjUgMjAxLjM3NSAxMDEuMjUgMjA3IDEwNS43NSAxOTggMTE0LjU2MyAyMDMuMDYzIDEyMC4zNzUgMTk1LjE4OCA5Ni4xODggMTUzIDgzLjgxMyAxNDYuODEzIDc4Ljc1IDEyMi42MjUgNTguNSIvPjwvZz48L3N2Zz4=',
  coinbaseWallet: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4IDU2YzE1LjQ2NCAwIDI4LTEyLjUzNiAyOC0yOFM0My40NjQgMCAyOCAwIDAgMTIuNTM2IDAgMjhzMTIuNTM2IDI4IDI4IDI4WiIgZmlsbD0iIzAwNTJGRiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNyAyOGMwIDExLjU5OCA5LjQwMiAyMSAyMSAyMXMyMS05LjQwMiAyMS0yMVM0MC41OTggNyAyOCA3IDcgMTYuNDAyIDcgMjhabTE3LjIzNC02LjQ2NmEzLjEgMy4xIDAgMCAwLTMuMS0zLjFoLTUuMjEyYTMuMSAzLjEgMCAwIDAtMy4xIDMuMXYxMi45MzJhMy4xIDMuMSAwIDAgMCAzLjEgMy4xaDUuMjEyYTMuMSAzLjEgMCAwIDAgMy4xLTMuMVYyMS41MzRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  walletConnect: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iMjgiIGZpbGw9IiMzQjk5RkMiLz48cGF0aCBkPSJNMTcuNDIgMjEuNWM1Ljg0LTUuNzIgMTUuMzItNS43MiAyMS4xNiAwbC43LjY5YS43Mi43MiAwIDAgMSAwIDEuMDRsLTIuNCAyLjM1YS4zOC4zOCAwIDAgMS0uNTMgMGwtLjk3LS45NWMtNC4wNy0zLjk5LTEwLjY4LTMuOTktMTQuNzYgMGwtMS4wNCAxLjAxYS4zOC4zOCAwIDAgMS0uNTMgMGwtMi40LTIuMzVhLjcyLjcyIDAgMCAxIDAtMS4wNGwuNzctLjc1Wm0yNi4xMyA0Ljg3IDIuMTQgMi4wOWEuNzIuNzIgMCAwIDEgMCAxLjA0bC05LjY0IDkuNDRhLjc2Ljc2IDAgMCAxLTEuMDYgMGwtNi44NC02LjdhLjE5LjE5IDAgMCAwLS4yNyAwbC02Ljg0IDYuN2EuNzYuNzYgMCAwIDEtMS4wNiAwbC05LjY0LTkuNDRhLjcyLjcyIDAgMCAxIDAtMS4wNGwyLjE0LTIuMWEuNzYuNzYgMCAwIDEgMS4wNiAwbDYuODQgNi43Yy4wOC4wNy4yLjA3LjI3IDBsNi44NC02LjdhLjc2Ljc2IDAgMCAxIDEuMDYgMGw2Ljg0IDYuN2MuMDguMDcuMTkuMDcuMjcgMGw2Ljg0LTYuN2EuNzYuNzYgMCAwIDEgMS4wNSAwWiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
  injected: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iOCIgZmlsbD0iIzFBMUExQSIvPjxwYXRoIGQ9Ik0yOCA0NGMtOC44NCAwLTE2LTcuMTYtMTYtMTZzNy4xNi0xNiAxNi0xNiAxNiA3LjE2IDE2IDE2LTcuMTYgMTYtMTYgMTZabTAtMjljLTcuMTggMC0xMyA1LjgyLTEzIDEzczUuODIgMTMgMTMgMTMgMTMtNS44MiAxMy0xMy01LjgyLTEzLTEzLTEzWiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
};

function getWalletIcon(connector: Connector): string {
  const id = connector.id.toLowerCase();
  if (id.includes('metamask')) return walletIcons.metaMask;
  if (id.includes('coinbase')) return walletIcons.coinbaseWallet;
  if (id.includes('walletconnect')) return walletIcons.walletConnect;
  return walletIcons.injected;
}

function getWalletName(connector: Connector): string {
  if (connector.name === 'Injected') return 'Browser Wallet';
  return connector.name;
}

function ModalContent({ isOpen, onClose }: WalletModalProps) {
  const queryClient = useQueryClient();
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [step, setStep] = useState<Step>('connect');
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [punkCount, setPunkCount] = useState<number>(0);
  const [isGoingBack, setIsGoingBack] = useState(false);

  // Auto-advance to verify step when connected (but not when going back)
  useEffect(() => {
    if (isConnected && step === 'connect' && !isGoingBack) {
      setStep('verify');
    }
    // Reset the going back flag once disconnected
    if (!isConnected && isGoingBack) {
      setIsGoingBack(false);
    }
  }, [isConnected, step, isGoingBack]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to let animation complete
      const timer = setTimeout(() => {
        setStep('connect');
        setVerifyError(null);
        setPunkCount(0);
        setIsGoingBack(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('modal-open');
      return () => {
        document.documentElement.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  const handleConnect = useCallback(
    (connector: Connector) => {
      setPendingConnectorId(connector.uid);
      connect(
        { connector },
        {
          onSettled: () => setPendingConnectorId(null),
        }
      );
    },
    [connect]
  );

  const handleVerify = useCallback(async () => {
    if (!address) return;

    setIsVerifying(true);
    setVerifyError(null);

    try {
      // 1. Get nonce
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Made by Punks',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      });

      const messageString = message.prepareMessage();

      // 3. Sign message
      const signature = await signMessageAsync({ message: messageString });

      // 4. Verify with backend
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageString, signature }),
      });

      if (!loginRes.ok) {
        const error = await loginRes.json();
        throw new Error(error.message || error.error || 'Verification failed');
      }

      const data = await loginRes.json();
      const totalPunks = (data.ownedPunks?.length ?? 0) + (data.delegatedPunks?.length ?? 0);
      setPunkCount(totalPunks);

      // Invalidate auth query to refresh state
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      // Show success briefly then close
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      // Check if user rejected the signature
      if (message.includes('User rejected') || message.includes('user rejected')) {
        setVerifyError('Signature cancelled');
      } else {
        setVerifyError(message);
        setStep('error');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [address, signMessageAsync, queryClient, onClose]);

  const handleBack = useCallback(() => {
    setIsGoingBack(true);
    disconnect();
    setStep('connect');
    setVerifyError(null);
  }, [disconnect]);

  const handleRetry = useCallback(() => {
    setVerifyError(null);
    setStep('verify');
  }, []);

  // Filter out duplicate connectors
  const uniqueConnectors = connectors.reduce((acc, connector) => {
    const exists = acc.find(c => c.name === connector.name);
    if (!exists) acc.push(connector);
    return acc;
  }, [] as Connector[]);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const getTitle = () => {
    switch (step) {
      case 'connect':
        return 'Connect Wallet';
      case 'verify':
        return 'Verify Ownership';
      case 'success':
        return 'Welcome!';
      case 'error':
        return 'Verification Failed';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="bg-background border-2 border-foreground/15 shadow-[6px_6px_0_0_rgba(0,0,0,0.25)]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="flex gap-1">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        step === 'connect' ? 'bg-punk-blue' : 'bg-punk-blue/30'
                      }`}
                    />
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        step === 'verify' || step === 'success' ? 'bg-punk-blue' : 'bg-punk-blue/30'
                      }`}
                    />
                  </div>
                  <h2 className="font-pixel text-lg uppercase tracking-wider">
                    {getTitle()}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-foreground/10 transition-colors"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {/* Step 1: Connect wallet */}
                {step === 'connect' && (
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="p-2">
                      {uniqueConnectors.map((connector) => (
                        <motion.button
                          key={connector.uid}
                          onClick={() => handleConnect(connector)}
                          disabled={isConnecting}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 transition-colors disabled:opacity-50"
                        >
                          <img
                            src={connector.icon || getWalletIcon(connector)}
                            alt={connector.name}
                            className="w-10 h-10 rounded"
                          />
                          <div className="flex-1 text-left">
                            <p className="font-medium">{getWalletName(connector)}</p>
                            {connector.id === 'injected' && (
                              <p className="text-xs text-foreground/50">
                                Detected in browser
                              </p>
                            )}
                          </div>
                          {isConnecting && pendingConnectorId === connector.uid && (
                            <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Error message */}
                    {connectError && (
                      <div className="px-4 pb-4">
                        <p className="text-red-500 text-sm">{connectError.message}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Verify ownership */}
                {step === 'verify' && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="p-4"
                  >
                    <div className="text-center space-y-4">
                      <p className="text-foreground/70">
                        Connected as{' '}
                        <span className="font-mono text-foreground">{shortAddress}</span>
                      </p>

                      <p className="text-sm text-foreground/50">
                        Sign a message to verify you own a CryptoPunk.
                        This is free and doesn&apos;t cost any gas.
                      </p>

                      {verifyError && (
                        <p className="text-red-500 text-sm">{verifyError}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={handleBack}
                          className="flex-1 px-4 py-3 border border-foreground/20 text-sm hover:bg-foreground/5 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleVerify}
                          disabled={isVerifying}
                          className="flex-1 px-4 py-3 bg-punk-blue text-white font-pixel text-sm uppercase tracking-wider hover:bg-punk-pink transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isVerifying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Signing...
                            </>
                          ) : (
                            'Verify Punk'
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Success state */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="p-8 text-center"
                  >
                    <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="font-pixel text-lg">
                      {punkCount} Punk{punkCount !== 1 ? 's' : ''} found!
                    </p>
                  </motion.div>
                )}

                {/* Error state */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 text-center space-y-4"
                  >
                    <IoWarning className="w-12 h-12 text-yellow-500 mx-auto" />
                    <div>
                      <p className="font-medium mb-1">No Punks Found</p>
                      <p className="text-sm text-foreground/50">
                        {verifyError || 'We couldn\'t find any CryptoPunks in your wallet or delegated wallets.'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        className="flex-1 px-4 py-3 border border-foreground/20 text-sm hover:bg-foreground/5 transition-colors"
                      >
                        Try another wallet
                      </button>
                      <button
                        onClick={handleRetry}
                        className="flex-1 px-4 py-3 bg-punk-blue text-white text-sm hover:bg-punk-pink transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer - show on all steps except success */}
              {step !== 'success' && (
                <div className="p-4 border-t border-foreground/10 space-y-2">
                  <p className="text-xs text-foreground/50 text-center">
                    We only verify that you own a Punk - no data is stored.
                  </p>
                  <p className="text-xs text-foreground/50 text-center">
                    Supports{' '}
                    <a
                      href="https://delegate.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-punk-blue hover:text-punk-pink underline"
                    >
                      delegated wallets
                    </a>
                    {' '}for vault security.
                  </p>
                  <p className="text-xs text-foreground/50 text-center">
                    <a
                      href="https://github.com/gwendall/madebypunks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-punk-blue hover:text-punk-pink underline"
                    >
                      100% open source
                    </a>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// SSR-safe hook to check if we're on the client
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const isClient = useIsClient();

  // Don't render on server
  if (!isClient) return null;

  // Render via portal to document.body
  return createPortal(
    <ModalContent isOpen={isOpen} onClose={onClose} />,
    document.body
  );
}
