import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Content } from '../content';
import { applyStoredHighlights, createHighlightFromSelection } from './lib';

describe('applyStoredHighlights', () => {
  const containerId = 'test-container';

  beforeEach(() => {
    // Clean up any previous test DOM
    document.body.innerHTML = '';
  });

  test('should highlight "Sample Content" text correctly', () => {
    // Render the Content component
    const { container } = render(<Content id={containerId} />);

    // Create a highlight for "Sample Content"
    const highlight = {
      id: 'test-highlight',
      start: 0,
      end: 14, // Length of "Sample Content"
      color: 'yellow',
    };

    // Apply the highlight
    applyStoredHighlights([highlight], containerId);

    // Find the highlighted span
    const highlightedSpan = container.querySelector(
      'span[data-highlight-id="test-highlight"]'
    );

    expect(highlightedSpan).toBeTruthy();
    expect(highlightedSpan?.textContent).toBe('Sample Content');
    expect((highlightedSpan as HTMLElement)?.style.backgroundColor).toBe(
      'yellow'
    );
  });

  test('should highlight text across multiple elements correctly', () => {
    // Render the Content component
    const { container } = render(<Content id={containerId} />);

    // Create a highlight that spans from "Content" in "Sample Content" to "features" in "features list"
    const highlight = {
      id: 'test-highlight',
      start: 7, // Start at "Content" in "Sample Content"
      end: 253, // End after "features" in "features list"
      color: 'yellow',
    };

    // Apply the highlight
    applyStoredHighlights([highlight], containerId);

    // Find the highlighted spans
    const highlightedSpans = container.querySelectorAll(
      'span[data-highlight-id="test-highlight"]'
    );

    // We should have multiple spans since the highlight crosses elements
    expect(highlightedSpans.length).toBeGreaterThan(1);

    // Check that the first span contains "Content"
    expect(highlightedSpans[0]?.textContent).toContain('Content');

    // Check that one of the spans contains "features"
    const featuresSpan = Array.from(highlightedSpans).find((span) =>
      span.textContent?.includes('Features')
    );
    expect(featuresSpan).toBeTruthy();

    // Check that all spans have the correct background color
    highlightedSpans.forEach((span) => {
      expect((span as HTMLElement).style.backgroundColor).toBe('yellow');
    });
  });

  test('should not create duplicate spans when highlighting the same range multiple times', () => {
    // Render the Content component
    const { container } = render(<Content id={containerId} />);

    const highlight = {
      id: 'test-highlight',
      start: 0,
      end: 14, // Length of "Sample Content"
      color: 'yellow',
    };

    // Apply the same highlight multiple times
    applyStoredHighlights([highlight], containerId);
    applyStoredHighlights([highlight], containerId);
    applyStoredHighlights([highlight], containerId);

    // Find all highlighted spans with our test ID
    const highlightedSpans = container.querySelectorAll(
      'span[data-highlight-id="test-highlight"]'
    );

    // Should only have one span despite applying highlight three times
    expect(highlightedSpans.length).toBe(1);
    expect(highlightedSpans[0]?.textContent).toBe('Sample Content');
    expect((highlightedSpans[0] as HTMLElement)?.style.backgroundColor).toBe(
      'yellow'
    );
  });

  test('should highlight from "Content" to "Use" correctly', () => {
    // Render the Content component
    const { container } = render(<Content id={containerId} />);

    // Create a highlight that spans from "Content" in "Sample Content" to "Use" in "How to Use"
    const highlight = {
      id: 'test-highlight',
      start: 7, // Start at "Content" in "Sample Content"
      end: 597, // End at "Use" in "How to Use"
      color: 'yellow',
    };

    // Apply the highlight
    applyStoredHighlights([highlight], containerId);

    // Find all highlighted spans
    const highlightedSpans = container.querySelectorAll(
      'span[data-highlight-id="test-highlight"]'
    );

    // We should have multiple spans since the highlight crosses elements
    expect(highlightedSpans.length).toBeGreaterThan(1);

    // Check that the first span contains "Content"
    expect(highlightedSpans[0]?.textContent).toContain('Content');

    console.log(Array.from(highlightedSpans).map((span) => span.textContent));

    // Check that one of the spans contains "Use"
    const useSpan = Array.from(highlightedSpans).find((span) =>
      span.textContent?.includes('Use')
    );
    expect(useSpan).toBeTruthy();

    // Check that all spans have the correct background color
    highlightedSpans.forEach((span) => {
      expect((span as HTMLElement).style.backgroundColor).toBe('yellow');
    });
  });
});

