export type Highlight = {
  id: string;
  start: number;
  end: number;
  color: string;
};

export function applyHighlight(range: Range, color: string, id: string) {
  // if the range is entirely within one element and doesn't contain any highlights
  if (range.startContainer === range.endContainer) {
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.dataset.highlightId = id.toString();
    try {
      // check if the range contains any existing highlights
      const fragment = range.cloneContents();
      const hasHighlights = fragment.querySelector('span[data-highlight-id]');

      if (!hasHighlights) {
        range.surroundContents(span);
        return;
      }
    } catch (e) {
      console.warn('Failed to surround contents:', e);
    }
  }

  // for selections across multiple elements or containing existing highlights
  const spans: HTMLSpanElement[] = [];

  // helper to create a span with the given properties
  const createSpan = () => {
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.dataset.highlightId = id.toString();
    return span;
  };

  // Get all text nodes within the range, excluding those inside highlights
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        // Skip text nodes that are inside highlight spans
        let parent = node.parentNode;
        while (parent && parent !== range.commonAncestorContainer) {
          if (parent instanceof HTMLSpanElement && parent.dataset.highlightId) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentNode;
        }

        const nodeRange = document.createRange();
        nodeRange.selectNode(node);
        // Check if this text node intersects with our selection range
        return nodeRange.compareBoundaryPoints(Range.END_TO_START, range) <=
          0 && nodeRange.compareBoundaryPoints(Range.START_TO_END, range) >= 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let node = walker.nextNode();

  while (node) {
    // Create a range for this text node
    const nodeRange = document.createRange();
    nodeRange.selectNode(node);

    // Determine if we need to split this text node
    let startOffset = 0;
    let endOffset = (node as Text).length;

    // If this is the start node, adjust the start offset
    if (node === range.startContainer) {
      startOffset = range.startOffset;
    }

    // If this is the end node, adjust the end offset
    if (node === range.endContainer) {
      endOffset = range.endOffset;
    }

    // Only create a span if we have text to highlight
    if (startOffset !== endOffset) {
      const span = createSpan();
      nodeRange.setStart(node, startOffset);
      nodeRange.setEnd(node, endOffset);
      try {
        nodeRange.surroundContents(span);
        spans.push(span);
      } catch (e) {
        console.warn('Failed to surround contents for node:', e);
      }
    }

    node = walker.nextNode();
  }

  return spans;
}

export const applyStoredHighlights = (
  highlights: Highlight[],
  containerId: string
) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // remove existing highlights
  const existingHighlights = container.getElementsByTagName('span');
  while (existingHighlights.length) {
    const parent = existingHighlights[0].parentNode;
    if (!parent) continue;

    while (existingHighlights[0].firstChild) {
      parent.insertBefore(
        existingHighlights[0].firstChild,
        existingHighlights[0]
      );
    }
    parent.removeChild(existingHighlights[0]);
  }

  // apply stored highlights
  highlights.forEach((highlight) => {
    const range = document.createRange();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let currentOffset = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;

    // Iterate through text nodes using TreeWalker to find the start and end nodes
    // that contain the highlight range boundaries. For each text node:
    // - Track running offset of text content
    // - If highlight.start falls within current node, mark it as startNode
    // - If highlight.end falls within current node, mark it as endNode
    // - Once we have both nodes, we can create the highlight range
    let currentNode = walker.nextNode();
    while (currentNode) {
      const nextOffset = currentOffset + (currentNode as Text).length;

      if (
        !startNode &&
        highlight.start >= currentOffset &&
        highlight.start <= nextOffset
      ) {
        startNode = currentNode;
        startOffset = highlight.start - currentOffset;
      }

      if (
        !endNode &&
        highlight.end >= currentOffset &&
        highlight.end <= nextOffset
      ) {
        endNode = currentNode;
        endOffset = highlight.end - currentOffset;
      }

      if (startNode && endNode) break;
      currentOffset = nextOffset;
      currentNode = walker.nextNode();
    }

    if (startNode && endNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      applyHighlight(range, highlight.color, highlight.id);
    }
  });
};
