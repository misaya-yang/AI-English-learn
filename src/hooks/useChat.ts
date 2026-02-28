import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'vocabdaily-chat-sessions';
const CURRENT_SESSION_KEY = 'vocabdaily-current-session';

// System prompt for English tutor
const SYSTEM_PROMPT = `You are an expert English tutor specializing in helping Chinese-speaking learners. Your responses should be:

1. Clear and educational
2. Include both English and Chinese explanations when helpful
3. Provide examples and context
4. Be encouraging and supportive

When explaining vocabulary:
- Provide clear definitions
- Give example sentences
- Explain usage contexts
- Note common collocations
- Highlight differences between similar words

When correcting grammar:
- Explain the rule clearly
- Show the correct form
- Provide examples
- Explain why it's wrong

Keep responses concise but comprehensive. Use markdown formatting for clarity.`;

// DeepSeek API config
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = 'sk-bc21c425645b42b9b05a538b766b51ae';

export function useChat() {
  // All chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Current active session ID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CURRENT_SESSION_KEY);
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Streaming content for current message
  const [streamingContent, setStreamingContent] = useState('');
  
  // Abort controller for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  // Get messages for current session (with system prompt)
  const messages = currentSession?.messages || [];

  // Save sessions to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID
  useEffect(() => {
    if (typeof window !== 'undefined' && currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  // Create new session
  const createSession = useCallback((title: string = 'New Chat') => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [currentSessionId, sessions]);

  // Switch to session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setStreamingContent('');
    setIsLoading(false);
  }, []);

  // Update session title based on first user message
  const updateSessionTitle = useCallback((sessionId: string, content: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId && session.title === 'New Chat') {
        // Extract first 30 chars as title
        const title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
        return { ...session, title };
      }
      return session;
    }));
  }, []);

  // Send message to AI
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
    };

    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: [...session.messages, userMessage],
          updatedAt: Date.now(),
        };
      }
      return session;
    }));

    // Update title if first message
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.messages.length === 0) {
      updateSessionTitle(sessionId!, content.trim());
    }

    setIsLoading(true);
    setStreamingContent('');

    // Prepare messages for API
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session?.messages.map(m => ({ role: m.role, content: m.content })) || [],
      { role: 'user', content: content.trim() },
    ];

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      // Add placeholder for assistant message
      const assistantMessageId = uuidv4();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const chunk = json.choices?.[0]?.delta?.content;
              if (chunk) {
                fullContent += chunk;
                setStreamingContent(fullContent);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add final assistant message
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullContent,
        createdAt: Date.now(),
      };

      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, assistantMessage],
            updatedAt: Date.now(),
          };
        }
        return session;
      }));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled, add partial content if any
        if (streamingContent) {
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: streamingContent,
            createdAt: Date.now(),
          };
          setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                messages: [...session.messages, assistantMessage],
                updatedAt: Date.now(),
              };
            }
            return session;
          }));
        }
      } else {
        console.error('Chat error:', error);
        // Add error message
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: '抱歉，我遇到了一些问题。请稍后重试。\n\nSorry, I encountered an error. Please try again later.',
          createdAt: Date.now(),
        };
        setSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, errorMessage],
              updatedAt: Date.now(),
            };
          }
          return session;
        }));
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [currentSessionId, sessions, isLoading, streamingContent, createSession, updateSessionTitle]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Clear current session messages
  const clearMessages = useCallback(() => {
    if (currentSessionId) {
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [],
            updatedAt: Date.now(),
          };
        }
        return session;
      }));
    }
  }, [currentSessionId]);

  // Delete all sessions
  const deleteAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }, []);

  return {
    sessions,
    currentSession,
    currentSessionId,
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    createSession,
    deleteSession,
    switchSession,
    stopGeneration,
    clearMessages,
    deleteAllSessions,
  };
}
