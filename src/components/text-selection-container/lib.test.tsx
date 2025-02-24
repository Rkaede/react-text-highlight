import { describe, test, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Content } from '../content';
import { applyStoredHighlights } from './lib';

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
