/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use client'
import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import useVouchStore from '@/store/vouchStore';
import EnhancedSearch from './EnhancedSearch';
import { getHighlightedText } from '@/app/components/utils/search-highlight';

interface UnionVouchGraphProps {
    darkMode?: boolean;
}


const generateHighlightedHTML = (text, searchTerm, darkMode) => {
    if (!searchTerm || !text) return text;

    const segments = getHighlightedText(text, searchTerm, false);

    let html = '';
    segments.forEach(segment => {
        if (segment.isMatch) {
            html += `<tspan class="${darkMode ? 'fill-yellow-300' : 'fill-yellow-500'} font-bold">${segment.text}</tspan>`;
        } else {
            html += `<tspan>${segment.text}</tspan>`;
        }
    });

    return html;
};

const UnionVouchGraph: React.FC<UnionVouchGraphProps> = ({ darkMode = false }) => {
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

        // Set background color based on dark mode
        const svg = d3.select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .style("background-color", darkMode ? "#1f2937" : "#ffffff");


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
            .attr("fill", darkMode ? "#999" : "#777")
            .attr("d", "M0,-5L10,0L0,5");


        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke", darkMode ? "#777" : "#999")
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
            .attr("fill", darkMode ? "#374151" : "white")
            .attr("opacity", 0.8)
            .attr("rx", 3)
            .attr("ry", 3);


        const linkLabels = linkLabelGroups.append("text")
            .text(d => d.value)
            .attr("font-size", 10)
            .attr("fill", darkMode ? "#d1d5db" : "#333")
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

        // Add clickable transparent circle with larger radius
        node.append("circle")
            .attr("r", d => d.val + 10) // Larger radius for better click target
            .attr("fill", "transparent") // Make it invisible
            .style("cursor", "pointer") // Show pointer cursor on hover
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedNode(d);
            });

        // Add the visible circle
        node.append("circle")
            .attr("r", d => d.val)
            .attr("fill", d => d.color)
            .attr("stroke", darkMode ? "#374151" : "#fff")
            .attr("stroke-width", 1.5);

        // Add click handler to the node group
        node.on("click", (event, d) => {
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
            .attr("pointer-events", "none") // Prevent text from capturing clicks
            .each(function (d) {
                    // Use SVG tspan elements for search highlighting
                    const textElement = d3.select(this);
            
                    if (searchTerm && d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        // Create highlighted version with tspan elements
                        const segments = getHighlightedText(d.name, searchTerm, false);
            
                        segments.forEach(segment => {
                            textElement.append("tspan")
                                .attr("font-weight", segment.isMatch ? "bold" : "normal")
                                .attr("fill", segment.isMatch ? (darkMode ? "#fde047" : "#eab308") : (darkMode ? "#d1d5db" : "#333"))
                                .text(segment.text);
                        });
                    } else {
                        // No highlight needed, just set the text
                        textElement.text(d.name);
                    }
                })
            .attr("font-size", 10)
            .attr("fill", darkMode ? "#d1d5db" : "#333");


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
            // Keep nodes fixed after dragging
            // d.fx = null;
            // d.fy = null;
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
                .attr("stroke", d => connectedLinks.has(d) ? "red" : (darkMode ? "#777" : "#999"))
                .attr("stroke-width", d => connectedLinks.has(d) ? 3 : 1)
                .attr("stroke-opacity", d => connectedLinks.has(d) ? 1 : 0.6);


            node.select("circle:not([fill='transparent'])") // Select only the visible circle
                .attr("fill", d => {
                    // If this node is selected
                    if (selectedNode && d.id === selectedNode.id) return "yellow";

                    // If this node is connected to selected node
                    if (selectedNode && connectedNodeIds.has(d.id)) return "yellow";

                    // If search is active and this node matches
                    if (searchTerm &&
                        ((d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))) {
                        return "#f97316"; // Orange highlight for search matches
                    }

                    // Default color
                    return d.color;
                })
                .attr("r", d => {
                    // If this node is selected
                    if (selectedNode && d.id === selectedNode.id) return d.val + 5;

                    // If this node is connected to selected node
                    if (selectedNode && connectedNodeIds.has(d.id)) return d.val + 2;

                    // If search is active and this node matches
                    if (searchTerm &&
                        ((d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))) {
                        return d.val + 3; // Slightly larger for search matches
                    }

                    // Default size
                    return d.val;
                })
                .attr("stroke", d => {
                    // If search is active and this node matches
                    if (searchTerm &&
                        ((d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))) {
                        return "#f97316"; // Orange stroke for search matches
                    }

                    // Default stroke
                    return darkMode ? "#374151" : "#fff";
                })
                .attr("stroke-width", d => {
                    // If search is active and this node matches
                    if (searchTerm &&
                        ((d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))) {
                        return 2.5; // Thicker stroke for search matches
                    }

                    // Default stroke width
                    return 1.5;
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
    }, [dimensions, filteredData, selectedNode, loading, setSelectedNode, clearSelectedNode, darkMode]);

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
                <div className={`text-red-500 text-center ${darkMode ? 'bg-gray-800' : ''}`}>
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
            <div className={`p-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} border-b border-opacity-20`}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0 mb-4">
                    <h1 className="text-2xl font-bold">Union Vouching Network</h1>
                    <EnhancedSearch
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        darkMode={darkMode}
                        placeholder="Search by name or address..."
                    />

                </div>
                <div className="flex justify-between items-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click on a node to view vouching details. Drag nodes to rearrange.
                    </p>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {filteredData.nodes.length} users / {filteredData.links.length} vouches
                    </div>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden">
                <div className={`flex-grow relative ${darkMode ? 'bg-gray-800' : 'bg-white'} ${showDetails && selectedNode ? 'md:w-3/4' : 'w-full'}`}>
                    {graphData.nodes.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No vouching data available</div>
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
                    <div className={`w-full md:w-1/4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-l overflow-y-auto shadow-lg transition-colors duration-200`} style={{ height: dimensions.height }}>
                        <div className={`p-4 sticky top-0 ${darkMode ? 'bg-gray-700' : 'bg-white'} border-b z-10`}>
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-lg">{selectedNode.name}</h2>
                                <button
                                    className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} p-1 hover:bg-opacity-10 hover:bg-gray-500 rounded-full`}
                                    onClick={() => clearSelectedNode()}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>{selectedNode.address}</div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-2 rounded`}>
                                    <div className={`text-sm font-medium ${darkMode ? 'text-blue-100' : ''}`}>Vouches Given</div>
                                    <div className="text-lg font-semibold">{selectedNode.vouchesGiven || 0}</div>
                                </div>
                                <div className={`${darkMode ? 'bg-green-900' : 'bg-green-50'} p-2 rounded`}>
                                    <div className={`text-sm font-medium ${darkMode ? 'text-green-100' : ''}`}>Vouches Received</div>
                                    <div className="text-lg font-semibold">{selectedNode.vouchesReceived || 0}</div>
                                </div>
                                <div className={`${darkMode ? 'bg-purple-900' : 'bg-purple-50'} p-2 rounded`}>
                                    <div className={`text-sm font-medium ${darkMode ? 'text-purple-100' : ''}`}>Amount Vouched</div>
                                    <div className="text-lg font-semibold">
                                        ${selectedNode.amountVouched ? (parseInt(selectedNode.amountVouched) / 1e6).toFixed(2) : '0'}
                                    </div>
                                </div>
                                <div className={`${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} p-2 rounded`}>
                                    <div className={`text-sm font-medium ${darkMode ? 'text-yellow-100' : ''}`}>Amount Received</div>
                                    <div className="text-lg font-semibold">
                                        ${selectedNode.amountReceived ? (parseInt(selectedNode.amountReceived) / 1e6).toFixed(2) : '0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold mb-2">Vouching Connections:</h3>
                            {getConnectedNodes().length === 0 ? (
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No connections</p>
                            ) : (
                                <div className="mt-2 overflow-y-auto">
                                    {getConnectedNodes().map((conn, idx) => (
                                        <div key={`${conn.direction}-${conn.id}-${idx}`} className={`mb-3 p-3 border rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50'}`}>
                                            <div className="flex justify-between items-center">
                                                <div className="font-medium">
                                                    {conn.direction === 'outgoing' ? (
                                                        <span className="flex items-center">
                                                            <span className="mr-1">To:</span>
                                                            <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{conn.name}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <span className="mr-1">From:</span>
                                                            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>{conn.name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{conn.value}</div>
                                            </div>
                                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                                {formatTimestamp(conn.timestamp)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {getConnectedNodes().length} total connection(s)
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`p-2 ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-500'} border-t text-xs flex justify-between`}>
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