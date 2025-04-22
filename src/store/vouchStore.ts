import { create } from 'zustand';
import UnionVouchService from '../services/unionVouchService';


const vouchService = new UnionVouchService();


const useVouchStore = create((set, get) => ({
    graphData: { nodes: [], links: [] },
    filteredData: { nodes: [], links: [] },
    selectedNode: null,
    loading: false,
    error: null,
    searchTerm: '',
    showDetails: false,

    
    fetchGraphData: async () => {
        try {
            set({ loading: true, error: null });
            const data = await vouchService.getVouchGraph();
            set({
                graphData: data,
                filteredData: data,
                loading: false
            });
        } catch (err) {
            console.error("Error fetching graph data:", err);
            set({
                error: err.message || "An unexpected error occurred",
                loading: false
            });
        }
    },

    setSelectedNode: (node) => {
        const currentNode = get().selectedNode;
        if (currentNode && node && currentNode.id === node.id) {
            set({ selectedNode: null, showDetails: false });
        } else {
            set({ selectedNode: node, showDetails: true });
        }
    },

    clearSelectedNode: () => {
        set({ selectedNode: null, showDetails: false });
    },

    setSearchTerm: (term) => {
        set({ searchTerm: term });

        
        const { graphData } = get();
        if (!term.trim()) {
            set({ filteredData: graphData });
            return;
        }

        const termLower = term.toLowerCase();
        const filteredNodes = graphData.nodes.filter(node =>
            node.name.toLowerCase().includes(termLower) ||
            node.address.toLowerCase().includes(termLower)
        );

        const nodeIds = new Set(filteredNodes.map(node => node.id));

        
        const filteredLinks = graphData.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return nodeIds.has(sourceId) || nodeIds.has(targetId);
        });

        
        filteredLinks.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            nodeIds.add(sourceId);
            nodeIds.add(targetId);
        });

        const expandedNodes = graphData.nodes.filter(node => nodeIds.has(node.id));

        set({
            filteredData: {
                nodes: expandedNodes,
                links: filteredLinks
            }
        });
    },

    setShowDetails: (show) => {
        set({ showDetails: show });
    },

    
    getConnectedNodes: () => {
        const { selectedNode, graphData } = get();
        if (!selectedNode) return [];

        const connections = [];
        graphData.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            if (sourceId === selectedNode.id) {
                const targetNode = graphData.nodes.find(n => n.id === targetId);
                connections.push({
                    id: targetId,
                    name: targetNode ? targetNode.name : targetId,
                    value: link.value,
                    timestamp: link.timestamp,
                    direction: 'outgoing'
                });
            } else if (targetId === selectedNode.id) {
                const sourceNode = graphData.nodes.find(n => n.id === sourceId);
                connections.push({
                    id: sourceId,
                    name: sourceNode ? sourceNode.name : sourceId,
                    value: link.value,
                    timestamp: link.timestamp,
                    direction: 'incoming'
                });
            }
        });
 
        return connections.sort((a, b) => b.timestamp - a.timestamp);
    },

    
    formatTimestamp: (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}));

export default useVouchStore;