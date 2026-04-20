import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, useReactFlow, ReactFlowProvider, BaseEdge, EdgeLabelRenderer, getBezierPath, Panel } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220; 
const nodeHeight = 80; 

const getLayoutedElements = (nodes, edges, direction = 'TB') => {

  dagreGraph.setGraph({ rankdir: direction, nodesep: 140, ranksep: 140 });

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
  const [graphMode, setGraphMode] = useState('default');
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [pathSourceId, setPathSourceId] = useState(null);
  const [pathTargetId, setPathTargetId] = useState(null);
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const { showLabels, enableHighlight, resetLayoutSignal } = useSettings();
  const navigate = useNavigate();
  const { fitView } = useReactFlow();

  const CustomNode = useCallback(({ data }) => {
    const isDark = document.documentElement.classList.contains('dark');
    const { importanceTier, themeColor, themeColorGlow, isFaded } = data;

    const baseOpacityClass = importanceTier === 0 ? 'opacity-80 hover:opacity-100' : 'opacity-100';
    const scaleClass = importanceTier === 2 ? 'scale-105 z-20' : importanceTier === 1 ? 'scale-100 z-10' : 'scale-95 z-0';
    const borderClass = importanceTier === 2 ? 'border-[3px]' : importanceTier === 1 ? 'border-2' : 'border border-dashed';

    const glowStyle = (importanceTier >= 1 || (enableHighlight && !isFaded))
      ? { boxShadow: `0 0 ${importanceTier === 2 ? '20px' : '10px'} ${themeColorGlow}` } 
      : {};

    const focusStyles = isFaded 
      ? 'opacity-15 blur-[2px] grayscale scale-90 pointer-events-none transition-all duration-500'
      : `${baseOpacityClass} transition-all duration-300`;

    return (
      <div 
        className={`group relative px-4 py-3 shadow-md rounded-xl min-w-[140px] max-w-[200px] text-center cursor-pointer ${isDark ? 'bg-[#1a1f2e] text-white' : 'bg-white text-slate-900'} ${scaleClass} ${borderClass} ${focusStyles}`}
        style={{ borderColor: themeColor, ...glowStyle }}
        title=""
      >
        <Handle type="target" position={Position.Top} className={`w-2 h-2 border-none ${isDark ? '!bg-surfaceBorder' : '!bg-slate-300'}`} style={{ backgroundColor: themeColor }} />
        {showLabels && (
          <div className={`font-semibold ${importanceTier === 2 ? 'text-[1.15rem] font-bold tracking-wide' : importanceTier === 1 ? 'text-[1rem]' : 'text-sm'}`}>
            {data.label}
          </div>
        )}
        
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
      </div>
    );
  }, [showLabels, enableHighlight]);

  const CustomEdge = useCallback(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) => {
    const isDark = document.documentElement.classList.contains('dark');
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    });

    return (
      <>
        <BaseEdge path={edgePath} style={{ stroke: isDark ? '#A78BFA' : '#94a3b8', strokeWidth: 2, opacity: data.isFaded ? 0.05 : 1, transition: 'opacity 0.5s ease-in-out' }} />
        {!data.isFaded && (
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
              >
                ✕
              </button>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }, []);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [CustomNode]);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), [CustomEdge]);

  useEffect(() => {
    if (!currentUser) return;


    const qNotes = query(collection(db, 'notes'), where('userId', '==', currentUser.uid));
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(fetchedNotes);
    });


    const qLinks = query(collection(db, 'links'), where('userId', '==', currentUser.uid));
    const unsubLinks = onSnapshot(qLinks, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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


  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const connectedToFocus = new Set();
    const pathNodes = new Set();
    const pathEdges = new Set();

    if (graphMode === 'focus' && focusedNodeId) {
      connectedToFocus.add(focusedNodeId);
      links.forEach(l => {
        if (l.sourceId === focusedNodeId) connectedToFocus.add(l.targetId);
        if (l.targetId === focusedNodeId) connectedToFocus.add(l.sourceId);
      });
    }

    if (graphMode === 'pathfinder' && pathSourceId && pathTargetId) {
      const adj = {};
      links.forEach(l => {
        if (!adj[l.sourceId]) adj[l.sourceId] = [];
        if (!adj[l.targetId]) adj[l.targetId] = [];
        adj[l.sourceId].push({ node: l.targetId, edge: l.id });
        adj[l.targetId].push({ node: l.sourceId, edge: l.id });
      });

      const queue = [[pathSourceId]];
      const visited = new Set([pathSourceId]);
      let found = false;

      while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];

        if (curr === pathTargetId) {
          found = true;
          path.forEach(n => pathNodes.add(n));
          for (let i = 1; i < path.length; i++) {
             const p1 = path[i-1];
             const p2 = path[i];
             const bridgingEdge = adj[p1].find(e => e.node === p2).edge;
             pathEdges.add(bridgingEdge);
          }
          break;
        }
        if (adj[curr]) {
          for (const neighbor of adj[curr]) {
            if (!visited.has(neighbor.node)) {
              visited.add(neighbor.node);
              queue.push([...path, neighbor.node]);
            }
          }
        }
      }
      
      if (!found) {
         pathNodes.add(pathSourceId);
         pathNodes.add(pathTargetId);
      }
    } else if (graphMode === 'pathfinder') {
      if (pathSourceId) pathNodes.add(pathSourceId);
      if (pathTargetId) pathNodes.add(pathTargetId);
    }

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
        '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#8b5cf6', '#d946ef', '#ec4899', '#f59e0b'
      ];

      const NO_TAG_COLORS = { high: '#8b5cf6', med: '#3b82f6', low: '#94a3b8' };

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
      
      let isFaded = false;
      if (graphMode === 'focus' && focusedNodeId) {
         isFaded = !connectedToFocus.has(note.id);
      } else if (graphMode === 'pathfinder' && (pathSourceId || pathTargetId)) {
         isFaded = !pathNodes.has(note.id);
      }

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
          connectionsCount,
          isFaded
        },
        position: { x: 0, y: 0 } 
      };
    });

    const rawEdges = links.map(link => {
      let isFaded = false;
      if (graphMode === 'focus' && focusedNodeId) {
         isFaded = (link.sourceId !== focusedNodeId && link.targetId !== focusedNodeId);
      } else if (graphMode === 'pathfinder' && (pathSourceId || pathTargetId)) {
         isFaded = !pathEdges.has(link.id);
      }
      
      return {
        id: String(link.id),
        type: 'custom',
        source: String(link.sourceId),
        target: String(link.targetId),
        animated: true,
        data: {
          isFaded,
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
      }
    });

    return getLayoutedElements(rawNodes, rawEdges, 'TB');
  }, [notes, links, isDarkMode, focusedNodeId, graphMode, pathSourceId, pathTargetId]);

  useEffect(() => {
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
  }, [layoutedNodes, fitView, resetLayoutSignal]);

  const onNodeClick = useCallback((event, node) => {
    if (graphMode === 'focus') {
      setFocusedNodeId(prev => prev === node.id ? null : node.id);
    } else if (graphMode === 'pathfinder') {
      if (!pathSourceId || (pathSourceId && pathTargetId)) {
         setPathSourceId(node.id);
         setPathTargetId(null);
      } else if (node.id === pathSourceId) {
         setPathSourceId(null); 
      } else {
         setPathTargetId(node.id);
      }
    } else {
      navigate(`/notes/${node.id}`);
    }
  }, [navigate, graphMode, pathSourceId, pathTargetId]);

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
      panOnDrag
      panOnScroll={false}
      zoomOnScroll
      zoomOnPinch
      zoomOnDoubleClick={false}
      preventScrolling
      minZoom={0.2}
      maxZoom={3}
      fitView
    >
      <Background color={isDarkMode ? '#555' : '#cbd5e1'} gap={16} />

      <div className="hidden sm:block">
        <Controls showInteractive={false} className="bg-surface border-surfaceBorder rounded-lg overflow-hidden" />
      </div>
      
      <Panel position="top-right" className="m-2 sm:m-4 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
            onClick={() => { 
              setGraphMode(prev => prev === 'focus' ? 'default' : 'focus'); 
              setFocusedNodeId(null); 
            }}
            className={`px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all duration-300 border ${
              graphMode === 'focus' 
                ? 'bg-secondary text-white border-secondary shadow-secondary/30 hover:bg-violet-600' 
                : 'glass text-textPrimary hover:bg-surfaceBorder border-surfaceBorder'
            }`}
            title="Toggle Focus Mode"
          >
            <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
            </svg>
            <span className="hidden sm:inline">Focus: {graphMode === 'focus' ? 'On' : 'Off'}</span>
          </button>

          <button 
            onClick={() => { 
              setGraphMode(prev => prev === 'pathfinder' ? 'default' : 'pathfinder'); 
              setPathSourceId(null);
              setPathTargetId(null);
            }}
            className={`px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all duration-300 border ${
              graphMode === 'pathfinder' 
                ? 'bg-blue-500 text-white border-blue-500 shadow-blue-500/30 hover:bg-blue-600' 
                : 'glass text-textPrimary hover:bg-surfaceBorder border-surfaceBorder'
            }`}
            title="Toggle Pathfinder Mode"
          >
            <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 0-2 2v3m0 8v-3a2 2 0 0 1 2-2h3M3 14h3a2 2 0 0 1 2 2v3" />
            </svg>
            <span className="hidden sm:inline">Path: {graphMode === 'pathfinder' ? 'On' : 'Off'}</span>
          </button>
        </div>

        {graphMode === 'pathfinder' && (
           <div className="glass p-3 rounded-xl border border-surfaceBorder text-xs text-textPrimary font-medium shadow-lg animate-fade-in flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              {!pathSourceId && "Select START node"}
              {pathSourceId && !pathTargetId && "Select TARGET node"}
              {pathSourceId && pathTargetId && "Path computation complete. Click again to reset."}
           </div>
        )}
      </Panel>
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
