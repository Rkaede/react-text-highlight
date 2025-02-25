import React, { useEffect } from 'react';
import { applyStoredHighlights, createHighlightFromSelection } from './lib';
import type { Highlight } from './lib';

type TextSelectionContainerProps = {
  children: React.ReactNode;
  containerId: string;
  highlights: Highlight[];
  onHighlight: (highlight: Highlight) => void;
};

export function TextSelectionContainer({
  children,
  containerId,
  highlights,
  onHighlight,
}: TextSelectionContainerProps) {
  const handleSelection = () => {
    const highlight = createHighlightFromSelection(containerId);
    if (highlight) {
      onHighlight(highlight);
    }
  };

  useEffect(() => {
    applyStoredHighlights(highlights, containerId);
  }, [highlights, containerId]);

  return (
    <div
      id={containerId}
      style={{ position: 'relative' }}
      onMouseUp={handleSelection}
    >
      {children}
    </div>
  );
}
