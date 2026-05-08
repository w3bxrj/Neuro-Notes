import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { clearAllSummaries, deleteAllNotes, deleteAllLinks } from '../services/noteService';
import { 
  Monitor, 
  Cpu, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  Check, 
  X,
  Eye,
  EyeOff,
  Zap,
  ZapOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { 
    showLabels, 
    enableHighlight, 
    aiEnabled, 
    autoSummary, 
    updateSettings, 
    resetLayout 
  } = useSettings();
  const { currentUser } = useAuth();
  
  const [showConfirm, setShowConfirm] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = (key, currentVal) => {
    updateSettings(key, !currentVal);
    toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`);
  };

  const executeDelete = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    try {
      if (showConfirm === 'summaries') {
        await clearAllSummaries(currentUser.uid);
        toast.success('All AI summaries cleared');
      } else if (showConfirm === 'notes') {
        await deleteAllNotes(currentUser.uid);
        toast.success('All notes deleted');
      } else if (showConfirm === 'links') {
        await deleteAllLinks(currentUser.uid);
        toast.success('All connections removed');
      }
      setShowConfirm(null);
    } catch (err) {
      toast.error('Operation failed: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const Section = ({ title, icon: Icon, children, variant = 'default' }) => (
    <div className={`glass p-6 rounded-3xl mb-6 border transition-all ${
      variant === 'danger' ? 'border-red-500/20 bg-red-500/5' : 'border-surfaceBorder'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl ${
          variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className={`text-xl font-bold ${variant === 'danger' ? 'text-red-400' : 'text-textPrimary'}`}>
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleRow = ({ label, description, iconOn: IconOn, iconOff: IconOff, value, onToggle }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-surfaceBorder hover:border-primary/30 transition-all group">
      <div>
        <div className="font-semibold text-textPrimary flex items-center gap-2">
          {label}
        </div>
        <div className="text-xs text-textSecondary mt-0.5">{description}</div>
      </div>
      <button 
        onClick={onToggle}
        className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${
          value ? 'bg-primary' : 'bg-surfaceBorder'
        }`}
      >
        <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center overflow-hidden ${
          value ? 'translate-x-6' : 'translate-x-0'
        }`}>
          {value ? <IconOn className="w-3.5 h-3.5 text-primary" /> : <IconOff className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>
    </div>
  );

  const ActionRow = ({ label, description, buttonLabel, onClick, variant = 'default', icon: Icon }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-surfaceBorder">
      <div>
        <div className="font-semibold text-textPrimary">{label}</div>
        <div className="text-xs text-textSecondary mt-0.5">{description}</div>
      </div>
      <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
          variant === 'danger' 
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' 
            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4" />
        {buttonLabel}
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-4xl font-bold text-textPrimary mb-1 sm:mb-2">Settings</h1>
      <p className="text-textSecondary mb-6 sm:mb-8 text-sm sm:text-lg font-medium">Fine-tune your cognitive mapping environment.</p>

      <Section title="Graph Controls" icon={Monitor}>
        <ToggleRow 
          label="Show Node Labels"
          description="Display note titles directly on the knowledge graph nodes."
          value={showLabels}
          iconOn={Eye}
          iconOff={EyeOff}
          onToggle={() => handleToggle('showLabels', showLabels)}
        />
        <ToggleRow 
          label="Highlight Mode"
          description="Emphasize connected pathways and active nodes with high-contrast glowing."
          value={enableHighlight}
          iconOn={Zap}
          iconOff={ZapOff}
          onToggle={() => handleToggle('enableHighlight', enableHighlight)}
        />
        <ActionRow 
          label="Reset Layout"
          description="Force all nodes to snap back to their optimal computed positions."
          buttonLabel="Recalculate Layout"
          icon={RotateCcw}
          onClick={() => {
            resetLayout();
            toast.success('Graph layout recalculated');
          }}
        />
      </Section>

      <Section title="AI Capabilities" icon={Cpu}>
        <ToggleRow 
          label="Enable AI Summarization"
          description="Allow Groq Llama 3 to extract core concepts from your notes."
          value={aiEnabled}
          iconOn={Check}
          iconOff={X}
          onToggle={() => handleToggle('aiEnabled', aiEnabled)}
        />
        <ToggleRow 
          label="Automated Processing"
          description="Automatically trigger AI summarization whenever a note is saved."
          value={autoSummary}
          iconOn={Zap}
          iconOff={ZapOff}
          onToggle={() => handleToggle('autoSummary', autoSummary)}
        />
        <ActionRow 
          label="Purge AI Data"
          description="Wipe all generated summaries across your entire note library."
          buttonLabel="Clear All Summaries"
          icon={Trash2}
          onClick={() => setShowConfirm('summaries')}
        />
      </Section>

      <Section title="Danger Zone" icon={AlertTriangle} variant="danger">
        <p className="text-sm text-red-400/80 mb-4 px-4 py-3 bg-red-500/5 rounded-xl border border-red-500/10">
          Warning: These actions are permanent and cannot be undone. All data is removed directly from the cloud.
        </p>
        <ActionRow 
          label="Delete All Notes"
          description="Permanently remove every note captured in your account."
          buttonLabel="Wipe Notes"
          variant="danger"
          icon={Trash2}
          onClick={() => setShowConfirm('notes')}
        />
        <ActionRow 
          label="Delete All Connections"
          description="Break every link in your knowledge graph, leaving notes isolated."
          buttonLabel="Wipe Links"
          variant="danger"
          icon={Trash2}
          onClick={() => setShowConfirm('links')}
        />
      </Section>


      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isDeleting && setShowConfirm(null)}></div>
          <div className="bg-background shadow-2xl relative z-10 w-full max-w-md p-8 rounded-3xl border border-red-500/30 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary text-center mb-2">Are you absolutely sure?</h3>
            <p className="text-textSecondary text-center mb-8">
              This action will permanently delete <b>{showConfirm === 'summaries' ? 'all AI summaries' : showConfirm === 'notes' ? 'ALL your notes' : 'ALL connections'}</b> from our servers. 
              This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-6 py-3 rounded-2xl font-bold bg-surface border border-surfaceBorder text-textPrimary hover:bg-surfaceBorder transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={executeDelete}
                className="flex-1 px-6 py-3 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
