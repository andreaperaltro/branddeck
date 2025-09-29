'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as CardType, PILE_LABELS, PILE_HEADER_COLORS } from '@/lib/types';
import { Card } from './Card';

interface UnsortedTrayProps {
  cards: CardType[];
  isDragDisabled?: boolean;
}

export const UnsortedTray: React.FC<UnsortedTrayProps> = ({ cards, isDragDisabled = false }) => {
  const { setNodeRef } = useDroppable({
    id: 'UNSORTED',
  });

  return (
    <div className="w-full">
      {/* Tray Header */}
      <div className={`${PILE_HEADER_COLORS.UNSORTED} px-4 py-3 rounded-t-lg border-b-2 font-bold text-center`}>
        <h3 className="text-lg">{PILE_LABELS.UNSORTED}</h3>
        <span className="text-sm opacity-75">({cards.length})</span>
      </div>
      
      {/* Tray Content */}
      <div
        ref={setNodeRef}
        className="min-h-[200px] p-4 bg-gray-50 rounded-b-lg border-2 border-t-0 border-gray-200"
      >
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">No unsorted cards</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  pile="UNSORTED"
                  isDragDisabled={isDragDisabled}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
