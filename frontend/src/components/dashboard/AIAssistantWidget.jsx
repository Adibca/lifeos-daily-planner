import React, { useState } from 'react';
import { Sparkles, Send, Bot, Check, ArrowRight, CornerDownLeft, Zap } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const AIAssistantWidget = () => {
  const { addTask } = useTask();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      action: 'Create Task',
      title: 'Analyze weekly sprint retrospectives and team blockers',
      category: 'Deep Work',
      priority: 'high',
      time: '03:00 PM',
      reasoning: 'Parsed high priority focus block based on project deadline.'
    },
    {
      action: 'Create Routine',
      title: 'Evening Digital Sunset & Eye Rest (20 mins)',
      category: 'Health',
      priority: 'low',
      time: '10:00 PM',
      reasoning: 'Optimal recovery habit aligned with sleep routine.'
    }
  ]);
  const [successMessage, setSuccessMessage] = useState('');

  const samplePrompts = [
    "Schedule a 90m deep work session on Telegram bot integration at 2pm",
    "Remind me at 6pm to do 30 min cardio and hydrate",
    "Plan my tomorrow starting with cold shower and 2 hours coding"
  ];

  const handleApplySuggestion = (item, index) => {
    addTask({
      title: item.title,
      description: item.reasoning,
      category: item.category,
      priority: item.priority,
      time: item.time,
      slot: item.time,
    });
    setSuccessMessage(`Added "${item.title}" to your schedule!`);
    setAiSuggestions(prev => prev.filter((_, i) => i !== index));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSimulateAI = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      // Simulate intelligent parsing
      const newSuggestion = {
        action: 'AI Planned Task',
        title: prompt.trim(),
        category: 'Engineering',
        priority: 'high',
        time: '04:00 PM',
        reasoning: 'Natural language parsed and mapped to nearest open afternoon slot.'
      };
      setAiSuggestions(prev => [newSuggestion, ...prev]);
      setPrompt('');
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-dark-850 to-dark-900 border border-indigo-500/30 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Background glow subtle effect */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-500 flex items-center justify-center shadow-glow-brand">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">AI Daily Planning Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                OpenAI GPT-4o
              </span>
            </div>
            <p className="text-xs text-slate-400">Describe your day in natural language; LifeOS auto-schedules & organizes.</p>
          </div>
        </div>
      </div>

      {/* Prompt input */}
      <form onSubmit={handleSimulateAI} className="relative z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type: 'Schedule 2hr coding at 10am and notify on Telegram 10m before'..."
            className="w-full pl-4 pr-24 py-3 text-sm bg-dark-800/90 border border-dark-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={isProcessing || !prompt.trim()}
            className="absolute right-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
          >
            {isProcessing ? (
              <span>Parsing...</span>
            ) : (
              <>
                <span>Parse</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Preset pill recommendations */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className="text-[11px] text-slate-500 flex items-center">
            <Zap className="w-3 h-3 mr-1 text-amber-400" /> Suggestions:
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPrompt(p)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition text-left"
            >
              "{p}"
            </button>
          ))}
        </div>
      </form>

      {/* Success alert */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* AI Parsed Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="space-y-2.5 relative z-10 pt-2 border-t border-dark-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">AI Action Proposals</span>
            <span>Click 'Accept' to add into schedule</span>
          </div>

          <div className="space-y-2">
            {aiSuggestions.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-dark-800/80 border border-dark-700 hover:border-indigo-500/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.reasoning}</p>
                </div>

                <button
                  onClick={() => handleApplySuggestion(item, idx)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center space-x-1.5 transition ml-3 flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

