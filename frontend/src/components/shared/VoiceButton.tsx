import React, { useState, useEffect, useRef } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Mic, MicOff, Volume2, Sparkles, Check } from 'lucide-react';

export default function VoiceButton() {
  const isListening = useSynapseStore((s) => s.isListeningVoice);
  const setIsListening = useSynapseStore((s) => s.setIsListeningVoice);
  const transcript = useSynapseStore((s) => s.voiceTranscript);
  const setTranscript = useSynapseStore((s) => s.setVoiceTranscript);
  const addToast = useSynapseStore((s) => s.addToast);

  const setIsAutoDemoOpen = useSynapseStore((s) => s.setIsAutoDemoOpen);
  const setIsBreakItModalOpen = useSynapseStore((s) => s.setIsBreakItModalOpen);
  const setIsWhatIfOpen = useSynapseStore((s) => s.setIsWhatIfOpen);
  const setIsExportModalOpen = useSynapseStore((s) => s.setIsExportModalOpen);
  const setViewMode = useSynapseStore((s) => s.setViewMode);
  const setActiveRightTab = useSynapseStore((s) => s.setActiveRightTab);

  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);

      if (event.results[current].isFinal) {
        handleVoiceCommand(text);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceCommand = async (spokenText: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/voice/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: spokenText }),
      });
      const data = await res.json();

      addToast({
        title: 'Voice Command Recognized',
        message: `${data.label} (Confidence: ${Math.round(data.confidence * 100)}%)`,
        type: 'agent',
      });

      // Dispatch action based on intent
      switch (data.action) {
        case 'start_demo':
          setIsAutoDemoOpen(true);
          break;
        case 'break_it':
          setIsBreakItModalOpen(true);
          break;
        case 'what_if':
          setIsWhatIfOpen(true);
          break;
        case 'find_gaps':
          setActiveRightTab('insights');
          break;
        case 'export':
          setIsExportModalOpen(true);
          break;
        case 'set_view':
          if (data.params?.view) setViewMode(data.params.view);
          break;
        default:
          break;
      }
    } catch {
      // Offline fallback intent parser
      const lower = spokenText.toLowerCase();
      if (lower.includes('demo')) setIsAutoDemoOpen(true);
      else if (lower.includes('break')) setIsBreakItModalOpen(true);
      else if (lower.includes('what if') || lower.includes('branch')) setIsWhatIfOpen(true);
      else if (lower.includes('gap')) setActiveRightTab('insights');
      else if (lower.includes('export') || lower.includes('pdf')) setIsExportModalOpen(true);
      else if (lower.includes('cluster')) setViewMode('clusters');
      else if (lower.includes('graph')) setViewMode('graph');

      addToast({
        title: 'Voice Command (Offline)',
        message: `Parsed intent: "${spokenText}"`,
        type: 'agent',
      });
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      addToast({
        title: 'Speech API Fallback',
        message: 'Speech recognition not enabled in this browser. Use Ctrl+K for command palette.',
        type: 'info',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-30 flex flex-col items-end">
      {/* Live Transcript Chip with Waveform when listening */}
      {isListening && (
        <div className="mb-2 px-4 py-2 rounded-2xl bg-[#0c0e14]/95 border border-cyan-400 text-white text-xs shadow-2xl backdrop-blur-md flex items-center gap-3 animate-slide-in-right">
          {/* Animated Waveform */}
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" />
            <span className="w-1 h-5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.45s]" />
          </div>
          <span className="font-mono text-zinc-300">
            {transcript || 'Listening... say "reproduce", "break it", or "start demo"'}
          </span>
        </div>
      )}

      {/* Floating Microphone Button */}
      <button
        onClick={toggleListening}
        className={`p-3.5 rounded-full shadow-2xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
          isListening
            ? 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30 animate-pulse'
            : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
        }`}
        title="Voice Command (Web Speech API)"
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </div>
  );
}
