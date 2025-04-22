// src/utils/search-highlight.ts

/**
 * Utility to highlight matched search terms in text
 * This can be used to visually show users where their search matched
 */

/**
 * Creates a highlighted version of text with search term matches
 * 
 * @param text - The original text to highlight within
 * @param searchTerm - The search term to highlight
 * @param caseSensitive - Whether the search should be case-sensitive (default: false)
 * @returns Array of segments with match status for rendering
 */
export function getHighlightedText(
    text: string,
    searchTerm: string,
    caseSensitive = false
): { text: string; isMatch: boolean }[] {
    if (!text || !searchTerm) {
        return [{ text, isMatch: false }];
    }

    // Handle case sensitivity
    const normalizedText = caseSensitive ? text : text.toLowerCase();
    const normalizedSearchTerm = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    const result: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;

    // Find all occurrences of the search term
    let index = normalizedText.indexOf(normalizedSearchTerm, lastIndex);

    while (index !== -1) {
        // Add the text segment before the match
        if (index > lastIndex) {
            result.push({
                text: text.substring(lastIndex, index),
                isMatch: false
            });
        }

        // Add the matched segment
        result.push({
            text: text.substring(index, index + searchTerm.length),
            isMatch: true
        });

        // Update lastIndex to continue search after this match
        lastIndex = index + searchTerm.length;

        // Find the next match
        index = normalizedText.indexOf(normalizedSearchTerm, lastIndex);
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
        result.push({
            text: text.substring(lastIndex),
            isMatch: false
        });
    }

    return result;
}

/**
 * React component to render highlighted text
 * Usage example:
 * 
 * <HighlightedText
 *   text="John Doe"
 *   searchTerm="john"
 *   baseClassName="text-sm"
 *   highlightClassName="bg-yellow-200 font-bold"
 * />
 */
import React from 'react';

interface HighlightedTextProps {
    text: string;
    searchTerm: string;
    baseClassName?: string;
    highlightClassName?: string;
    caseSensitive?: boolean;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
    text,
    searchTerm,
    baseClassName = '',
    highlightClassName = 'bg-yellow-200 font-medium',
    caseSensitive = false
}) => {
    const segments = getHighlightedText(text, searchTerm, caseSensitive);

    return (
        <>
        {
            segments.map((segment, index) => (
                <span
          key= { index }
          className = {`${baseClassName} ${segment.isMatch ? highlightClassName : ''}`}
        >
        { segment.text }
        </span>
    ))
}
</>
  );
};

export default HighlightedText;