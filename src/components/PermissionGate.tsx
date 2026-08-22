'use client';

import React from 'react';
import { useMessCalculations } from '@/store/useMessStore';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOwner?: boolean;
  hideIfNoAccess?: boolean;
  tooltipText?: string;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback,
  requireOwner = false,
  hideIfNoAccess = false,
  tooltipText = 'শুধুমাত্র ম্যানেজার এন্ট্রি ও এডিট করতে পারবেন',
}) => {
  const { isManagerOrCoManager, isOwnerManager } = useMessCalculations();

  const hasAccess = requireOwner ? isOwnerManager : isManagerOrCoManager;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (hideIfNoAccess) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Render disabled wrapper with informative tooltip
  return (
    <div
      className="relative group cursor-not-allowed opacity-50 select-none pointer-events-none"
      title={tooltipText}
    >
      {children}
    </div>
  );
};
