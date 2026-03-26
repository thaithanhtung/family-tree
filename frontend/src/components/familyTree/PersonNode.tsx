import { memo, useMemo } from 'react';
import { Handle, Position, useStore } from '@xyflow/react';
import type { Person } from '../../types';

export interface PersonNodeData extends Record<string, unknown> {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
}

interface PersonNodeProps {
  data: PersonNodeData;
}

const zoomSelector = (state: any) => state.transform[2];

function PersonNodeComponent({ data }: PersonNodeProps) {
  const { person, onEdit, onDelete, onAddChild, onAddSpouse } = data;
  const zoom = useStore(zoomSelector);

  const age = useMemo(() => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate);
    const end = person.isDeceased && person.deathDate 
      ? new Date(person.deathDate) 
      : new Date();
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }, [person.birthDate, person.deathDate, person.isDeceased]);

  const isMale = person.gender === 'MALE';
  const bgColor = isMale ? '#3b82f6' : '#ec4899';
  const shortName = person.name.split(' ').pop() || person.name;

  // Ultra simplified - zoom < 0.25
  if (zoom < 0.25) {
    return (
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: bgColor }}>
        <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
      </div>
    );
  }

  // Simplified - zoom < 0.4
  if (zoom < 0.4) {
    return (
      <div className="relative">
        <Handle type="target" position={Position.Top} id="top" style={{ background: '#9ca3af', width: 6, height: 6 }} />
        <Handle type="source" position={Position.Left} id="left" style={{ background: '#f472b6', width: 6, height: 6, top: '50%' }} />
        <Handle type="target" position={Position.Right} id="right" style={{ background: '#f472b6', width: 6, height: 6, top: '50%' }} />
        <div
          className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate"
          style={{ backgroundColor: bgColor, maxWidth: 60, opacity: person.isDeceased ? 0.6 : 1 }}
        >
          {shortName}
        </div>
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#9ca3af', width: 6, height: 6 }} />
      </div>
    );
  }

  // Medium - zoom < 0.7
  if (zoom < 0.7) {
    return (
      <div className="relative" style={{ minWidth: 90 }}>
        <Handle type="target" position={Position.Top} id="top" style={{ background: '#9ca3af', width: 8, height: 8 }} />
        <Handle type="source" position={Position.Left} id="left" style={{ background: '#f472b6', width: 8, height: 8, top: '50%' }} />
        <Handle type="target" position={Position.Right} id="right" style={{ background: '#f472b6', width: 8, height: 8, top: '50%' }} />
        <div
          className="bg-white rounded shadow p-1.5 border-l-2"
          style={{ borderLeftColor: bgColor, opacity: person.isDeceased ? 0.7 : 1 }}
        >
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: bgColor }}
            >
              {person.name.charAt(0)}
            </div>
            <span className="text-[11px] font-medium truncate">{shortName}</span>
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#9ca3af', width: 8, height: 8 }} />
      </div>
    );
  }

  // Full view - zoom >= 0.7
  return (
    <div className="relative group" style={{ minWidth: 160 }}>
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#9ca3af', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ background: '#f472b6', width: 10, height: 10, top: '50%' }} />
      <Handle type="target" position={Position.Right} id="right" style={{ background: '#f472b6', width: 10, height: 10, top: '50%' }} />

      <div
        className="bg-white rounded-lg shadow-md border-l-4 overflow-hidden"
        style={{ borderLeftColor: person.branchColor || bgColor, opacity: person.isDeceased ? 0.8 : 1 }}
      >
        <div className="h-0.5" style={{ backgroundColor: person.branchColor || bgColor }} />
        <div className="p-2">
          <div className="flex items-center gap-2 mb-1">
            {person.avatar ? (
              <img src={person.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: bgColor }}
              >
                {person.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate text-xs">{person.name}</h3>
              <p className="text-[10px] text-gray-500">
                {isMale ? 'Nam' : 'Nữ'}
                {age !== null && ` • ${age}t`}
                {person.isDeceased && ' †'}
              </p>
            </div>
          </div>

          <div className="flex gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(person)} className="flex-1 px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Sửa</button>
            <button onClick={() => onAddChild(person)} className="flex-1 px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded hover:bg-green-200">+Con</button>
            <button onClick={() => onAddSpouse(person)} className="flex-1 px-1.5 py-0.5 text-[10px] bg-pink-100 text-pink-700 rounded hover:bg-pink-200">+V/C</button>
            <button onClick={() => onDelete(person)} className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded hover:bg-red-200">X</button>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#9ca3af', width: 10, height: 10 }} />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent, (prev: PersonNodeProps, next: PersonNodeProps) => {
  return (
    prev.data.person.id === next.data.person.id &&
    prev.data.person.name === next.data.person.name &&
    prev.data.person.avatar === next.data.person.avatar &&
    prev.data.person.gender === next.data.person.gender &&
    prev.data.person.isDeceased === next.data.person.isDeceased &&
    prev.data.person.branchColor === next.data.person.branchColor
  );
});
