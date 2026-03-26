import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type NodeChange,
  type EdgeChange,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFamilyTree } from '../hooks/useFamilyTree';
import { usePersonsByTree, useCreatePerson, useUpdatePerson, useDeletePerson, useUpdateManyPositions } from '../hooks/usePersons';
import { useMarriagesByTree, useCreateMarriage, useDeleteMarriage } from '../hooks/useMarriages';
import { PersonNode } from '../components/familyTree/PersonNode';
import { ClusterNode } from '../components/familyTree/ClusterNode';
import { PersonModal } from '../components/familyTree/PersonModal';
import { MarriageModal } from '../components/familyTree/MarriageModal';
import type { Person, CreatePersonInput, UpdatePersonInput, CreateMarriageInput } from '../types';

const nodeTypes: NodeTypes = {
  person: PersonNode as any,
  cluster: ClusterNode as any,
};

// Debounce hook
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
}

// Calculate generation for each person (iterative to avoid stack overflow)
function calculateGenerations(persons: Person[]): Map<number, number> {
  const generations = new Map<number, number>();
  
  // Find root persons (no parents)
  const roots: number[] = [];
  persons.forEach(p => {
    if (!p.fatherId && !p.motherId) {
      roots.push(p.id);
      generations.set(p.id, 0);
    }
  });
  
  // BFS to calculate generations
  const queue = [...roots];
  const processed = new Set<number>(roots);
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentGen = generations.get(currentId) || 0;
    
    // Find children
    persons.forEach(p => {
      if ((p.fatherId === currentId || p.motherId === currentId) && !processed.has(p.id)) {
        generations.set(p.id, currentGen + 1);
        processed.add(p.id);
        queue.push(p.id);
      }
    });
  }
  
  // Handle any unprocessed persons (disconnected)
  persons.forEach(p => {
    if (!generations.has(p.id)) {
      generations.set(p.id, 0);
    }
  });
  
  return generations;
}

// Group persons by generation
function groupByGeneration(persons: Person[], generations: Map<number, number>): Map<number, Person[]> {
  const groups = new Map<number, Person[]>();
  
  persons.forEach(person => {
    const gen = generations.get(person.id) || 0;
    if (!groups.has(gen)) groups.set(gen, []);
    groups.get(gen)!.push(person);
  });
  
  return groups;
}

const GENERATION_COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
];

export function FamilyTreeDetailPage() {
  return (
    <ReactFlowProvider>
      <FamilyTreeDetailContent />
    </ReactFlowProvider>
  );
}

