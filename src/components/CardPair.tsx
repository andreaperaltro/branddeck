'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card as CardType } from '@/lib/types';
import { useDeckStore } from '@/store/useDeckStore';

interface CardPairProps {
  cards: CardType[];
}

export const CardPair: React.FC<CardPairProps> = ({ cards }) => {
  const { language } = useDeckStore();

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
          <p className="text-gray-600">You&apos;ve sorted all the word pairs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Instructions */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sort the word pair</h2>
        <p className="text-gray-600">Drag either word to one of the piles below</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center mb-8">
        {cards.map((card) => {
          const displayText = language === 'en' ? card.text_en : card.text_it;
          const isOpposite = card.isOpposite ?? false;
          
          return (
            <DraggableCard
              key={card.id}
              card={card}
              displayText={displayText}
              isOpposite={isOpposite}
            />
          );
        })}
      </div>

      {/* Instructions for dropping on piles below */}
      <div className="text-center text-sm text-gray-500 mb-4">
        <p>Drop cards on the colored piles below ↓</p>
      </div>
    </div>
  );
};

interface DraggableCardProps {
  card: CardType;
  displayText: string;
  isOpposite: boolean;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  displayText,
  isOpposite
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        w-80 h-48 rounded-2xl border-4 cursor-grab active:cursor-grabbing
        transition-all duration-300 hover:scale-105 hover:shadow-2xl
        flex items-center justify-center text-center
        ${isDragging ? 'opacity-50 scale-105 shadow-2xl' : ''}
        ${isOpposite 
          ? 'bg-black text-white border-gray-800 hover:bg-gray-900' 
          : 'bg-white text-black border-gray-300 hover:bg-gray-50'
        }
      `}
      role="button"
      tabIndex={0}
      aria-label={`Card: ${displayText}. Drag to sort into piles.`}
    >
      <div className="px-6">
        <span className="text-2xl font-bold leading-tight">
          {displayText}
        </span>
      </div>
    </div>
  );
};

