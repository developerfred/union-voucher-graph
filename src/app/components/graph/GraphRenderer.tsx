/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { GraphData, VouchNode } from '@/types';

// Constants for graph rendering
const NODE_BASE_SIZE = 18;
const NODE_SELECTED_INCREASE = 5;
const NODE_HIGHLIGHTED_INCREASE = 2;
const LINK_NORMAL_OPACITY = 0.6;
const LINK_NORMAL_WIDTH = 1;
const LINK_HIGHLIGHTED_OPACITY = 1;
const LINK_HIGHLIGHTED_WIDTH = 3;
const HIT_AREA_INCREASE = 10;

interface GraphRendererProps {
    graphData: GraphData;
    selectedNode: VouchNode | null;
    onNodeClick: (node: VouchNode) => void;
    onBackgroundClick: () => void;
    width: number;
    height: number;
    loading: boolean;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({
    graphData,
    selectedNode,
    onNodeClick,
    onBackgroundClick,
    width,
    height,
    loading
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
    const dragStartedRef = useRef<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Rastrear quando o componente foi montado
    const mountedRef = useRef<boolean>(false);

    // Prepare node and link data to avoid direct mutation
    const nodes = useMemo(() => {
        return graphData.nodes.map(node => ({ ...node }));
    }, [graphData.nodes]);

    const links = useMemo(() => {
        // Create a lookup for nodes by ID for fast reference
        const nodeById = new Map(nodes.map(node => [node.id, node]));

        return graphData.links.map(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            // Only include links where both nodes exist
            if (!nodeById.has(sourceId) || !nodeById.has(targetId)) return null;

            return {
                ...link,
                source: nodeById.get(sourceId),
                target: nodeById.get(targetId)
            };
        }).filter(Boolean);
    }, [graphData.links, nodes]);

    // Create simulation with memoization
    const simulation = useMemo(() => {
        if (nodes.length === 0) return null;

        // Calculate center based on actual container dimensions
        const centerX = width / 2;
        const centerY = height / 2;

        return d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-400).distanceMax(500))
            .force("center", d3.forceCenter(centerX, centerY))
            .force("collide", d3.forceCollide().radius((d: any) => d.val + 5));
    }, [nodes, links, width, height]);

    // Timer para renderização retardada para garantir que o DOM esteja pronto
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            // Pequeno atraso para garantir que o DOM esteja pronto
            const timer = setTimeout(() => {
                setIsInitialized(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Update/create simulation when needed
    useEffect(() => {
        if (!isInitialized) return;

        if (simulationRef.current) {
            simulationRef.current.stop();
        }
        simulationRef.current = simulation;

        // Se temos muitos nós, executamos a simulação por um número fixo de ticks
        if (simulation && nodes.length > 0) {
            // Executa mais ticks para nós com mais dados para melhor estabilidade
            const numTicks = nodes.length > 100 ? 300 :
                nodes.length > 50 ? 200 :
                    nodes.length > 10 ? 100 : 50;

            console.log(`Running simulation for ${numTicks} ticks with ${nodes.length} nodes`);
            simulation.tick(numTicks);

            // Verificar se os nós têm posições válidas
            nodes.forEach(node => {
                if (isNaN(node.x) || isNaN(node.y)) {
                    console.warn('Invalid node position detected:', node);
                    // Atribuir posição aleatória dentro dos limites do SVG
                    node.x = Math.random() * width;
                    node.y = Math.random() * height;
                }
            });
        }

        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [simulation, nodes.length, isInitialized, width, height]);

    // Render graph with D3
    useEffect(() => {
        if (!svgRef.current || !isInitialized || loading || nodes.length === 0) return;

        console.log('Rendering graph with', nodes.length, 'nodes and', links.length, 'links');

        // Reset SVG contents
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Add a background rectangle to catch click events
        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("click", () => onBackgroundClick());

        // Create container for all graph elements
        const g = svg.append("g");

        // Setup zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform.toString());
            });

        svg.call(zoom);

        // Add arrow marker for directed edges
        svg.append("defs").selectAll("marker")
            .data(["arrow"])
            .enter().append("marker")
            .attr("id", d => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", "#999")
            .attr("d", "M0,-5L10,0L0,5");

        // Create links
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", LINK_NORMAL_OPACITY)
            .attr("stroke-width", LINK_NORMAL_WIDTH)
            .attr("marker-end", "url(#arrow)");

        // Create link label groups
        const linkLabelGroups = g.append("g")
            .attr("class", "link-labels")
            .selectAll("g")
            .data(links)
            .enter()
            .append("g");

        // Add background rectangles for link labels
        linkLabelGroups.append("rect")
            .attr("fill", "white")
            .attr("opacity", 0.8)
            .attr("rx", 3)
            .attr("ry", 3);

        // Add text for link labels
        const linkLabels = linkLabelGroups.append("text")
            .text(d => d.value)
            .attr("font-size", 10)
            .attr("fill", "#333")
            .attr("text-anchor", "middle");

        // Size rectangles to fit text
        linkLabelGroups.selectAll("rect")
            .each(function (d, i) {
                const textElement = linkLabels.nodes()[i];
                if (textElement) {
                    const textBBox = textElement.getBBox();
                    d3.select(this)
                        .attr("width", textBBox.width + 6)
                        .attr("height", textBBox.height + 2)
                        .attr("x", textBBox.x - 3)
                        .attr("y", textBBox.y - 1);
                }
            });

        // Create node groups
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter()
            .append("g");

        // Add invisible hit area for better clicking
        node.append("circle")
            .attr("r", d => Math.max(d.val + HIT_AREA_INCREASE, 25))
            .attr("fill", "transparent")
            .attr("cursor", "pointer")
            .attr("class", "node-hitarea");

        // Add visible node circles
        const nodeCircles = node.append("circle")
            .attr("r", d => d.val)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("cursor", "pointer")
            .attr("class", "node-circle");

        // Set up drag behavior
        const drag = d3.drag<SVGGElement, any>()
            .on("start", (event, d) => {
                dragStartedRef.current = true;
                if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
                // Don't reset fx/fy to allow node positioning to persist

                // Use timeout to differentiate between click and drag
                setTimeout(() => {
                    dragStartedRef.current = false;
                }, 100);
            });

        node.call(drag as any);

        // Handle node click
        node.on("click", (event, d) => {
            event.stopPropagation();
            if (!dragStartedRef.current) {
                onNodeClick(d);
            }
        });

        // Ensure clicking works on all node elements
        node.selectAll("circle, image, text").on("click", (event, d) => {
            event.stopPropagation();
            if (!dragStartedRef.current) {
                onNodeClick(d);
            }
        });

        // Add profile images
        node.filter(d => d.pfpUrl)
            .append("clipPath")
            .attr("id", d => `clip-${d.id}`)
            .append("circle")
            .attr("r", d => d.val - 2);

        node.filter(d => d.pfpUrl)
            .append("image")
            .attr("xlink:href", d => d.pfpUrl)
            .attr("x", d => -(d.val - 2))
            .attr("y", d => -(d.val - 2))
            .attr("width", d => (d.val - 2) * 2)
            .attr("height", d => (d.val - 2) * 2)
            .attr("clip-path", d => `url(#clip-${d.id})`)
            .attr("cursor", "pointer");

        // Add node labels
        node.append("text")
            .attr("dy", d => d.val + 10)
            .attr("text-anchor", "middle")
            .text(d => d.name)
            .attr("font-size", 10)
            .attr("fill", "#333")
            .attr("cursor", "pointer");

        // Add tooltips
        node.append("title")
            .text(d => `${d.name}\nVouches Given: ${d.vouchesGiven}\nVouches Received: ${d.vouchesReceived}`);

        // Update node and link positions based on simulation
        const ticked = () => {
            // Manter nós dentro dos limites do SVG
            nodes.forEach(node => {
                node.x = Math.max(node.val, Math.min(width - node.val, node.x));
                node.y = Math.max(node.val, Math.min(height - node.val, node.y));
            });

            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkLabelGroups
                .attr("transform", d => {
                    const midX = (d.source.x + d.target.x) / 2;
                    const midY = (d.source.y + d.target.y) / 2;
                    return `translate(${midX},${midY})`;
                });

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        };

        // Position elements using simulation results
        ticked();

        // Highlight selected node connections if needed
        if (selectedNode) {
            const connectedNodeIds = new Set<string>();
            const connectedLinks = new Set();

            // Find connected nodes and links
            links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                if (sourceId === selectedNode.id) {
                    connectedNodeIds.add(targetId as string);
                    connectedLinks.add(link);
                } else if (targetId === selectedNode.id) {
                    connectedNodeIds.add(sourceId as string);
                    connectedLinks.add(link);
                }
            });

            // Highlight links
            link
                .attr("stroke", d => connectedLinks.has(d) ? "red" : "#999")
                .attr("stroke-width", d => connectedLinks.has(d) ? LINK_HIGHLIGHTED_WIDTH : LINK_NORMAL_WIDTH)
                .attr("stroke-opacity", d => connectedLinks.has(d) ? LINK_HIGHLIGHTED_OPACITY : LINK_NORMAL_OPACITY);

            // Highlight nodes
            node.select(".node-circle")
                .attr("fill", d => {
                    if (d.id === selectedNode.id) return "yellow";
                    if (connectedNodeIds.has(d.id)) return "yellow";
                    return d.color;
                })
                .attr("r", d => {
                    if (d.id === selectedNode.id) return d.val + NODE_SELECTED_INCREASE;
                    if (connectedNodeIds.has(d.id)) return d.val + NODE_HIGHLIGHTED_INCREASE;
                    return d.val;
                });
        }

        // Set initial zoom level based on node count
        if (nodes.length > 50) {
            const initialScale = Math.max(0.5, 50 / nodes.length);
            svg.call(zoom.transform, d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(initialScale)
                .translate(-width / 2, -height / 2));
        }

        // Forçar a renderização chamando um tick adicional
        if (simulationRef.current) {
            simulationRef.current.on("tick", ticked);
            simulationRef.current.alpha(0.3).restart();

            // Parar a simulação após alguns ticks para economizar recursos
            setTimeout(() => {
                if (simulationRef.current) {
                    simulationRef.current.stop();
                }
            }, 3000);
        }

    }, [nodes, links, selectedNode, width, height, loading, onNodeClick, onBackgroundClick, isInitialized]);

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <svg
                ref={svgRef}
                className="w-full h-full"
                width={width}
                height={height}
            />
        </div>
    );
};

export default React.memo(GraphRenderer);