import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export interface ClusterNodeData extends Record<string, unknown> {
  label: string;
  count: number;
  color: string;
  generation: number;
  personIds: number[];
  onExpand: (personIds: number[]) => void;
}

interface ClusterNodeProps {
  data: ClusterNodeData;
}

function ClusterNodeComponent({ data }: ClusterNodeProps) {
  const { label, count, color, onExpand, personIds } = data;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#9ca3af', width: 12, height: 12 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ background: '#f472b6', width: 10, height: 10, top: '50%' }} />
      <Handle type="target" position={Position.Right} id="right" style={{ background: '#f472b6', width: 10, height: 10, top: '50%' }} />

      <div
        className="rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-2xl border-4 border-white/30"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          padding: '20px 32px',
          minWidth: 160,
        }}
        onClick={() => onExpand(personIds)}
        title="Click để mở rộng"
      >
        <div className="text-white text-center">
          <div className="text-4xl font-bold mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            {count.toLocaleString()}
          </div>
          <div className="text-sm font-medium opacity-90">{label}</div>
          <div className="text-xs opacity-70 mt-1">Click để xem</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#9ca3af', width: 12, height: 12 }} />
    </div>
  );
}

export const ClusterNode = memo(ClusterNodeComponent);
