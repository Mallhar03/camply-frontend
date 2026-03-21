import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export interface MentionUser {
  id: string;
  username: string;
  avatar: string | null;
}

export function useMentionAutocomplete() {
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [activeRange, setActiveRange] = useState<{ start: number; end: number } | null>(null);
  const [query, setQuery] = useState('');

  const searchUsers = useCallback(async (q: string) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await apiFetch<MentionUser[]>(`/api/v1/users/search?q=${encodeURIComponent(q)}`);
      setSuggestions(res.data || []);
    } catch (error) {
      console.error('Mention search failed', error);
      setSuggestions([]);
    }
  }, []);

  const handleInput = useCallback((text: string, cursorPosition: number) => {
    // Look for @ symbol before cursor
    const beforeCursor = text.slice(0, cursorPosition);
    const lastAtIdx = beforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const queryPart = beforeCursor.slice(lastAtIdx + 1);
      // Ensure no spaces between @ and cursor
      if (!queryPart.includes(' ')) {
        setQuery(queryPart);
        setActiveRange({ start: lastAtIdx, end: cursorPosition });
        searchUsers(queryPart);
        return;
      }
    }

    setQuery('');
    setActiveRange(null);
    setSuggestions([]);
  }, [searchUsers]);

  const insertMention = useCallback((user: MentionUser, text: string) => {
    if (!activeRange) return text;
    const before = text.slice(0, activeRange.start);
    const after = text.slice(activeRange.end);
    return `${before}@${user.username} ${after}`;
  }, [activeRange]);

  return {
    suggestions,
    query,
    handleInput,
    insertMention,
    isActive: suggestions.length > 0 && activeRange !== null,
  };
}