describe('createHighlightFromSelection', () => {
  const containerId = 'test-container';

  beforeEach(() => {
    // Clean up any previous test DOM
    document.body.innerHTML = '';

    // Render the Content component
    render(<Content id={containerId} />);
  });

  test('should return null when no selection exists', () => {
    // Mock an empty selection
    const mockGetSelection = vi.fn().mockReturnValue({
      rangeCount: 0,
    });

    // Save the original getSelection
    const originalGetSelection = window.getSelection;
    // Replace with our mock
    window.getSelection = mockGetSelection;

    try {
      const result = createHighlightFromSelection(containerId);
      expect(result).toBeNull();
    } finally {
      // Restore original getSelection
      window.getSelection = originalGetSelection;
    }
  });

  test('should return null when selection is outside the container', () => {
    // Create a div outside our container
    const outsideDiv = document.createElement('div');
    outsideDiv.textContent = 'Outside text';
    document.body.appendChild(outsideDiv);

    // Create a range in the outside div
    const range = document.createRange();
    range.selectNodeContents(outsideDiv);

    // Mock a selection with this range
    const mockGetSelection = vi.fn().mockReturnValue({
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue(range),
      removeAllRanges: vi.fn(),
    });

    // Save the original getSelection
    const originalGetSelection = window.getSelection;
    // Replace with our mock
    window.getSelection = mockGetSelection;

    try {
      const result = createHighlightFromSelection(containerId);
      expect(result).toBeNull();
    } finally {
      // Restore original getSelection
      window.getSelection = originalGetSelection;
    }
  });

  test('should create a highlight from valid selection', () => {
    // Get the container
    const container = document.getElementById(containerId);
    expect(container).not.toBeNull();

    // Find a text node to select
    const textNode = Array.from(container!.querySelectorAll('*')).find((el) =>
      el.textContent?.includes('Sample Content')
    )?.firstChild;
    expect(textNode).not.toBeNull();

    // Create a range for this text
    const range = document.createRange();
    range.setStart(textNode!, 0);
    range.setEnd(textNode!, 6); // Select "Sample"

    // Mock selection
    const mockRemoveAllRanges = vi.fn();
    const mockGetSelection = vi.fn().mockReturnValue({
      rangeCount: 1,
      getRangeAt: vi.fn().mockReturnValue(range),
      removeAllRanges: mockRemoveAllRanges,
    });

    // Mock UUID generation for deterministic testing
    const mockGenerateId = vi.fn().mockReturnValue('test-id-123');

    // Save original
    const originalGetSelection = window.getSelection;
    // Replace with mock
    window.getSelection = mockGetSelection;

    try {
      const result = createHighlightFromSelection(
        containerId,
        'yellow',
        mockGenerateId
      );

      // Check the highlight was created correctly
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id-123');
      expect(result?.color).toBe('yellow');

      // Verify selection was cleared
      expect(mockRemoveAllRanges).toHaveBeenCalled();

      // Check for the highlight in the DOM
      const highlightSpan = container!.querySelector(
        'span[data-highlight-id="test-id-123"]'
      );
      expect(highlightSpan).toBeTruthy();
      expect(highlightSpan?.textContent).toBe('Sample');
    } finally {
      // Restore original
      window.getSelection = originalGetSelection;
    }
  });
});
