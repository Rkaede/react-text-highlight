import React, { useEffect } from 'react';
import { applyHighlight, applyStoredHighlights } from './lib';
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
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    console.log('selection', selection);

    const range = selection.getRangeAt(0);
    console.log('range', range);

    const container = document.getElementById(containerId);
    if (!container?.contains(range.commonAncestorContainer)) {
      console.log('not in container');

      return;
    }

    // remove any existing highlights in the selected range
    const highlightSpans = Array.from(container.getElementsByTagName('span'))
      .filter((span) => span.dataset.highlightId)
      .filter((span) => {
        const spanRange = document.createRange();
        spanRange.selectNode(span);
        return (
          range.compareBoundaryPoints(Range.START_TO_END, spanRange) <= 0 &&
          range.compareBoundaryPoints(Range.END_TO_START, spanRange) >= 0
        );
      });

    // remove the overlapping highlights from the DOM
    highlightSpans.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });

    // create the new highlight
    const highlightId = window.crypto.randomUUID();

    const endOffset = getTextNodeOffset(
      container,
      range.endContainer,
      range.endOffset
    );
    console.log('endOffset', { container, range, endOffset });

    const highlight = {
      id: highlightId,
      start: getTextNodeOffset(
        container,
        range.startContainer,
        range.startOffset
      ),
      end: endOffset,
      color: 'yellow',
    };

    // don't create highlight if start and end are the same (just a click)
    if (highlight.start === highlight.end) {
      selection.removeAllRanges();
      return;
    }

    // add the new highlight and remove any overlapping ones
    onHighlight(highlight);
    applyHighlight(range, 'yellow', highlightId);
    selection.removeAllRanges();
  };

  const getTextNodeOffset = (
    root: Node,
    node: Node,
    offset: number
  ): number => {
    let totalOffset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();

    while (currentNode) {
      if (currentNode === node) {
        return totalOffset + offset;
      }
      totalOffset += (currentNode as Text).length;
      currentNode = walker.nextNode();
      console.log('currentNode', {
        text: currentNode?.textContent,
        currentNode,
        offset,
        totalOffset,
      });
    }
    return totalOffset;
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