function FamilyTreeDetailContent() {
  const { id } = useParams<{ id: string }>();
  const treeId = parseInt(id || '0');

  const { data: tree, isLoading: treeLoading } = useFamilyTree(treeId);
  const { data: persons = [], isLoading: personsLoading } = usePersonsByTree(treeId);
  const { data: marriages = [] } = useMarriagesByTree(treeId);

  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deletePerson = useDeletePerson();
  const updatePositions = useUpdateManyPositions();
  const createMarriage = useCreateMarriage();
  const deleteMarriage = useDeleteMarriage();

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isMarriageModalOpen, setIsMarriageModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [defaultParents, setDefaultParents] = useState<{ father?: Person | null; mother?: Person | null } | null>(null);
  const [defaultSpouse, setDefaultSpouse] = useState<Person | null>(null);
  
  // Edge visibility toggles - disable by default for large trees
  const [showParentEdges, setShowParentEdges] = useState(false);
  const [showMarriageEdges, setShowMarriageEdges] = useState(false);
  
  // Clustering state - enable by default for large trees
  const [isClusterMode, setIsClusterMode] = useState(true);
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  
  // Track pending position updates for batch saving
  const pendingPositionsRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Calculate generations for all persons - only when persons change
  const generations = useMemo(() => {
    if (persons.length === 0) return new Map<number, number>();
    return calculateGenerations(persons);
  }, [persons]);
  
  const generationGroups = useMemo(() => {
    if (persons.length === 0) return new Map<number, Person[]>();
    return groupByGeneration(persons, generations);
  }, [persons, generations]);

  // Auto-adjust settings based on tree size
  useEffect(() => {
    if (persons.length > 0 && !isInitialized) {
      const isLargeTree = persons.length > 100;
      setIsClusterMode(isLargeTree);
      setShowParentEdges(!isLargeTree);
      setShowMarriageEdges(!isLargeTree);
      setIsInitialized(true);
    }
  }, [persons.length, isInitialized]);

  const findSpouse = useCallback((person: Person): Person | null => {
    const marriage = marriages.find(
      (m) => (m.spouse1Id === person.id || m.spouse2Id === person.id) && m.status === 'MARRIED'
    );
    if (!marriage) return null;
    
    const spouseId = marriage.spouse1Id === person.id ? marriage.spouse2Id : marriage.spouse1Id;
    return persons.find((p) => p.id === spouseId) || null;
  }, [marriages, persons]);

  const handlersRef = useRef({
    onEdit: (person: Person) => {
      setEditingPerson(person);
      setDefaultParents(null);
      setIsPersonModalOpen(true);
    },
    onDelete: async (person: Person) => {
      if (window.confirm(`Bạn có chắc muốn xóa "${person.name}"?`)) {
        try {
          await deletePerson.mutateAsync({ id: person.id, familyTreeId: treeId });
        } catch (err) {
          console.error('Failed to delete person:', err);
        }
      }
    },
    onAddChild: (parent: Person) => {
      setEditingPerson(null);
      
      const spouse = findSpouse(parent);
      
      let father: Person | null = null;
      let mother: Person | null = null;
      
      if (parent.gender === 'MALE') {
        father = parent;
        mother = spouse;
      } else {
        father = spouse;
        mother = parent;
      }
      
      setDefaultParents({ father, mother });
      setIsPersonModalOpen(true);
    },
    onAddSpouse: (person: Person) => {
      setDefaultSpouse(person);
      setIsMarriageModalOpen(true);
    },
  });

  useEffect(() => {
    handlersRef.current.onAddChild = (parent: Person) => {
      setEditingPerson(null);
      
      const spouse = findSpouse(parent);
      
      let father: Person | null = null;
      let mother: Person | null = null;
      
      if (parent.gender === 'MALE') {
        father = parent;
        mother = spouse;
      } else {
        father = spouse;
        mother = parent;
      }
      
      setDefaultParents({ father, mother });
      setIsPersonModalOpen(true);
    };
  }, [findSpouse]);

  const handleExpandGeneration = useCallback((personIds: number[]) => {
    const gen = generations.get(personIds[0]) || 0;
    setExpandedGenerations(prev => {
      const next = new Set(prev);
      next.add(gen);
      return next;
    });
  }, [generations]);

  const handleCollapseGeneration = useCallback((gen: number) => {
    setExpandedGenerations(prev => {
      const next = new Set(prev);
      next.delete(gen);
      return next;
    });
  }, []);

  // Store cluster positions for viewport calculations
  const clusterPositionsRef = useRef<Map<number, { x: number; y: number; height: number }>>(new Map());

  // Auto expand/collapse based on zoom level and viewport
  const autoExpandDisabledRef = useRef(false);
  
  const handleMoveEnd = useCallback((_: any, viewport: Viewport) => {
    const zoom = viewport.zoom;
    setCurrentZoom(zoom);
    
    if (!isClusterMode || autoExpandDisabledRef.current) return;
    
    // Get viewport bounds in flow coordinates
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;
    const viewportX = -viewport.x / zoom;
    const viewportY = -viewport.y / zoom;
    
    // Add some padding to viewport bounds
    const padding = 100;
    const viewBounds = {
      minX: viewportX - padding,
      maxX: viewportX + viewportWidth + padding,
      minY: viewportY - padding,
      maxY: viewportY + viewportHeight + padding,
    };
    
    const sortedGens = Array.from(generationGroups.keys()).sort((a, b) => a - b);
    
    // Find which generations are visible in viewport
    const visibleGenerations: number[] = [];
    clusterPositionsRef.current.forEach((pos, gen) => {
      const isVisible = 
        pos.x >= viewBounds.minX && 
        pos.x <= viewBounds.maxX &&
        pos.y >= viewBounds.minY && 
        pos.y <= viewBounds.maxY + pos.height;
      
      if (isVisible) {
        visibleGenerations.push(gen);
      }
    });
    
    // Determine how many generations to expand based on zoom
    let maxExpand = 0;
    if (zoom >= 0.6) {
      maxExpand = 4; // Very close - expand up to 4 visible generations
    } else if (zoom >= 0.4) {
      maxExpand = 3; // Close - expand up to 3 visible generations
    } else if (zoom >= 0.25) {
      maxExpand = 2; // Medium - expand up to 2 visible generations
    } else if (zoom >= 0.12) {
      maxExpand = 1; // Far - expand only 1 visible generation
    } else {
      maxExpand = 0; // Very far - collapse all
    }
    
    if (maxExpand === 0) {
      // Collapse all
      if (expandedGenerations.size > 0) {
        setExpandedGenerations(new Set());
      }
    } else {
      // Expand visible generations up to maxExpand
      const toExpand = visibleGenerations.length > 0 
        ? visibleGenerations.slice(0, maxExpand)
        : sortedGens.slice(0, maxExpand); // Fallback to first generations if no positions yet
      
      // Only update if different from current
      const newSet = new Set(toExpand);
      const isDifferent = newSet.size !== expandedGenerations.size || 
        toExpand.some(g => !expandedGenerations.has(g));
      
      if (isDifferent) {
        setExpandedGenerations(newSet);
      }
    }
  }, [isClusterMode, generationGroups, expandedGenerations]);

  // Disable auto-expand when user manually interacts
  const handleManualExpand = useCallback((personIds: number[]) => {
    autoExpandDisabledRef.current = true;
    handleExpandGeneration(personIds);
  }, [handleExpandGeneration]);

  const handleManualCollapse = useCallback((gen: number) => {
    autoExpandDisabledRef.current = true;
    handleCollapseGeneration(gen);
  }, [handleCollapseGeneration]);

  // Re-enable auto-expand when toggling cluster mode
  const handleToggleClusterMode = useCallback(() => {
    autoExpandDisabledRef.current = false;
    setIsClusterMode(!isClusterMode);
    setExpandedGenerations(new Set());
  }, [isClusterMode]);

  const buildNodes = useCallback((): Node[] => {
    if (!isClusterMode) {
      return persons.map((person) => ({
        id: person.id.toString(),
        type: 'person',
        position: { x: person.positionX, y: person.positionY },
        data: {
          person,
          onEdit: handlersRef.current.onEdit,
          onDelete: handlersRef.current.onDelete,
          onAddChild: handlersRef.current.onAddChild,
          onAddSpouse: handlersRef.current.onAddSpouse,
        },
      }));
    }

    // Cluster mode - calculate dynamic layout
    const result: Node[] = [];
    const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
    
    // Clear and rebuild cluster positions
    const newClusterPositions = new Map<number, { x: number; y: number; height: number }>();
    
    // First pass: calculate heights for each generation
    const genHeights: number[] = [];
    sortedGenerations.forEach((gen) => {
      const genPersons = generationGroups.get(gen) || [];
      const isExpanded = expandedGenerations.has(gen);
      
      if (isExpanded) {
        const personsPerRow = Math.min(Math.ceil(Math.sqrt(genPersons.length)), 12);
        const rows = Math.ceil(genPersons.length / personsPerRow);
        genHeights.push(rows * 130 + 60);
      } else {
        genHeights.push(120);
      }
    });
    
    // Second pass: calculate Y positions
    const genYPositions: number[] = [100];
    for (let i = 1; i < sortedGenerations.length; i++) {
      genYPositions.push(genYPositions[i - 1] + genHeights[i - 1] + 40);
    }
    
    // Third pass: build nodes and store cluster positions
    sortedGenerations.forEach((gen, index) => {
      const genPersons = generationGroups.get(gen) || [];
      const isExpanded = expandedGenerations.has(gen);
      const startY = genYPositions[index];
      
      // Store position for this generation (for viewport calculations)
      newClusterPositions.set(gen, { x: 500, y: startY, height: genHeights[index] });
      
      if (isExpanded) {
        const personsPerRow = Math.min(Math.ceil(Math.sqrt(genPersons.length)), 12);
        const nodeWidth = 170;
        const nodeHeight = 100;
        const colGap = 30;
        const rowGap = 30;
        
        const totalWidth = personsPerRow * nodeWidth + (personsPerRow - 1) * colGap;
        const startX = 500 - totalWidth / 2;
        
        genPersons.forEach((person, pIndex) => {
          const row = Math.floor(pIndex / personsPerRow);
          const col = pIndex % personsPerRow;
          
          result.push({
            id: person.id.toString(),
            type: 'person',
            position: { 
              x: startX + col * (nodeWidth + colGap), 
              y: startY + row * (nodeHeight + rowGap)
            },
            data: {
              person,
              onEdit: handlersRef.current.onEdit,
              onDelete: handlersRef.current.onDelete,
              onAddChild: handlersRef.current.onAddChild,
              onAddSpouse: handlersRef.current.onAddSpouse,
            },
          });
        });
      } else {
        result.push({
          id: `cluster-gen-${gen}`,
          type: 'cluster',
          position: { x: 500, y: startY },
          data: {
            label: `Thế hệ ${gen + 1}`,
            count: genPersons.length,
            color: GENERATION_COLORS[index % GENERATION_COLORS.length],
            generation: gen,
            personIds: genPersons.map(p => p.id),
            onExpand: handleManualExpand,
          },
        });
      }
    });
    
    // Update cluster positions ref
    clusterPositionsRef.current = newClusterPositions;
    
    return result;
  }, [persons, isClusterMode, generationGroups, expandedGenerations, handleManualExpand]);

  const buildEdges = useCallback((): Edge[] => {
    if (isClusterMode) {
      // In cluster mode, only show edges between expanded generations
      const edges: Edge[] = [];
      const expandedPersonIds = new Set<number>();
      
      expandedGenerations.forEach(gen => {
        const genPersons = generationGroups.get(gen) || [];
        genPersons.forEach(p => expandedPersonIds.add(p.id));
      });

      if (showParentEdges) {
        persons.forEach((person) => {
          if (!expandedPersonIds.has(person.id)) return;
          
          if (person.fatherId && expandedPersonIds.has(person.fatherId)) {
            edges.push({
              id: `father-${person.fatherId}-${person.id}`,
              source: person.fatherId.toString(),
              sourceHandle: 'bottom',
              target: person.id.toString(),
              targetHandle: 'top',
              type: 'default',
              style: { stroke: '#3b82f6', strokeWidth: 1.5 },
            });
          }

          if (person.motherId && expandedPersonIds.has(person.motherId)) {
            edges.push({
              id: `mother-${person.motherId}-${person.id}`,
              source: person.motherId.toString(),
              sourceHandle: 'bottom',
              target: person.id.toString(),
              targetHandle: 'top',
              type: 'default',
              style: { stroke: '#ec4899', strokeWidth: 1.5 },
            });
          }
        });
      }

      if (showMarriageEdges) {
        marriages.forEach((marriage) => {
          if (expandedPersonIds.has(marriage.spouse1Id) && expandedPersonIds.has(marriage.spouse2Id)) {
            edges.push({
              id: `marriage-${marriage.id}`,
              source: marriage.spouse1Id.toString(),
              sourceHandle: 'left',
              target: marriage.spouse2Id.toString(),
              targetHandle: 'right',
              type: 'straight',
              style: {
                stroke: marriage.status === 'DIVORCED' ? '#9ca3af' : '#f472b6',
                strokeWidth: 1.5,
                strokeDasharray: marriage.status === 'DIVORCED' ? '5,5' : undefined,
              },
            });
          }
        });
      }

      // Add edges between clusters
      const sortedGens = Array.from(generationGroups.keys()).sort((a, b) => a - b);
      for (let i = 0; i < sortedGens.length - 1; i++) {
        const currentGen = sortedGens[i];
        const nextGen = sortedGens[i + 1];
        
        if (!expandedGenerations.has(currentGen) && !expandedGenerations.has(nextGen)) {
          edges.push({
            id: `cluster-edge-${currentGen}-${nextGen}`,
            source: `cluster-gen-${currentGen}`,
            sourceHandle: 'bottom',
            target: `cluster-gen-${nextGen}`,
            targetHandle: 'top',
            type: 'default',
            style: { stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '8,4' },
          });
        }
      }

      return edges;
    }

    // Normal mode
    const edges: Edge[] = [];

    if (showParentEdges) {
      persons.forEach((person) => {
        if (person.fatherId) {
          edges.push({
            id: `father-${person.fatherId}-${person.id}`,
            source: person.fatherId.toString(),
            sourceHandle: 'bottom',
            target: person.id.toString(),
            targetHandle: 'top',
            type: 'default',
            style: { stroke: '#3b82f6', strokeWidth: 1.5 },
          });
        }

        if (person.motherId) {
          edges.push({
            id: `mother-${person.motherId}-${person.id}`,
            source: person.motherId.toString(),
            sourceHandle: 'bottom',
            target: person.id.toString(),
            targetHandle: 'top',
            type: 'default',
            style: { stroke: '#ec4899', strokeWidth: 1.5 },
          });
        }
      });
    }

    if (showMarriageEdges) {
      marriages.forEach((marriage) => {
        edges.push({
          id: `marriage-${marriage.id}`,
          source: marriage.spouse1Id.toString(),
          sourceHandle: 'left',
          target: marriage.spouse2Id.toString(),
          targetHandle: 'right',
          type: 'straight',
          style: {
            stroke: marriage.status === 'DIVORCED' ? '#9ca3af' : '#f472b6',
            strokeWidth: 1.5,
            strokeDasharray: marriage.status === 'DIVORCED' ? '5,5' : undefined,
          },
        });
      });
    }

    return edges;
  }, [persons, marriages, showParentEdges, showMarriageEdges, isClusterMode, expandedGenerations, generationGroups]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Build nodes and edges only when dependencies actually change
  useEffect(() => {
    if (!isInitialized || persons.length === 0) return;
    
    // Use requestAnimationFrame to avoid blocking
    const rafId = requestAnimationFrame(() => {
      const newNodes = buildNodes();
      const newEdges = buildEdges();
      setNodes(newNodes);
      setEdges(newEdges);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [buildNodes, buildEdges, isInitialized, persons.length]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    async (params: Connection) => {
      const { source, target, sourceHandle, targetHandle } = params;
      
      if (!source || !target) return;
      
      const sourceId = parseInt(source);
      const targetId = parseInt(target);
      
      const sourcePerson = persons.find(p => p.id === sourceId);
      const targetPerson = persons.find(p => p.id === targetId);
      
      if (!sourcePerson || !targetPerson) return;

      if (sourceHandle === 'bottom' && targetHandle === 'top') {
        const confirmMsg = sourcePerson.gender === 'MALE'
          ? `Xác nhận "${sourcePerson.name}" là CHA của "${targetPerson.name}"?`
          : `Xác nhận "${sourcePerson.name}" là MẸ của "${targetPerson.name}"?`;
        
        if (window.confirm(confirmMsg)) {
          try {
            const updateData = sourcePerson.gender === 'MALE'
              ? { fatherId: sourceId }
              : { motherId: sourceId };
            
            await updatePerson.mutateAsync({ 
              id: targetId, 
              data: updateData 
            });
          } catch (err) {
            console.error('Failed to create parent-child relation:', err);
          }
        }
      }
      else if (sourceHandle === 'top' && targetHandle === 'bottom') {
        const confirmMsg = targetPerson.gender === 'MALE'
          ? `Xác nhận "${targetPerson.name}" là CHA của "${sourcePerson.name}"?`
          : `Xác nhận "${targetPerson.name}" là MẸ của "${sourcePerson.name}"?`;
        
        if (window.confirm(confirmMsg)) {
          try {
            const updateData = targetPerson.gender === 'MALE'
              ? { fatherId: targetId }
              : { motherId: targetId };
            
            await updatePerson.mutateAsync({ 
              id: sourceId, 
              data: updateData 
            });
          } catch (err) {
            console.error('Failed to create parent-child relation:', err);
          }
        }
      }
      else if (
        (sourceHandle === 'left' && targetHandle === 'right') ||
        (sourceHandle === 'right' && targetHandle === 'left')
      ) {
        const existingMarriage = marriages.find(
          m => (m.spouse1Id === sourceId && m.spouse2Id === targetId) ||
               (m.spouse1Id === targetId && m.spouse2Id === sourceId)
        );
        
        if (existingMarriage) {
          alert('Hai người này đã có quan hệ vợ chồng!');
          return;
        }
        
        if (window.confirm(`Xác nhận tạo quan hệ vợ chồng giữa "${sourcePerson.name}" và "${targetPerson.name}"?`)) {
          try {
            await createMarriage.mutateAsync({
              familyTreeId: treeId,
              spouse1Id: sourceId,
              spouse2Id: targetId,
              status: 'MARRIED',
            });
          } catch (err) {
            console.error('Failed to create marriage:', err);
          }
        }
      }
    },
    [persons, marriages, updatePerson, createMarriage, treeId]
  );

  // Batch save positions with debounce
  const savePositions = useCallback(async () => {
    if (pendingPositionsRef.current.size === 0) return;
    
    const positions = Array.from(pendingPositionsRef.current.entries()).map(([id, pos]) => ({
      id,
      positionX: pos.x,
      positionY: pos.y,
    }));
    
    pendingPositionsRef.current.clear();
    
    try {
      await updatePositions.mutateAsync({ positions, familyTreeId: treeId });
    } catch (err) {
      console.error('Failed to update positions:', err);
    }
  }, [updatePositions, treeId]);

  const debouncedSavePositions = useDebounce(savePositions, 500);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      pendingPositionsRef.current.set(parseInt(node.id), {
        x: node.position.x,
        y: node.position.y,
      });
      debouncedSavePositions();
    },
    [debouncedSavePositions]
  );

  const onEdgeDoubleClick = useCallback(
    async (_: React.MouseEvent, edge: Edge) => {
      const edgeId = edge.id;
      
      if (edgeId.startsWith('marriage-')) {
        const marriageId = parseInt(edgeId.replace('marriage-', ''));
        const marriage = marriages.find(m => m.id === marriageId);
        
        if (marriage) {
          const spouse1 = persons.find(p => p.id === marriage.spouse1Id);
          const spouse2 = persons.find(p => p.id === marriage.spouse2Id);
          
          if (window.confirm(`Xóa quan hệ vợ chồng giữa "${spouse1?.name}" và "${spouse2?.name}"?`)) {
            try {
              await deleteMarriage.mutateAsync({ id: marriageId, familyTreeId: treeId });
            } catch (err) {
              console.error('Failed to delete marriage:', err);
            }
          }
        }
      }
      else if (edgeId.startsWith('father-')) {
        const parts = edgeId.split('-');
        const childId = parseInt(parts[2]);
        const child = persons.find(p => p.id === childId);
        const father = persons.find(p => p.id === parseInt(parts[1]));
        
        if (child && father) {
          if (window.confirm(`Xóa quan hệ cha-con giữa "${father.name}" và "${child.name}"?`)) {
            try {
              await updatePerson.mutateAsync({ 
                id: childId, 
                data: { fatherId: null } 
              });
            } catch (err) {
              console.error('Failed to remove father relation:', err);
            }
          }
        }
      }
      else if (edgeId.startsWith('mother-')) {
        const parts = edgeId.split('-');
        const childId = parseInt(parts[2]);
        const child = persons.find(p => p.id === childId);
        const mother = persons.find(p => p.id === parseInt(parts[1]));
        
        if (child && mother) {
          if (window.confirm(`Xóa quan hệ mẹ-con giữa "${mother.name}" và "${child.name}"?`)) {
            try {
              await updatePerson.mutateAsync({ 
                id: childId, 
                data: { motherId: null } 
              });
            } catch (err) {
              console.error('Failed to remove mother relation:', err);
            }
          }
        }
      }
    },
    [marriages, persons, deleteMarriage, updatePerson, treeId]
  );

  const handlePersonSubmit = async (data: CreatePersonInput | UpdatePersonInput) => {
    try {
      if (editingPerson) {
        await updatePerson.mutateAsync({ id: editingPerson.id, data: data as UpdatePersonInput });
      } else {
        await createPerson.mutateAsync(data as CreatePersonInput);
      }
      setIsPersonModalOpen(false);
      setEditingPerson(null);
      setDefaultParents(null);
    } catch (err) {
      console.error('Failed to save person:', err);
    }
  };

  const handleMarriageSubmit = async (data: CreateMarriageInput) => {
    try {
      await createMarriage.mutateAsync(data);
      setIsMarriageModalOpen(false);
      setDefaultSpouse(null);
    } catch (err) {
      console.error('Failed to create marriage:', err);
    }
  };

  if (treeLoading || personsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (!isInitialized && persons.length > 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Đang xử lý {persons.length.toLocaleString()} thành viên...</div>
          <div className="text-sm text-gray-400 mt-2">Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy cây gia phả</p>
          <Link to="/family-trees" className="text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow z-10">
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/family-trees"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Quay lại
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tree.name}</h1>
              {tree.description && (
                <p className="text-sm text-gray-500">{tree.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {persons.length} thành viên • {generationGroups.size} thế hệ
            </span>
            <button
              onClick={handleToggleClusterMode}
              className={`px-3 py-2 rounded-lg transition text-sm ${
                isClusterMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isClusterMode ? '📦 Đang gom nhóm' : '📦 Gom nhóm'}
            </button>
            <button
              onClick={() => {
                setEditingPerson(null);
                setDefaultParents(null);
                setIsPersonModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              + Thêm thành viên
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onMoveEnd={handleMoveEnd}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
          minZoom={0.02}
          maxZoom={1.5}
          onlyRenderVisibleElements
          nodesDraggable={!isClusterMode || expandedGenerations.size > 0}
          nodesConnectable
          elementsSelectable
          selectNodesOnDrag={false}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          preventScrolling
          defaultEdgeOptions={{
            type: 'default',
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#f3f4f6" gap={40} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as any;
              if (node.type === 'cluster') return data?.color || '#8b5cf6';
              return data?.person?.gender === 'MALE' ? '#3b82f6' : '#ec4899';
            }}
            maskColor="rgba(0, 0, 0, 0.08)"
            pannable
            zoomable
            nodeStrokeWidth={0}
          />
        </ReactFlow>
      </div>

      {/* Zoom indicator */}
      {isClusterMode && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow px-3 py-2 text-xs">
          <div className="text-gray-500 font-medium">Zoom: {Math.round(currentZoom * 100)}%</div>
          <div className="text-gray-400 mt-1 text-[10px]">
            {currentZoom < 0.12 
              ? '🔍 Zoom in để mở rộng' 
              : currentZoom >= 0.6 
                ? '✨ Hiển thị chi tiết' 
                : '📍 Di chuyển để xem các thế hệ khác'}
          </div>
          {expandedGenerations.size > 0 && (
            <div className="text-purple-500 mt-1 text-[10px]">
              Đang mở: {expandedGenerations.size} thế hệ
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow p-3 text-xs max-w-xs">
        <div className="font-semibold mb-2">Hiển thị đường nối:</div>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showParentEdges}
            onChange={(e) => setShowParentEdges(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span>Cha/Mẹ - Con</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMarriageEdges}
            onChange={(e) => setShowMarriageEdges(e.target.checked)}
            className="w-4 h-4 text-pink-600 rounded"
          />
          <div className="w-4 h-0.5 bg-pink-400"></div>
          <span>Vợ - Chồng</span>
        </label>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => {
              setShowParentEdges(true);
              setShowMarriageEdges(true);
            }}
            className="text-blue-600 hover:underline mr-2"
          >
            Hiện tất cả
          </button>
          <button
            onClick={() => {
              setShowParentEdges(false);
              setShowMarriageEdges(false);
            }}
            className="text-gray-600 hover:underline"
          >
            Ẩn tất cả
          </button>
        </div>

        {isClusterMode && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="font-semibold mb-2">Thế hệ đang mở:</div>
            {expandedGenerations.size === 0 ? (
              <p className="text-gray-400 italic">Click vào cluster hoặc zoom in để mở</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {Array.from(expandedGenerations).sort((a, b) => a - b).map(gen => (
                  <button
                    key={gen}
                    onClick={() => handleManualCollapse(gen)}
                    className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    Thế hệ {gen + 1} ✕
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                autoExpandDisabledRef.current = true;
                const allGens = new Set(generationGroups.keys());
                setExpandedGenerations(allGens);
              }}
              className="mt-2 text-purple-600 hover:underline mr-2"
            >
              Mở tất cả
            </button>
            <button
              onClick={() => {
                autoExpandDisabledRef.current = true;
                setExpandedGenerations(new Set());
              }}
              className="text-gray-600 hover:underline"
            >
              Đóng tất cả
            </button>
          </div>
        )}
      </div>

      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => {
          setIsPersonModalOpen(false);
          setEditingPerson(null);
          setDefaultParents(null);
        }}
        onSubmit={handlePersonSubmit}
        person={editingPerson}
        familyTreeId={treeId}
        persons={persons}
        defaultParents={defaultParents}
        isLoading={createPerson.isPending || updatePerson.isPending}
      />

      <MarriageModal
        isOpen={isMarriageModalOpen}
        onClose={() => {
          setIsMarriageModalOpen(false);
          setDefaultSpouse(null);
        }}
        onSubmit={handleMarriageSubmit}
        familyTreeId={treeId}
        persons={persons}
        defaultPerson={defaultSpouse}
        isLoading={createMarriage.isPending}
      />
    </div>
  );
}
