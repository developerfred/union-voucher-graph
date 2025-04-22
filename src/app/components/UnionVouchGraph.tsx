/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'
import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import useVouchStore from '../../store/vouchStore';


const UnionVouchGraph = () => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const simulationRef = useRef(null);
    
    const {
        graphData,
        filteredData,
        selectedNode,
        loading,
        error,
        searchTerm,
        showDetails,
        fetchGraphData,
        setSelectedNode,
        clearSelectedNode,
        setSearchTerm,
        getConnectedNodes,
        formatTimestamp
    } = useVouchStore();

    
    const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });

    
    useEffect(() => {
        fetchGraphData();
    }, [fetchGraphData]);

    
    useEffect(() => {
        const handleResize = _.debounce(() => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: Math.max(600, window.innerHeight * 0.7)
                });
            }
        }, 200);

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, []);

    
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || loading || filteredData.nodes.length === 0) return;

        
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

        
        const g = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        
        const nodeById = {};
        const nodes = JSON.parse(JSON.stringify(filteredData.nodes)); 
        nodes.forEach(node => {
            nodeById[node.id] = node;
        });

        
        const links = filteredData.links.map(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

        
            if (!nodeById[sourceId] || !nodeById[targetId]) return null;

            return {
                ...link,
                source: nodeById[sourceId],
                target: nodeById[targetId]
            };
        }).filter(Boolean);

        
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-400).distanceMax(500))
            .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force("collide", d3.forceCollide().radius(d => d.val + 5));

        simulationRef.current = simulation;

        
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

        
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrow)");

        
        const linkLabelGroups = g.append("g")
            .attr("class", "link-labels")
            .selectAll("g")
            .data(links)
            .enter()
            .append("g");

        
        linkLabelGroups.append("rect")
            .attr("fill", "white")
            .attr("opacity", 0.8)
            .attr("rx", 3)
            .attr("ry", 3);

        
        const linkLabels = linkLabelGroups.append("text")
            .text(d => d.value)
            .attr("font-size", 10)
            .attr("fill", "#333")
            .attr("text-anchor", "middle");

        
        linkLabelGroups.selectAll("rect")
            .each(function (d, i) {
                const textElement = linkLabels.nodes()[i];
                const textBBox = textElement.getBBox();
                d3.select(this)
                    .attr("width", textBBox.width + 6)
                    .attr("height", textBBox.height + 2)
                    .attr("x", textBBox.x - 3)
                    .attr("y", textBBox.y - 1);
            });

        
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        
        node.append("circle")
            .attr("r", d => d.val)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedNode(d);
            });

        
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
            .attr("clip-path", d => `url(#clip-${d.id})`);


        node.append("text")
            .attr("dy", d => d.val + 10)
            .attr("text-anchor", "middle")
            .text(d => d.name)
            .attr("font-size", 10)
            .attr("fill", "#333");

        
        node.append("title")
            .text(d => `${d.name}\nVouches Given: ${d.vouchesGiven}\nVouches Received: ${d.vouchesReceived}`);

        
        svg.on("click", () => {
            clearSelectedNode();
        });

        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            
        }

        
        const ticked = () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkLabelGroups
                .attr("transform", d => `translate(${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2})`);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        };

        
        if (nodes.length > 100) {        
            simulation.tick(100);
            ticked();
            simulation.stop();
        } else {
            simulation.on("tick", ticked);
        }

        
        if (selectedNode) {
            highlightConnections();
        }

        function highlightConnections() {
            const connectedNodeIds = new Set();
            const connectedLinks = new Set();

            
            links.forEach(link => {
                if (link.source.id === selectedNode.id) {
                    connectedNodeIds.add(link.target.id);
                    connectedLinks.add(link);
                } else if (link.target.id === selectedNode.id) {
                    connectedNodeIds.add(link.source.id);
                    connectedLinks.add(link);
                }
            });

            
            link
                .attr("stroke", d => connectedLinks.has(d) ? "red" : "#999")
                .attr("stroke-width", d => connectedLinks.has(d) ? 3 : 1)
                .attr("stroke-opacity", d => connectedLinks.has(d) ? 1 : 0.6);

            
            node.select("circle")
                .attr("fill", d => {
                    if (d.id === selectedNode.id) return "yellow";
                    if (connectedNodeIds.has(d.id)) return "yellow";
                    return d.color;
                })
                .attr("r", d => {
                    if (d.id === selectedNode.id) return d.val + 5;
                    if (connectedNodeIds.has(d.id)) return d.val + 2;
                    return d.val;
                });
        }

        
        if (nodes.length > 50) {
            const initialScale = Math.max(0.5, 50 / nodes.length);
            svg.call(zoom.transform, d3.zoomIdentity
                .translate(dimensions.width / 2, dimensions.height / 2)
                .scale(initialScale)
                .translate(-dimensions.width / 2, -dimensions.height / 2));
        }

        return () => {
            if (simulation) simulation.stop();
        };
    }, [dimensions, filteredData, selectedNode, loading, setSelectedNode, clearSelectedNode]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500 text-center">
                    <div className="text-xl mb-2">Error</div>
                    <div>{error}</div>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => fetchGraphData()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full" ref={containerRef}>
            <div className="p-4 bg-gray-100 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Union Vouching Network</h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="px-4 py-2 border rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-2 top-2 text-gray-500"
                                onClick={() => setSearchTerm('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-sm">Click on a node to view vouching details. Drag nodes to rearrange.</p>
            </div>

            <div className="flex flex-grow overflow-hidden">
                <div className={`flex-grow relative bg-white ${showDetails && selectedNode ? 'md:w-3/4' : 'w-full'}`}>
                    {graphData.nodes.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-gray-500">No vouching data available</div>
                        </div>
                    ) : (
                        <svg
                            ref={svgRef}
                            className="w-full h-full"
                            width={dimensions.width}
                            height={dimensions.height}
                        />
                    )}
                </div>

                {showDetails && selectedNode && (
                    <div className="w-full md:w-1/4 bg-white border-l overflow-y-auto shadow-lg" style={{ height: dimensions.height }}>
                        <div className="p-4 sticky top-0 bg-white border-b z-10">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-lg">{selectedNode.name}</h2>
                                <button
                                    className="text-gray-500 p-1"
                                    onClick={() => clearSelectedNode()}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{selectedNode.address}</div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-blue-50 p-2 rounded">
                                    <div className="text-sm font-medium">Vouches Given</div>
                                    <div className="text-lg font-semibold">{selectedNode.vouchesGiven || 0}</div>
                                </div>
                                <div className="bg-green-50 p-2 rounded">
                                    <div className="text-sm font-medium">Vouches Received</div>
                                    <div className="text-lg font-semibold">{selectedNode.vouchesReceived || 0}</div>
                                </div>
                                <div className="bg-purple-50 p-2 rounded">
                                    <div className="text-sm font-medium">Amount Vouched</div>
                                    <div className="text-lg font-semibold">
                                        ${selectedNode.amountVouched ? (parseInt(selectedNode.amountVouched) / 1e6).toFixed(2) : '0'}
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded">
                                    <div className="text-sm font-medium">Amount Received</div>
                                    <div className="text-lg font-semibold">
                                        ${selectedNode.amountReceived ? (parseInt(selectedNode.amountReceived) / 1e6).toFixed(2) : '0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold mb-2">Vouching Connections:</h3>
                            {getConnectedNodes().length === 0 ? (
                                <p className="text-gray-500">No connections</p>
                            ) : (
                                <div className="mt-2 overflow-y-auto">
                                    {getConnectedNodes().map((conn, idx) => (
                                        <div key={`${conn.direction}-${conn.id}-${idx}`} className="mb-3 p-3 border rounded bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div className="font-medium">
                                                    {conn.direction === 'outgoing' ? (
                                                        <span className="flex items-center">
                                                            <span className="mr-1">To:</span>
                                                            <span className="text-blue-600">{conn.name}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <span className="mr-1">From:</span>
                                                            <span className="text-green-600">{conn.name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-green-600 font-medium">{conn.value}</div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatTimestamp(conn.timestamp)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 text-sm text-gray-500">
                                {getConnectedNodes().length} total connection(s)
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-2 bg-gray-100 border-t text-xs text-gray-500 flex justify-between">
                <div>
                    {filteredData.nodes.length} users / {filteredData.links.length} vouches
                </div>
                <div>
                    {searchTerm ? 'Filtered view' : 'Showing all data'}
                </div>
            </div>
        </div>
    );
};

export default UnionVouchGraph;