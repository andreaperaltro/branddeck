'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, Pile } from '@/lib/types';
import { useDeckStore } from '@/store/useDeckStore';

interface CardProps {
  card: CardType;
  pile: Pile;
  isDragDisabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, pile, isDragDisabled = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { language, moveCard, deleteCard, bringCardBackToCenter } = useDeckStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '1') {
      e.preventDefault();
      moveCard(card.id, 'YOU_ARE');
    } else if (e.key === '2') {
      e.preventDefault();
      moveCard(card.id, 'YOU_ARE_NOT');
    } else if (e.key === '3') {
      e.preventDefault();
      moveCard(card.id, 'INDECISIVE');
    } else if (e.key === '4') {
      e.preventDefault();
      moveCard(card.id, 'DOES_NOT_APPLY');
    } else if (e.key === '0') {
      e.preventDefault();
      moveCard(card.id, 'UNSORTED');
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (pile !== 'UNSORTED') {
        bringCardBackToCenter(card.id);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteCard(card.id);
    }
  };

  const displayText = language === 'en' ? card.text_en : card.text_it;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-3 mb-2 rounded-lg border-2 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-md
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${card.isOpposite 
          ? 'bg-black text-white border-gray-600' 
          : 'bg-white text-black border-gray-300'
        }
      `}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="button"
      aria-label={`Card: ${displayText}. Press 1-4 to move to different piles, 0 for unsorted, or Delete to remove.`}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium flex-1">
          {displayText}
        </span>
        <div className="flex gap-1 ml-2">
          {/* Bring back to center button - only show if not in unsorted pile */}
          {pile !== 'UNSORTED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                bringCardBackToCenter(card.id);
              }}
              className={`transition-colors ${
                card.isOpposite 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
              aria-label={`Bring ${displayText} back to center`}
              title="Bring back to center with opposite word"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCard(card.id);
            }}
            className={`transition-colors ${
              card.isOpposite 
                ? 'text-gray-300 hover:text-red-400' 
                : 'text-gray-400 hover:text-red-500'
            }`}
            aria-label={`Delete card: ${displayText}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Keyboard shortcuts hint when focused */}
      {isFocused && (
        <div className={`mt-2 text-xs ${
          card.isOpposite ? 'text-gray-300' : 'text-gray-500'
        }`}>
          <div className="flex flex-wrap gap-1">
            <span className={`px-1 py-0.5 rounded ${
              card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
            }`}>1: You Are</span>
            <span className={`px-1 py-0.5 rounded ${
              card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
            }`}>2: You Are Not</span>
            <span className={`px-1 py-0.5 rounded ${
              card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
            }`}>3: Indecisive</span>
              <span className={`px-1 py-0.5 rounded ${
                card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
              }`}>4: Doesn&apos;t Apply</span>
            <span className={`px-1 py-0.5 rounded ${
              card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
            }`}>0: Unsorted</span>
            {pile !== 'UNSORTED' && (
              <span className={`px-1 py-0.5 rounded ${
                card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
              }`}>R: Back to Center</span>
            )}
            <span className={`px-1 py-0.5 rounded ${
              card.isOpposite ? 'bg-gray-700' : 'bg-gray-100'
            }`}>Del: Remove</span>
          </div>
        </div>
      )}
    </div>
  );
};
