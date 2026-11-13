import React, { useEffect } from 'react';
import { useSynapseStore } from '../../store/synapseStore';
import { Play, Pause, RotateCcw, GitBranch, FastForward, Clock } from 'lucide-react';

const milestones = [
  { step: 0, label: 'Paper Ingest', desc: 'Abstract parsed' },
  { step: 1, label: 'Hypothesis', desc: 'Claim bound set' },
  { step: 2, label: 'Dataset', desc: 'GLUE split verified' },
  { step: 3, label: 'Code Gen', desc: 'PyTorch CPU kernel' },
  { step: 4, label: 'Sandbox Crash', desc: 'ValueError captured' },
  { step: 5, label: 'Self-Heal', desc: 'Debugger patched' },
  { step: 6, label: 'Verified', desc: '94.2% reproduced' },
  { step: 7, label: 'What-If', desc: 'Rank r=16 branch' },
];

export default function TimelineSlider() {
  const timelineStep = useSynapseStore((s) => s.timelineStep);
  const setTimelineStep = useSynapseStore((s) => s.setTimelineStep);
  const isPlaying = useSynapseStore((s) => s.isPlayingTimeline);
  const setIsPlaying = useSynapseStore((s) => s.setIsPlayingTimeline);
  const speed = useSynapseStore((s) => s.timelineSpeed);
  const setSpeed = useSynapseStore((s) => s.setTimelineSpeed);
  const addToast = useSynapseStore((s) => s.addToast);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 1600 / speed;
    const timer = setInterval(() => {
      setTimelineStep(timelineStep >= 7 ? 0 : timelineStep + 1);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, timelineStep, speed, setTimelineStep]);

  const handleForkBranch = () => {
    addToast({
      title: 'Git-Style Trajectory Forked',
      message: `Created research branch 'branch-t${timelineStep}-ablation' at snapshot milestone t=${timelineStep}!`,
      type: 'success',
    });
  };

  return (
    <div className="w-full bg-[#0c0e14]/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 text-white flex items-center justify-between shadow-2xl">
      {/* Controls on Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause Replay' : 'Play Replay Timeline'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current" />}
        </button>

        <button
          onClick={() => {
            setTimelineStep(0);
            setIsPlaying(false);
          }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          title="Reset to t=0"
        >
          <RotateCcw size={14} />
        </button>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 text-[11px] font-mono">
          {([1, 2, 4] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded transition-all ${
                speed === s ? 'bg-violet-600 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Milestone Scrubber in Center */}
      <div className="flex-1 max-w-3xl mx-8">
        <div className="relative flex items-center justify-between mb-1.5">
          {milestones.map((m) => {
            const isActive = m.step === timelineStep;
            const isPassed = m.step <= timelineStep;

            return (
              <button
                key={m.step}
                onClick={() => setTimelineStep(m.step)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${
                    isActive
                      ? 'bg-violet-400 border-white ring-4 ring-violet-500/30 scale-125'
                      : isPassed
                      ? 'bg-violet-600 border-violet-400'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono mt-1 transition-colors ${
                    isActive ? 'text-violet-300 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  t={m.step}
                </span>
              </button>
            );
          })}

          {/* Progress bar line connecting milestones */}
          <div className="absolute top-[7px] left-2 right-2 h-0.5 bg-zinc-800 -z-10">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${(timelineStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Milestone Description Pill */}
        <div className="text-center">
          <span className="text-[11px] font-mono text-zinc-400">
            Snapshot: <strong className="text-white">{milestones[timelineStep]?.label}</strong> —{' '}
            <span className="text-zinc-500">{milestones[timelineStep]?.desc}</span>
          </span>
        </div>
      </div>

      {/* Right Fork Branch Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleForkBranch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <GitBranch size={13} className="text-violet-400" />
          <span>Fork Branch From Here</span>
        </button>
      </div>
    </div>
  );
}
