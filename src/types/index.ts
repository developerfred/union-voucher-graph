/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Common types for the Union Vouch Graph application
 */

// Node in the graph visualization
export interface VouchNode {
    id: string;
    address: string;
    name: string;
    val: number;
    color: string;
    pfpUrl: string | null;
    amountVouched: string;
    amountReceived: string;
    vouchesGiven: number;
    vouchesReceived: number;    
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}


export interface VouchLink {
    source: string | VouchNode;
    target: string | VouchNode;
    value: string;
    rawAmount: string;
    timestamp: number;
}


export interface GraphData {
    nodes: VouchNode[];
    links: VouchLink[];
}


export interface NodeConnection {
    id: string;
    name: string;
    value: string;
    timestamp: number;
    direction: 'incoming' | 'outgoing';
}


export interface GraphStats {
    nodeCount: number;
    linkCount: number;
    totalAmountVouched: string;
    topVouchers: VouchNode[];
    topReceivers: VouchNode[];
}


export interface VouchStoreState {
    graphData: GraphData;
    filteredData: GraphData;
    selectedNode: VouchNode | null;
    loading: boolean;
    error: string | null;
    searchTerm: string;
    showDetails: boolean;


    fetchGraphData: () => Promise<void>;
    setSelectedNode: (node: VouchNode) => void;
    clearSelectedNode: () => void;
    setSearchTerm: (term: string) => void;
    setShowDetails: (show: boolean) => void;
    getConnectedNodes: () => NodeConnection[];
    formatTimestamp: (timestamp: number) => string;
}


export interface ClubEvent {
    type: string;
    timestamp: number;
    amount: string;
    account: {
        id: string;
        __typename: string;
    };
    other: {
        id: string;
        __typename: string;
    } | null;
    __typename: string;
}


export interface AccountDetails {
    id: string;
    amountVouched: string;
    amountReceived: string;
    vouchesGivenCount: number;
    vouchesReceivedCount: number;
    __typename: string;
}


export interface NeynarProfile {
    username?: string;
    display_name?: string;
    pfp_url?: string;
}


// Add these to your types.ts file

export interface VouchStoreState {
    graphData: GraphData;
    filteredData: GraphData;
    selectedNode: VouchNode | null;
    loading: boolean;
    error: string | null;
    searchTerm: string;
    showDetails: boolean;
    isRateLimited: boolean;
    rateLimitRetryTime: Date | null;

    // Functions
    fetchGraphData: () => Promise<void>;
    retryAfterRateLimit: () => Promise<void>;
    setSelectedNode: (node: VouchNode) => void;
    clearSelectedNode: () => void;
    setSearchTerm: (term: string) => void;
    setShowDetails: (show: boolean) => void;
    getConnectedNodes: () => NodeConnection[];
    formatTimestamp: (timestamp: number) => string;
    getRateLimitRemainingTime: () => string | null;
}

// Existing interfaces (for reference - keep these if already defined)
export interface GraphData {
    nodes: VouchNode[];
    links: any[];
}

export interface VouchNode {
    id: string;
    address: string;
    name: string;
    val: number;
    color: string;
    pfpUrl: string | null;
    amountVouched: string;
    amountReceived: string;
    vouchesGiven: number;
    vouchesReceived: number;
}

export interface NodeConnection {
    id: string;
    name: string;
    value: string;
    timestamp: number;
    direction: 'incoming' | 'outgoing';
}

export interface AccountDetails {
    id: string;
    amountVouched: string;
    amountReceived: string;
    vouchesGivenCount: number;
    vouchesReceivedCount: number;
    __typename: string;
}

export interface ClubEvent {
    type: string;
    timestamp: number;
    amount: string;
    account: {
        id: string;
        __typename: string;
    };
    other: {
        id: string;
        __typename: string;
    };
    __typename: string;
}

export interface NeynarProfile {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
        bio: {
            text: string;
        };
    };
}   