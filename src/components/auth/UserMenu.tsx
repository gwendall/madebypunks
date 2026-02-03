'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnsName } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { PunkAvatar } from '@/components/PunkAvatar';
import type { DelegatedPunk } from '@/types/auth';

const MAX_DISPLAYED_PUNKS_PER_SECTION = 10;

interface PunkButtonProps {
  punkId: number;
  isSelected: boolean;
  onSelect: () => void;
  delegation?: DelegatedPunk | null;
}

function PunkButton({ punkId, isSelected, onSelect, delegation }: PunkButtonProps) {
  const tooltipText = delegation
    ? `Punk #${punkId} (delegated)`
    : `Punk #${punkId}${isSelected ? ' (selected)' : ''}`;

  return (
    <button
      onClick={onSelect}
      className={`relative transition-shadow ${
        isSelected
          ? 'ring-2 ring-punk-pink'
          : 'hover:ring-2 hover:ring-foreground/30'
      }`}
      title={tooltipText}
    >
      <PunkAvatar punkId={punkId} size={32} />
      {delegation && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-punk-pink" />
      )}
    </button>
  );
}

export function UserMenu() {
  const {
    wallet,
    ownedPunks,
    delegatedPunks,
    allPunkIds,
    preferredPunk,
    setPreferredPunk,
    disconnect,
  } = useAuth();
  const { data: ensName } = useEnsName({ address: wallet ?? undefined });
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!wallet || preferredPunk === null) {
    return null;
  }

  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const displayedOwnedPunks = ownedPunks.slice(0, MAX_DISPLAYED_PUNKS_PER_SECTION);
  const displayedDelegatedPunks = delegatedPunks.slice(0, MAX_DISPLAYED_PUNKS_PER_SECTION);
  const remainingOwned = ownedPunks.length - MAX_DISPLAYED_PUNKS_PER_SECTION;
  const remainingDelegated = delegatedPunks.length - MAX_DISPLAYED_PUNKS_PER_SECTION;
  const totalPunks = allPunkIds.length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:ring-2 hover:ring-punk-pink transition-shadow"
      >
        <PunkAvatar punkId={preferredPunk} size={36} />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-72 bg-background border-2 border-foreground/20 shadow-lg z-50"
          >
          {/* Header with ENS/wallet */}
          <div className="p-4 border-b border-foreground/10">
            <p className="font-pixel text-base uppercase tracking-wider">
              {ensName ? ensName : `Punk #${preferredPunk}`}
            </p>
            <p className="text-xs text-foreground/50 font-mono mt-1">
              {shortWallet}
            </p>
          </div>

          {/* Punks section */}
          <div className="p-4 border-b border-foreground/10 space-y-4">
            {/* Owned punks */}
            {ownedPunks.length > 0 && (
              <div>
                <p className="text-xs text-foreground/50 mb-2 uppercase tracking-wider">
                  Owned ({ownedPunks.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {displayedOwnedPunks.map((punkId) => (
                    <PunkButton
                      key={punkId}
                      punkId={punkId}
                      isSelected={punkId === preferredPunk}
                      onSelect={() => setPreferredPunk(punkId)}
                    />
                  ))}
                </div>
                {remainingOwned > 0 && (
                  <p className="mt-2 text-xs text-foreground/40">
                    +{remainingOwned} more
                  </p>
                )}
              </div>
            )}

            {/* Delegated punks */}
            {delegatedPunks.length > 0 && (
              <div>
                <p className="text-xs text-foreground/50 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  Delegated ({delegatedPunks.length})
                  <span className="w-2 h-2 bg-punk-pink" />
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {displayedDelegatedPunks.map((delegated) => (
                    <PunkButton
                      key={delegated.punkId}
                      punkId={delegated.punkId}
                      isSelected={delegated.punkId === preferredPunk}
                      onSelect={() => setPreferredPunk(delegated.punkId)}
                      delegation={delegated}
                    />
                  ))}
                </div>
                {remainingDelegated > 0 && (
                  <p className="mt-2 text-xs text-foreground/40">
                    +{remainingDelegated} more
                  </p>
                )}
              </div>
            )}

            {/* Link to cryptopunks.app */}
            {totalPunks > MAX_DISPLAYED_PUNKS_PER_SECTION && (
              <a
                href={`https://cryptopunks.app/cryptopunks/accountinfo?account=${wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-punk-blue hover:text-punk-pink transition-colors"
              >
                View all on cryptopunks.app →
              </a>
            )}
          </div>

          {/* Links */}
          <div className="p-2">
            <Link
              href={`/${preferredPunk}`}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-foreground/5 transition-colors"
            >
              View Profile
            </Link>
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-foreground/5 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
