import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCcw,
} from 'lucide-react';
import { CopilotMessage } from '../../types/copilot';
import { aiCopilotService } from '../../services/aiCopilotService';
import { useActiveWallet } from '../../context/ActiveWalletContext';
import { FactBadge } from './FactBadge';

interface CopilotChatProps {
  address?: string;
  caseId?: string;
  className?: string;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ 
  address, 
  caseId = 'case-2026-0142', 
  className = '' 
}) => {
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const currentAddress = (address || activeWallet || '').trim().toLowerCase();

  const getInitialMessage = (addr: string): CopilotMessage => {
    if (addr) {
      const short = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      return {
        id: `init-${addr}`,
        sender: 'assistant',
        timestamp: 'JUST NOW',
        text: `**TRACEFORGE AI FORENSIC COPILOT INITIALIZED FOR TARGET WALLET [${short}]**.

GROUNDED DIRECTLY IN REAL-TIME TELEMETRY FOR ${addr}:
* AML HEURISTIC FLAGS (FAN-OUT, ROUND-AMOUNT STRUCTURING, RAPID PASS-THROUGH)
* ML STRUCTURING & SMURFING RISK SCORE
* MULTI-HOP TRANSACTION GRAPH TOPOLOGY (NODES & EDGES)
* OSINT ATTRIBUTION, SANCTIONS (OFAC), & PUBLIC EXPLOIT INTELLIGENCE

EVERY RESPONSE IS GROUNDED EXCLUSIVELY IN THIS WALLET'S VERIFIED TELEMETRY.`,
        groundingLevel: 'FACT',
        groundingExplanation: `GROUNDED IN VERIFIED ON-CHAIN TELEMETRY FOR ${short}.`,
        suggestedFollowUps: [
          'WHY IS THIS WALLET FLAGGED?',
          "SUMMARIZE THIS WALLET'S RISK PROFILE",
          'WHAT ARE THE COUNTERPARTY CONNECTIONS?',
          'CHECK ATTRIBUTION AND OSINT TAGS'
        ]
      };
    }

    return {
      id: 'init-empty',
      sender: 'assistant',
      timestamp: 'JUST NOW',
      text: `**TRACEFORGE AI FORENSIC COPILOT INITIALIZED**.

NO WALLET IS CURRENTLY TRACED IN LIVE TRACE.

TO BEGIN GROUNDED FORENSIC Q&A:
1. GO TO [LIVE TRACE]
2. ENTER AN ETHEREUM ADDRESS (OR LOAD A QUICK SAMPLE LIKE 0x098B716B...)
3. CLICK [TRACE] TO INGEST TRANSACTIONS AND EVALUATE AML FLAGS

ONCE A WALLET IS ON SCREEN, I WILL ANSWER INVESTIGATIVE INQUIRIES GROUNDED STRICTLY IN ITS REAL ON-CHAIN DATA.`,
      groundingLevel: 'INFERENCE',
      groundingExplanation: 'AWAITING WALLET INGESTION AND TRACE TELEMETRY.',
      suggestedFollowUps: [
        'TRACE 0x098b716b8aaf21512996dc57eb0615e2383e2f96'
      ]
    };
  };

  const [messages, setMessages] = useState<CopilotMessage[]>([getInitialMessage(currentAddress)]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync initial message when active wallet changes
  useEffect(() => {
    setMessages([getInitialMessage(currentAddress)]);
  }, [currentAddress]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (queryText: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend) return;

    // Check if user clicked a suggestion to trace a wallet
    const traceMatch = textToSend.match(/0x[a-fA-F0-9]{40}/);
    if (!currentAddress && traceMatch) {
      const extractedAddr = traceMatch[0].toLowerCase();
      setActiveWallet(extractedAddr);
      setInput('');
      return;
    }

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend.toUpperCase(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // If no wallet is currently traced, inform the investigator
    if (!currentAddress) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-empty-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'NO WALLET IS CURRENTLY TRACED IN LIVE TRACE. PLEASE ENTER AND TRACE AN ETHEREUM ADDRESS FIRST (E.G. 0x098B716B8AAF21512996DC57EB0615E2383E2F96) SO GROUNDED FORENSIC TELEMETRY CAN BE ANALYZED.',
          groundingLevel: 'INFERENCE',
          groundingExplanation: 'NO ACTIVE WALLET TELEMETRY LOADED.',
          suggestedFollowUps: [
            'TRACE 0x098b716b8aaf21512996dc57eb0615e2383e2f96'
          ]
        }
      ]);
      return;
    }

    setIsThinking(true);

    try {
      // Build conversation history for recent context
      const history = messages
        .filter((m) => m.sender === 'user' || m.sender === 'assistant')
        .slice(-6)
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }));

      const response = await aiCopilotService.query({
        address: currentAddress,
        question: textToSend,
        conversation_history: history,
      });

      const assistantMsg: CopilotMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.text,
        groundingLevel: response.groundingLevel,
        groundingExplanation: response.groundingExplanation?.toUpperCase(),
        supportingReferences: response.supportingReferences?.map((r) => ({
          ...r,
          label: r.label.toUpperCase(),
        })),
        suggestedFollowUps: response.suggestedFollowUps?.map((s) => s.toUpperCase()),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = err?.message || 'Forensic Copilot is currently unavailable.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'JUST NOW',
          text: `COPILOT UNAVAILABLE: ${errMsg.toUpperCase()}. PLEASE VERIFY BACKEND SERVER IS RUNNING ON HTTP://127.0.0.1:8000 OR RETRY YOUR QUERY.`,
          groundingLevel: 'HYPOTHESIS',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shortAddr = currentAddress
    ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`
    : null;

  return (
    <div className={`flex flex-col h-full bg-background text-xs font-mono rounded-none border border-terminal-muted uppercase ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-terminal-muted flex items-center justify-between bg-background rounded-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-none bg-background border border-terminal-primary flex items-center justify-center text-terminal-primary">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-terminal-primary font-mono text-xs">AI FORENSIC COPILOT</div>
            <div className="text-[10px] text-terminal-muted">
              {shortAddr ? (
                <span>
                  TARGET: <strong className="text-terminal-secondary">{shortAddr}</strong> [GROUNDED]
                </span>
              ) : (
                <span>NO WALLET TRACED — LOAD ADDRESS IN LIVE TRACE</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([getInitialMessage(currentAddress)])}
          className="p-1 rounded-none text-terminal-muted hover:text-terminal-primary border border-transparent hover:border-terminal-primary transition-colors"
          title="RESET CONVERSATION"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } space-y-1.5`}
          >
            {/* Sender Label */}
            <div className="flex items-center gap-2 text-[10px] text-terminal-muted font-bold">
              <span className="font-bold text-terminal-primary">
                {msg.sender === 'user' ? 'LEAD INVESTIGATOR' : 'FORENSIC AI COPILOT'}
              </span>
              <span>{msg.timestamp}</span>
              {msg.groundingLevel && (
                <FactBadge level={msg.groundingLevel} explanation={msg.groundingExplanation} />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`p-3.5 rounded-none max-w-[92%] leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-terminal-primary text-background font-mono text-xs shadow-none border-terminal-primary font-bold'
                  : 'bg-background border-terminal-muted text-terminal-primary font-mono text-xs shadow-none space-y-3 font-bold'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Supporting References */}
              {msg.supportingReferences && msg.supportingReferences.length > 0 && (
                <div className="pt-2 border-t border-current space-y-1.5 font-mono text-[11px]">
                  <div className="text-[10px] text-current uppercase tracking-wider font-bold">
                    CORROBORATING EVIDENCE LINKS:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.supportingReferences.map((ref, idx) => (
                      <Link
                        key={idx}
                        to={ref.linkUrl}
                        className={`px-2 py-1 rounded-none border ${
                          msg.sender === 'user'
                            ? 'border-background/30 hover:bg-background/10 text-background'
                            : 'border-terminal-primary hover:bg-terminal-primary hover:text-background text-terminal-primary'
                        } transition-colors flex items-center gap-1 font-bold`}
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>[{ref.label}]</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy action for assistant responses */}
              {msg.sender === 'assistant' && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="p-1 rounded-none border border-transparent hover:border-terminal-primary text-terminal-muted hover:text-terminal-primary transition-colors text-[10px] flex items-center gap-1 font-mono font-bold"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-terminal-primary" />
                        <span className="text-terminal-primary">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>[ COPY BRIEF ]</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Suggested Prompt Chips */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-w-[92%]">
                {msg.suggestedFollowUps.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="px-2.5 py-1 rounded-none bg-background hover:bg-terminal-primary border border-terminal-muted hover:border-terminal-primary text-[10px] text-terminal-muted hover:text-background font-mono transition-none font-bold"
                  >
                    &gt; {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 rounded-none bg-background border border-terminal-primary text-terminal-primary font-mono text-[11px] font-bold animate-pulse">
            <Bot className="w-4 h-4 animate-none" />
            <span>CONSULTING CASE LEDGER & RUNNING FORENSIC REASONING MODEL...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-terminal-muted bg-background rounded-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              currentAddress
                ? `ASK COPILOT ABOUT WALLET ${shortAddr}...`
                : "ASK AI COPILOT (TRACE A WALLET FIRST)..."
            }
            className="flex-1 p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary font-mono font-bold text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2 rounded-none bg-background hover:bg-terminal-primary border border-terminal-muted hover:border-terminal-primary disabled:opacity-50 text-terminal-muted hover:text-background transition-none font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
