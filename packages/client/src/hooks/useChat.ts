import { useState, useEffect, useRef, useCallback } from 'react';
import { USE_SERVER } from '../config';
import { getRecentChatMessages, sendChatMessage, type ChatMessage } from '../services/server-api.service';

const POLL_INTERVAL = 3000;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const lastIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const { messages: newMsgs } = await getRecentChatMessages(
        lastIdRef.current > 0 ? lastIdRef.current : undefined
      );
      if (newMsgs.length > 0) {
        lastIdRef.current = newMsgs[newMsgs.length - 1].id;
        if (lastIdRef.current === newMsgs[0].id && messages.length === 0) {
          // Initial load — replace all
          setMessages(newMsgs);
        } else {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const fresh = newMsgs.filter(m => !existingIds.has(m.id));
            if (fresh.length === 0) return prev;
            const merged = [...prev, ...fresh];
            // Keep at most 200 on client side
            return merged.length > 200 ? merged.slice(-200) : merged;
          });
        }
      }
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!USE_SERVER) return;

    // Initial fetch
    poll();

    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  const send = useCallback(async (text: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await sendChatMessage(text);
      if (res.ok && res.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        lastIdRef.current = Math.max(lastIdRef.current, res.message.id);
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Failed to send' };
    }
  }, []);

  return { messages, send, isConnected };
}
