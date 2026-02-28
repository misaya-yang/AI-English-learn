import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase, getAnonymousUserId, type ChatSessionRow, type ChatMessageRow } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// DeepSeek API config
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = 'sk-bc21c425645b42b9b05a538b766b51ae';

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

// Generate title from first user message
function generateTitle(content: string): string {
  // Remove markdown and extra spaces
  const cleanContent = content
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Take first 25 chars, or first sentence if shorter
  if (cleanContent.length <= 25) {
    return cleanContent;
  }
  
  // Try to find a natural break point
  const breakPoints = ['。', '？', '！', '. ', '? ', '! '];
  for (const bp of breakPoints) {
    const idx = cleanContent.indexOf(bp, 15);
    if (idx > 0 && idx < 40) {
      return cleanContent.slice(0, idx + 1);
    }
  }
  
  // Default: truncate with ellipsis
  return cleanContent.slice(0, 25) + '...';
}

export function useSupabaseChat() {
  const userId = getAnonymousUserId();
  
  // All chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  // Current active session ID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Streaming content for current message
  const [streamingContent, setStreamingContent] = useState('');
  
  // Database initialized flag
  const [dbReady, setDbReady] = useState(true);
  
  // Abort controller for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  // Get messages for current session
  const messages = currentSession?.messages || [];

  // Load sessions from Supabase on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load sessions from Supabase
  const loadSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (sessionsError) {
        console.warn('Falling back to local chat storage (sessions query):', sessionsError);
        loadFromLocalStorage();
        return;
      }

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        return;
      }

      // Load messages for each session
      const sessionIds = sessionsData.map(s => s.id);
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.warn('Falling back to local chat storage (messages query):', messagesError);
        loadFromLocalStorage();
        return;
      }

      // Combine sessions with messages
      const loadedSessions: ChatSession[] = sessionsData.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: new Date(session.created_at).getTime(),
        updatedAt: new Date(session.updated_at).getTime(),
        messages: (messagesData || [])
          .filter(m => m.session_id === session.id)
          .map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            createdAt: new Date(m.created_at).getTime(),
          })),
      }));

      setSessions(loadedSessions);
    } catch (error) {
      console.warn('Falling back to local chat storage (unexpected error):', error);
      loadFromLocalStorage();
    }
  };

  // Fallback to localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('vocabdaily-chat-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        setSessions([]);
      }
    }
    setDbReady(false);
  };

  // Save to localStorage as fallback
  const saveToLocalStorage = (sessions: ChatSession[]) => {
    localStorage.setItem('vocabdaily-chat-sessions', JSON.stringify(sessions));
  };

  // Create new session
  const createSession = useCallback(async (title: string = '新对话') => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Error creating session:', error);
      // Fallback to localStorage
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions(prev => {
        const updated = [newSession, ...prev];
        saveToLocalStorage(updated);
        return updated;
      });
      setCurrentSessionId(newSession.id);
      return newSession.id;
    }
  }, [userId]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      await supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating title:', error);
    }

    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === sessionId) {
          return { ...session, title: newTitle };
        }
        return session;
      });
      saveToLocalStorage(updated);
      return updated;
    });
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }

    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveToLocalStorage(updated);
      return updated;
    });
    
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [currentSessionId, sessions, userId]);

  // Switch to session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setStreamingContent('');
    setIsLoading(false);
  }, []);

  // Send message to AI
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create session if none exists
    let sessionId = currentSessionId;
    let isNewSession = false;
    
    if (!sessionId) {
      sessionId = await createSession();
      isNewSession = true;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
    };

    // Update title if this is the first message in a new session
    const session = sessions.find(s => s.id === sessionId);
    const shouldUpdateTitle = isNewSession || (session && session.messages.length === 0);
    const newTitle = shouldUpdateTitle ? generateTitle(content.trim()) : undefined;

    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: userMessage.role,
        content: userMessage.content,
      });

      // Update title if needed
      if (newTitle) {
        await supabase
          .from('chat_sessions')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      } else {
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    // Update local state
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            title: newTitle || session.title,
            messages: [...session.messages, userMessage],
            updatedAt: Date.now(),
          };
        }
        return session;
      });
      saveToLocalStorage(updated);
      return updated;
    });

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

      // Save assistant message to Supabase
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent,
        createdAt: Date.now(),
      };

      try {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: assistantMessage.role,
          content: assistantMessage.content,
        });
      } catch (error) {
        console.error('Error saving assistant message:', error);
      }

      // Update local state
      setSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
              updatedAt: Date.now(),
            };
          }
          return session;
        });
        saveToLocalStorage(updated);
        return updated;
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (streamingContent) {
          const assistantMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: streamingContent,
            createdAt: Date.now(),
          };
          setSessions(prev => {
            const updated = prev.map(session => {
              if (session.id === sessionId) {
                return {
                  ...session,
                  messages: [...session.messages, assistantMessage],
                  updatedAt: Date.now(),
                };
              }
              return session;
            });
            saveToLocalStorage(updated);
            return updated;
          });
        }
      } else {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '抱歉，我遇到了一些问题。请稍后重试。\n\nSorry, I encountered an error. Please try again later.',
          createdAt: Date.now(),
        };
        setSessions(prev => {
          const updated = prev.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                messages: [...session.messages, errorMessage],
                updatedAt: Date.now(),
              };
            }
            return session;
          });
          saveToLocalStorage(updated);
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [currentSessionId, sessions, isLoading, streamingContent, createSession, userId]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Clear current session messages
  const clearMessages = useCallback(async () => {
    if (currentSessionId) {
      try {
        await supabase
          .from('chat_messages')
          .delete()
          .eq('session_id', currentSessionId);
      } catch (error) {
        console.error('Error clearing messages:', error);
      }

      setSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [],
              updatedAt: Date.now(),
            };
          }
          return session;
        });
        saveToLocalStorage(updated);
        return updated;
      });
    }
  }, [currentSessionId]);

  // Delete all sessions
  const deleteAllSessions = useCallback(async () => {
    try {
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error deleting all sessions:', error);
    }

    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem('vocabdaily-chat-sessions');
  }, [userId]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    messages,
    isLoading,
    streamingContent,
    dbReady,
    sendMessage,
    createSession,
    deleteSession,
    switchSession,
    updateSessionTitle,
    stopGeneration,
    clearMessages,
    deleteAllSessions,
  };
}
