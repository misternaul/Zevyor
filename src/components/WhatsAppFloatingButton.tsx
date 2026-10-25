'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  whatsappNumber?: string;
}

export default function WhatsAppFloatingButton({
  whatsappNumber = '923000000000',
}: WhatsAppFloatingButtonProps) {
  const defaultMessage = encodeURIComponent(
    'Assalam-o-Alaikum Zevyor! I am browsing your online store and have an inquiry regarding your collections.'
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Direct WhatsApp Concierge"
      className="fixed bottom-6 right-6 z-30 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group"
    >
      <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
      <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">
        WhatsApp Concierge
      </span>
    </a>
  );
}
