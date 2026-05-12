import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import GraphComponent from '../components/graph/GraphComponent';
import { Search, Loader, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../components/common/CustomDropdown';

export default function GraphView() {
  const { notes, links, loading } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const navigate = useNavigate();

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  const tagOptions = [
    { label: 'All Tags', value: '' },
    ...allTags.map(tag => ({ label: tag, value: tag }))
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-8 bg-surface/10 rounded-3xl">
        <div className="glass p-10 rounded-3xl flex flex-col items-center border border-dashed border-surfaceBorder text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-3">Your Graph is Empty</h2>
          <p className="text-sm text-textSecondary mb-8 text-sm">
            Your knowledge graph will automatically build itself here visually once you start recording concepts.
          </p>
          <button 
            onClick={() => navigate('/notes')}
            className="bg-primary hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors font-medium shadow-lg shadow-primary/20"
          >
            Create your first note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Graph Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 pt-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Knowledge Graph</h1>
          <p className="text-xs text-textSecondary">Visualize connections between your thoughts.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input 
              type="text" 
              placeholder="Filter graph..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-surfaceBorder rounded-xl pl-9 pr-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
          
          <CustomDropdown 
            options={tagOptions}
            value={selectedTag}
            onChange={setSelectedTag}
            placeholder="Filter by Tag"
            icon={Filter}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <GraphComponent 
          notes={notes} 
          links={links} 
          searchQuery={searchQuery} 
          selectedTag={selectedTag} 
        />
      </div>
    </div>
  );
}
