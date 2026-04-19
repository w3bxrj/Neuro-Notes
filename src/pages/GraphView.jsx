import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, useReactFlow, ReactFlowProvider, BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220; // approximate w of node
const nodeHeight = 80; // approximate h of node

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function GraphContent() {
  const [notes, setNotes] = useState([]);
  const [links, setLinks] = useState([]);
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { fitView } = useReactFlow();

  const CustomNode = useCallback(({ data }) => {
    const isDark = document.documentElement.classList.contains('dark');
    const { importanceTier, themeColor, themeColorGlow } = data;

    const opacityClass = importanceTier === 0 ? 'opacity-80 hover:opacity-100' : 'opacity-100';
    const scaleClass = importanceTier === 2 ? 'scale-105 z-20' : importanceTier === 1 ? 'scale-100 z-10' : 'scale-95 z-0';
    const borderClass = importanceTier === 2 ? 'border-[3px]' : importanceTier === 1 ? 'border-2' : 'border border-dashed';

    const glowStyle = importanceTier >= 1 
      ? { boxShadow: `0 0 ${importanceTier === 2 ? '20px' : '8px'} ${themeColorGlow}` } 
      : {};

    return (
      <div 
        className={`group relative px-4 py-3 shadow-md rounded-xl min-w-[140px] max-w-[200px] text-center transition-all cursor-pointer ${isDark ? 'bg-[#1a1f2e] text-white' : 'bg-white text-slate-900'} ${opacityClass} ${scaleClass} ${borderClass}`}
        style={{ borderColor: themeColor, ...glowStyle }}
      >
        <Handle type="target" position={Position.Top} className={`w-2 h-2 border-none ${isDark ? '!bg-surfaceBorder' : '!bg-slate-300'}`} style={{ backgroundColor: themeColor }} />
        <div className={`font-semibold ${importanceTier === 2 ? 'text-[1.15rem] font-bold tracking-wide' : importanceTier === 1 ? 'text-[1rem]' : 'text-sm'}`}>{data.label}</div>
        
        <div className="flex flex-col items-center gap-1.5 mt-2">
          {data.tags && data.tags.length > 0 && (
             <div 
               className="text-[10px] px-2 py-0.5 rounded truncate max-w-full font-medium border"
               style={{ 
                 backgroundColor: isDark ? `color-mix(in srgb, ${themeColor} 15%, transparent)` : `color-mix(in srgb, ${themeColor} 10%, white)`,
                 color: isDark ? themeColor : `color-mix(in srgb, ${themeColor} 80%, black)`,
                 borderColor: `color-mix(in srgb, ${themeColor} 30%, transparent)`
               }}
             >
               #{data.tags[0]}
             </div>
          )}
          {data.connectionsCount > 0 && (
             <div 
               className={`text-[10px] font-bold rounded-full px-2.5 py-0.5`}
               style={{
                 backgroundColor: importanceTier === 2 ? themeColor : 'transparent',
                 color: importanceTier === 2 ? '#ffffff' : (isDark ? '#9ca3af' : '#64748b'),
                 border: importanceTier < 2 ? `1px solid ${isDark ? '#374151' : '#cbd5e1'}` : 'none'
               }}
             >
               {data.connectionsCount} {data.connectionsCount === 1 ? 'link' : 'links'}
             </div>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className={`w-2 h-2 border-none`} style={{ backgroundColor: themeColor }} />

        {/* Tooltip Preview */}
        <div 
          className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-[100] backdrop-blur shadow-2xl p-3 rounded-xl border-t-[4px] text-left ${isDark ? 'bg-[#1a1f2e]/95 text-gray-300 border-[rgba(255,255,255,0.1)]' : 'bg-white/95 text-slate-600 border-slate-200'}`} 
          style={{ borderTopColor: themeColor }}
        >
          <h4 className={`text-sm font-bold mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.label}</h4>
          <p className="text-xs line-clamp-4 leading-relaxed tracking-wide">
            {data.content || "Empty note. No content provided."}
          </p>
        </div>
      </div>
    );
  }, []);

  const CustomEdge = useCallback(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) => {
    const isDark = document.documentElement.classList.contains('dark');
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    });

    return (
      <>
        <BaseEdge path={edgePath} style={{ stroke: isDark ? '#A78BFA' : '#94a3b8', strokeWidth: 2 }} />
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button 
              className={`w-5 h-5 rounded-full border shadow-sm flex items-center justify-center text-xs transition-colors hover:text-white hover:bg-red-500 ${isDark ? 'bg-[#1a1f2e] text-red-400 border-[rgba(255,255,255,0.1)]' : 'bg-white text-red-500 border-slate-200'}`} 
              onClick={() => data.onDelete(id)}
              title="Delete connection"
            >
              ✕
            </button>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }, []);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [CustomNode]);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), [CustomEdge]);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Fetch notes from Firestore
    const qNotes = query(collection(db, 'notes'), where('userId', '==', currentUser.uid));
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('GraphView Debug - Notes:', fetchedNotes);
      setNotes(fetchedNotes);
    });

    // 1. Fetch links from Firestore
    const qLinks = query(collection(db, 'links'), where('userId', '==', currentUser.uid));
    const unsubLinks = onSnapshot(qLinks, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('GraphView Debug - Links:', fetchedLinks);
      setLinks(fetchedLinks);
    });

    return () => {
      unsubNotes();
      unsubLinks();
    };
  }, [currentUser]);

  const getTagColor = (tag) => {
    if (!tag) return null;
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
  };

  // 2. Convert Data to React Flow structures
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const maxConnections = Math.max(1, ...notes.map(n => 
      links.filter(l => l.sourceId === n.id || l.targetId === n.id).length
    ));

    const rawNodes = notes.map((note) => {
      const connectionsCount = links.filter(l => l.sourceId === note.id || l.targetId === note.id).length;
      
      let importanceTier = 0;
      if (connectionsCount === maxConnections && connectionsCount > 0) importanceTier = 2;
      else if (connectionsCount >= Math.ceil(maxConnections / 2) && connectionsCount > 0) importanceTier = 1;

      const firstTag = note.tags && note.tags.length > 0 ? note.tags[0] : null;
      let baseHex;

      const TAG_PALETTE = [
        '#3b82f6', // blue
        '#0ea5e9', // sky
        '#06b6d4', // cyan
        '#14b8a6', // teal
        '#10b981', // emerald
        '#8b5cf6', // violet
        '#d946ef', // fuchsia
        '#ec4899', // pink
        '#f59e0b', // amber
      ];

      const NO_TAG_COLORS = {
        high: '#8b5cf6', // Pours violet for dense nodes
        med: '#3b82f6',  // Standard blue for connections
        low: '#94a3b8'   // Faded slate-400 for isolated
      };

      if (firstTag) {
        let hash = 0;
        for (let i = 0; i < firstTag.length; i++) hash = firstTag.charCodeAt(i) + ((hash << 5) - hash);
        const colorIndex = Math.abs(hash) % TAG_PALETTE.length;
        baseHex = TAG_PALETTE[colorIndex];
      } else {
        baseHex = importanceTier === 2 ? NO_TAG_COLORS.high : importanceTier === 1 ? NO_TAG_COLORS.med : NO_TAG_COLORS.low;
      }

      const themeColor = baseHex;
      const themeColorGlow = `color-mix(in srgb, ${baseHex} ${isDark ? '35%' : '25%'}, transparent)`;

      return {
        id: String(note.id),
        type: 'custom',
        data: { 
          label: note.title, 
          content: note.content,
          tags: note.tags,
          themeColor,
          themeColorGlow,
          importanceTier,
          connectionsCount
        },
        position: { x: 0, y: 0 } 
      };
    });

    const rawEdges = links.map(link => ({
      id: String(link.id),
      type: 'custom',
      source: String(link.sourceId),
      target: String(link.targetId),
      animated: true,
      data: {
        onDelete: async (id) => {
          if (window.confirm("Delete this connection?")) {
             try {
                await deleteDoc(doc(db, 'links', id));
             } catch (err) {
                console.error("Failed to delete edge", err);
             }
          }
        }
      }
    }));

    return getLayoutedElements(rawNodes, rawEdges, 'TB');
  }, [notes, links, isDarkMode]);

  useEffect(() => {
    console.log('GraphView Debug - layoutedNodes:', layoutedNodes);
    console.log('GraphView Debug - layoutedEdges:', layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

  useEffect(() => {
    if (layoutedNodes.length > 0) {
      const timer = setTimeout(() => {
        window.requestAnimationFrame(() => {
          fitView({ padding: 0.2, includeHiddenNodes: true, duration: 800 });
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layoutedNodes, fitView]);

  const onNodeClick = useCallback((event, node) => {
    navigate(`/notes/${node.id}`);
  }, [navigate]);

  if (notes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-8 bg-surface/10 rounded-3xl">
        <div className="glass p-10 rounded-3xl flex flex-col items-center border border-dashed border-surfaceBorder text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-3">Your Graph is Empty</h2>
          <p className="text-textSecondary mb-8 text-sm">
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
    <ReactFlow
      nodes={layoutedNodes}
      edges={layoutedEdges}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    >
      <Background color={isDarkMode ? "#555" : "#cbd5e1"} gap={16} />
      <Controls showInteractive={false} className="bg-surface border-surfaceBorder rounded-lg overflow-hidden" />
    </ReactFlow>
  );
}

export default function GraphView() {
  return (
    <div className="w-full h-full relative flex-1 min-h-[500px]">
      <ReactFlowProvider>
        <GraphContent />
      </ReactFlowProvider>
    </div>
  );
}
