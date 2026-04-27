import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { ArrowLeft, Link as LinkIcon, Network, X, Loader, Sparkles, Plus, Cpu, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import LinkModal from '../components/notes/LinkModal';
import { useSettings } from '../context/SettingsContext';
import { calculateSimilarity, generateSummary, extractRelatedTopics } from '../utils/similarity';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidChart from '../components/notes/MermaidChart';

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, links, addLink, deleteLink, updateNote, loading } = useNotes();
  const { aiEnabled } = useSettings();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  if (loading) {
    return (
      <div className="p-8 h-full flex justify-center items-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const note = notes.find(n => n.id === id);

  if (!note) {
    return (
      <div className="p-8 h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Note not found</h2>
        <button onClick={() => navigate('/notes')} className="text-primary hover:underline">
          Return to Notes
        </button>
      </div>
    );
  }


  const connectedNotes = links
    .filter(l => l.sourceId === id || l.targetId === id)
    .map(l => ({
      note: notes.find(n => n.id === (l.sourceId === id ? l.targetId : l.sourceId)),
      linkId: l.id
    }))
    .filter(item => item.note);

  const getAvailableNotesForLink = () => {
    return notes
      .filter(n => n.id !== id)
      .filter(n => !links.some(l => 
        (l.sourceId === id && l.targetId === n.id) ||
        (l.sourceId === n.id && l.targetId === id)
      ));
  };

  const handleCreateLink = async (targetId) => {
    try {
      await addLink(id, targetId);
      toast.success('Notes successfully connected!');
      setIsLinkModalOpen(false);
    } catch (err) {
      toast.error('Failed to create link: ' + err.message);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setSummaryError(null);
    try {
      const extractedSummary = await generateSummary(note.content);
      await updateNote(note.id, { 
        summary: extractedSummary,
        lastSummarizedContent: note.content
      });
      toast.success("AI Summary generated successfully!");
    } catch (err) {
      toast.error("Failed to generate summary.");
      setSummaryError("Fallback: Could not connect to AI API. Details: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const availableNotes = getAvailableNotesForLink();

  const suggestedConnections = availableNotes
    .map(otherNote => ({
      note: otherNote,
      score: calculateSimilarity(note, otherNote)
    }))
    .filter(item => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const relatedTopics = extractRelatedTopics(note.content, note.tags);

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col relative max-w-4xl mx-auto w-full">
      <button 
        onClick={() => navigate('/notes')}
        className="flex items-center gap-2 text-textSecondary hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Notes
      </button>

      <div className="glass p-4 sm:p-8 rounded-3xl flex flex-col flex-1 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-textPrimary mb-3 sm:mb-4 break-words">{note.title}</h1>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {note.summary && aiEnabled && (
          <div className="mb-8 p-4 bg-secondary/10 border-l-4 border-secondary rounded-r-xl">
             <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
               <Cpu className="w-3 h-3" /> AI Extracted Summary
             </div>
             <p className="text-sm text-textPrimary font-medium italic leading-relaxed">{note.summary}</p>
          </div>
        )}

        {aiEnabled && (!note.summary || note.content !== note.lastSummarizedContent) && (
          <div className="mb-8">
            <button 
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-surface border border-surfaceBorder hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-textSecondary flex items-center gap-2"
            >
              {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
              {isGenerating 
                ? 'Generating AI Summary...' 
                : note.summary ? 'Regenerate AI Summary' : 'Generate AI Summary'}
            </button>
            {summaryError && (
              <p className="text-red-400 text-sm mt-3 px-2 flex items-center gap-2">
                <X className="w-4 h-4" /> {summaryError}
              </p>
            )}
          </div>
        )}

        <div className="markdown-body flex-1">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const {children, className, node, ...rest} = props;
                const match = /language-(\w+)/.exec(className || '');
                if (match && match[1] === 'mermaid') {
                  return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                }
                return <code {...rest} className={className}>{children}</code>;
              }
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      </div>

      {suggestedConnections.length > 0 && (
        <div className="glass p-6 rounded-3xl mb-8 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-textPrimary">Suggested Connections</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {suggestedConnections.map(({ note: sNote, score }) => (
              <div key={sNote.id} className="group relative glass p-4 rounded-xl border border-surfaceBorder hover:border-blue-500/50 transition-all flex flex-col justify-between items-start gap-3">
                <div className="w-full">
                  <div className="flex justify-between items-start w-full">
                    <h3 className="font-semibold text-textPrimary truncate mb-1">
                      {sNote.title}
                    </h3>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {Math.round(score * 100)}% Match
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary line-clamp-2">
                    {sNote.content}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleCreateLink(sNote.id)} 
                  className="text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg w-full flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold text-textPrimary">Connected Notes</h2>
          </div>
          <button 
            onClick={() => setIsLinkModalOpen(true)}
            className="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium border border-secondary/20"
          >
            <LinkIcon className="w-4 h-4" />
            Link Note
          </button>
        </div>

        {connectedNotes.length === 0 ? (
          <div className="text-center p-6 text-textSecondary bg-surface/50 rounded-2xl border border-dashed border-surfaceBorder">
            No notes connected yet. Build your knowledge graph!
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {connectedNotes.map(({ note: cNote, linkId }) => (
              <div 
                key={cNote.id} 
                className="group inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full text-sm text-secondary transition-all hover:bg-secondary/20 min-w-0 animate-in fade-in zoom-in duration-200"
              >
                <Link 
                  to={`/notes/${cNote.id}`} 
                  className="truncate hover:underline font-semibold max-w-[150px] sm:max-w-xs"
                >
                  {cNote.title}
                </Link>
                <button 
                  onClick={async () => {
                    try {
                      await deleteLink(linkId);
                      toast.success('Connection removed!');
                    } catch (e) {
                      toast.error('Failed to remove: ' + e.message);
                    }
                  }} 
                  className="text-textSecondary hover:text-red-400 opacity-60 hover:opacity-100 transition-all p-0.5"
                  title="Remove connection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {relatedTopics.length > 0 && (
        <div className="glass p-6 rounded-3xl mt-8 border-t border-surfaceBorder bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-textPrimary">Expand your graph</h2>
          </div>
          <p className="text-sm text-textSecondary mb-4">Based on this note, you may also want to learn about:</p>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map(topic => (
              <div 
                key={topic}
                className="px-4 py-2 text-sm font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl transition-all shadow-sm cursor-default"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLinkModalOpen && (
        <LinkModal
          linkModalSource={note}
          onClose={() => setIsLinkModalOpen(false)}
          onLinkCreated={handleCreateLink}
          availableNotes={getAvailableNotesForLink()}
        />
      )}
    </div>
  );
}
