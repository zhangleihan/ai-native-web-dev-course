'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from 'reactflow';

export interface FdeNodeData {
  label: string;
  sub?: string;
  color: string;
  badge?: string;
}

function FdeNode({ data, selected }: NodeProps<FdeNodeData>) {
  return (
    <div
      className="fde-node"
      style={{
        borderColor: selected ? data.color : `${data.color}66`,
        boxShadow: selected ? `0 0 0 3px ${data.color}22` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: data.color, width: 6, height: 6 }} />
      <Handle type="target" id="left" position={Position.Left} style={{ background: data.color, width: 6, height: 6 }} />
      {data.badge && (
        <span className="badge" style={{ background: data.color }}>
          {data.badge}
        </span>
      )}
      <div className="t">{data.label}</div>
      {data.sub && <div className="s">{data.sub}</div>}
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 6, height: 6 }} />
      <Handle type="source" id="right" position={Position.Right} style={{ background: data.color, width: 6, height: 6 }} />
    </div>
  );
}

export default function FlowCanvas({
  nodes,
  edges,
  height = 560,
  onNodeClick,
  minimap = true,
}: {
  nodes: Node<FdeNodeData>[];
  edges: Edge[];
  height?: number | string;
  onNodeClick?: (id: string) => void;
  minimap?: boolean;
}) {
  const nodeTypes = useMemo(() => ({ fde: FdeNode }), []);
  return (
    <div
      style={{
        height,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--fde-border)',
        background: '#fbfcfe',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background color="#dfe6f0" gap={18} size={1} />
        <Controls showInteractive={false} />
        {minimap && (
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => (n.data as FdeNodeData).color}
            style={{ background: '#fff', border: '1px solid var(--fde-border)' }}
          />
        )}
      </ReactFlow>
    </div>
  );
}
