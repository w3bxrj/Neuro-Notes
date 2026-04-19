import React from 'react';
import { useNotes } from '../context/NotesContext';
import { Network, FileText, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/common/MetricCard';
import { processFirebaseTime } from '../utils/timeFormat';

export default function Dashboard() {
  const { notes, links } = useNotes();
  const navigate = useNavigate();

  const avgConnections = notes.length ? (links.length / notes.length).toFixed(1) : 0;
  
  const isolatedNotes = notes.filter(note => 
    !links.some(link => link.sourceId === note.id || link.targetId === note.id)
  );

  return (
    <div className="p-8 h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-2">Welcome Back</h1>
        <p className="text-textSecondary">Here's the current state of your second brain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <MetricCard 
           title="Total Notes" 
           value={notes.length} 
           icon={FileText} 
           colorClass="bg-primary/20" 
           borderHoverClass="hover:border-primary/50" 
           iconClass="text-primary" 
        />
        <MetricCard 
           title="Total Connections" 
           value={links.length} 
           icon={Network} 
           colorClass="bg-secondary/20" 
           borderHoverClass="hover:border-secondary/50" 
           iconClass="text-secondary" 
        />
        <MetricCard 
           title="Avg Connections" 
           value={avgConnections} 
           icon={Activity} 
           colorClass="bg-green-500/20" 
           borderHoverClass="hover:border-green-500/50" 
           iconClass="text-green-400" 
        />
        <MetricCard 
           title="Isolated Notes" 
           value={isolatedNotes.length} 
           icon={AlertCircle} 
           colorClass={isolatedNotes.length > 0 ? "bg-red-500/20" : "bg-surface"} 
           borderHoverClass="hover:border-red-500/50" 
           iconClass={isolatedNotes.length > 0 ? "text-red-400" : "text-textSecondary"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 border-b border-surfaceBorder pb-4 flex justify-between items-center">
            Recent Thoughts
          </h2>
          <div className="space-y-4 overflow-y-auto">
            {[...notes]
              .sort((a, b) => processFirebaseTime(b.createdAt) - processFirebaseTime(a.createdAt))
              .slice(0, 5)
              .map(note => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/notes/${note.id}`)}
                className="p-4 rounded-xl hover:bg-surfaceBorder transition-colors cursor-pointer flex justify-between items-center group border border-transparent hover:border-surfaceBorder"
              >
                <div>
                  <h3 className="font-medium text-textPrimary text-lg group-hover:text-primary transition-colors">{note.title}</h3>
                  <p className="text-sm text-textSecondary truncate max-w-[200px] sm:max-w-xs">{note.content}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-textSecondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {notes.length === 0 && <p className="text-textSecondary text-sm p-2">No concepts recorded yet.</p>}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col border border-red-500/10 relative overflow-hidden">
          {isolatedNotes.length > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />}
          <div className="flex justify-between items-center border-b border-surfaceBorder pb-4 mb-4">
            <h2 className="text-xl font-semibold">Needs Connecting</h2>
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full font-bold">{isolatedNotes.length} Isolated</span>
          </div>
          
          <div className="space-y-4 overflow-y-auto">
            {isolatedNotes.slice(0, 5).map(note => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/notes/${note.id}`)}
                className="p-4 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer flex justify-between items-center group border border-transparent hover:border-red-500/20"
              >
                <div>
                  <h3 className="font-medium text-textPrimary text-lg group-hover:text-red-400 transition-colors">{note.title}</h3>
                  <p className="text-sm text-textSecondary truncate max-w-[200px] sm:max-w-xs">Link me to other ideas...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {isolatedNotes.length === 0 && notes.length > 0 && (
              <div className="flex flex-col items-center justify-center p-8 h-full space-y-3">
                <Network className="w-8 h-8 text-green-400 opacity-50" />
                <p className="text-textSecondary text-sm text-center">Incredible! All your thoughts are organically connected together!</p>
              </div>
            )}
            {notes.length === 0 && <p className="text-textSecondary text-sm p-2">Start writing notes to see this.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
