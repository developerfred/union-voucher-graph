/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSelector } from 'reselect';
import useVouchStore from './vouchStore';


const getGraphData = (state) => state.graphData;
const getFilteredData = (state) => state.filteredData;
const getSelectedNode = (state) => state.selectedNode;
const getSearchTerm = (state) => state.searchTerm;


export const makeGetConnectedNodes = () => {
    return createSelector(
        [getGraphData, getSelectedNode],
        (graphData, selectedNode) => {
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
        }
    );
};


export const getGraphStats = createSelector(
    [getFilteredData],
    (filteredData) => {
        const nodeCount = filteredData.nodes.length;
        const linkCount = filteredData.links.length;


        const totalAmountVouched = filteredData.nodes.reduce(
            (sum, node) => sum + (parseInt(node.amountVouched || 0) / 1e6),
            0
        );

        const topVouchers = [...filteredData.nodes]
            .sort((a, b) => (b.vouchesGiven || 0) - (a.vouchesGiven || 0))
            .slice(0, 5);

        const topReceivers = [...filteredData.nodes]
            .sort((a, b) => (b.vouchesReceived || 0) - (a.vouchesReceived || 0))
            .slice(0, 5);

        return {
            nodeCount,
            linkCount,
            totalAmountVouched: totalAmountVouched.toFixed(2),
            topVouchers,
            topReceivers
        };
    }
);


export function useConnectedNodes() {
    const getConnectedNodes = makeGetConnectedNodes();
    const selectedNode = useVouchStore(state => state.selectedNode);
    const graphData = useVouchStore(state => state.graphData);

    return getConnectedNodes({ graphData, selectedNode });
}


export function useGraphStats() {
    const filteredData = useVouchStore(state => state.filteredData);

    return getGraphStats({ filteredData });
}


export function useVouchVisualization() {
    return useVouchStore(state => ({
        loading: state.loading,
        error: state.error,
        searchTerm: state.searchTerm,
        setSearchTerm: state.setSearchTerm,
        selectedNode: state.selectedNode,
        setSelectedNode: state.setSelectedNode,
        clearSelectedNode: state.clearSelectedNode,
        showDetails: state.showDetails,
        setShowDetails: state.setShowDetails,
        formatTimestamp: state.formatTimestamp,
        fetchGraphData: state.fetchGraphData
    }));
}