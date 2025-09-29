'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as CardType, Pile, PILE_LABELS, PILE_HEADER_COLORS } from '@/lib/types';
import { Card } from './Card';

interface ColumnProps {
  pile: Pile;
  cards: CardType[];
  isDragDisabled?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ pile, cards, isDragDisabled = false }) => {
  const { setNodeRef } = useDroppable({
    id: pile,
  });

  return (
    <div className="flex-1 min-w-0">
      {/* Column Header */}
      <div className={`${PILE_HEADER_COLORS[pile]} px-4 py-3 rounded-t-lg border-b-2 font-bold text-center`}>
        <h3 className="text-lg">{PILE_LABELS[pile]}</h3>
        <span className="text-sm opacity-75">({cards.length})</span>
      </div>
      
      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="min-h-[200px] p-4 bg-gray-50 rounded-b-lg border-2 border-t-0 border-gray-200"
      >
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">Drop cards here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  pile={pile}
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
