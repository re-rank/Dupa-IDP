import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DependencyGraph as DependencyGraphType } from '../types';

interface DependencyGraphProps {
  data: DependencyGraphType;
  width?: number;
  height?: number;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'service' | 'database' | 'external' | 'config';
  technology?: string;
  metadata?: Record<string, any>;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  type: 'api_call' | 'database_connection' | 'file_import' | 'config_reference';
  label?: string;
  metadata?: Record<string, any>;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create container for zoom/pan
    const container = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Prepare nodes and links
    const nodes: D3Node[] = data.nodes.map(node => ({
      ...node,
      x: width / 2 + Math.random() * 100 - 50,
      y: height / 2 + Math.random() * 100 - 50
    }));

    const links: D3Link[] = data.edges.map(edge => ({
      ...edge,
      source: edge.source,
      target: edge.target
    }));

    // Define color scheme
    const nodeColors = {
      service: '#3B82F6',
      database: '#10B981',
      external: '#F59E0B',
      config: '#8B5CF6'
    };

    const linkColors = {
      api_call: '#6B7280',
      database_connection: '#10B981',
      file_import: '#3B82F6',
      config_reference: '#8B5CF6'
    };

    // Create force simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create arrow markers
    const defs = svg.append('defs');
    
    Object.entries(linkColors).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => linkColors[d.type])
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Create link labels
    const linkLabel = container.append('g')
      .selectAll('text')
      .data(links.filter(d => d.label))
      .enter()
      .append('text')
      .attr('font-size', 10)
      .attr('fill', '#6B7280')
      .attr('text-anchor', 'middle')
      .text(d => d.label || '');

    // Create node groups
    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id === selectedNode ? null : d.id);
      })
      .on('mouseenter', (_event, d) => {
        // Hover functionality can be implemented here if needed
        console.log('Hovered:', d.id);
      })
      .on('mouseleave', () => {
        // Hover functionality can be implemented here if needed
      });

    // Add circles to nodes
    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => nodeColors[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add icons to nodes
    const iconMap = {
      service: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
      external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
      config: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    };

    node.append('path')
      .attr('d', d => iconMap[d.type])
      .attr('fill', 'white')
      .attr('transform', 'translate(-12, -12) scale(1)');

    // Add labels to nodes
    node.append('text')
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#374151')
      .text(d => d.label);

    // Add technology labels
    node.filter(d => Boolean(d.technology))
      .append('text')
      .attr('dy', 52)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#6B7280')
      .text(d => d.technology || '');

    // Add drag behavior
    const drag = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!);

      linkLabel
        .attr('x', d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
        .attr('y', d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Highlight on selection
    svg.on('click', () => setSelectedNode(null));

    return () => {
      simulation.stop();
    };
  }, [data, width, height, selectedNode]);

  // Legend
  const nodeTypes = [
    { type: 'service', label: 'Service', color: '#3B82F6' },
    { type: 'database', label: 'Database', color: '#10B981' },
    { type: 'external', label: 'External', color: '#F59E0B' },
    { type: 'config', label: 'Config', color: '#8B5CF6' }
  ];

  return (
    <div className="relative">
      <svg ref={svgRef} className="border border-gray-200 rounded-lg bg-gray-50" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Node Types</h4>
        <div className="space-y-1">
          {nodeTypes.map(({ type, label, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2">
        <div className="flex space-x-2">
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Reset zoom"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
              svg.transition().duration(750).call(
                zoomBehavior.transform as any,
                d3.zoomIdentity
              );
            }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Node details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-md p-4 max-w-md">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">
            {data.nodes.find(n => n.id === selectedNode)?.label}
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Type: {data.nodes.find(n => n.id === selectedNode)?.type}</p>
            {data.nodes.find(n => n.id === selectedNode)?.technology && (
              <p>Technology: {data.nodes.find(n => n.id === selectedNode)?.technology}</p>
            )}
            <div className="mt-2">
              <p className="font-semibold">Connections:</p>
              <ul className="mt-1 space-y-1">
                {data.edges
                  .filter(e => e.source === selectedNode || e.target === selectedNode)
                  .map(e => (
                    <li key={e.id} className="flex items-center space-x-1">
                      <span className="text-gray-500">•</span>
                      <span>
                        {e.source === selectedNode ? 'To' : 'From'} {' '}
                        {data.nodes.find(n => n.id === (e.source === selectedNode ? e.target : e.source))?.label}
                        {e.label && ` (${e.label})`}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyGraph;