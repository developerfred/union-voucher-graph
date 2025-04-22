/**
 * Service for fetching and processing Union vouching data from GraphQL API
 */
export default class UnionVouchService {
    constructor(apiEndpoint = 'https://subgraph.satsuma-prod.com/e329e1b1c9e9/union--11085/voucher-miniapp/api') {
        this.apiEndpoint = apiEndpoint;
        this.neynarApiEndpoint = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';
        this.neynarApiKey = process.env.REACT_APP_NEYNAR_API_KEY || 'NEYNAR_API_DOCS'; 
    }

    /**
     * Fetch all club events from the subgraph
     * @param {number} limit - Number of events to fetch
     * @returns {Promise<Array>} Array of club events
     */
    async getClubEvents(limit = 100) {
        const query = `
      query GetClubEvents($limit: Int!) {
        clubEvents(first: $limit, orderBy: timestamp, orderDirection: desc) {
          type
          timestamp
          amount
          account {
            id
            __typename
          }
          other {
            id
            __typename
          }
          __typename
        }
      }
    `;

        const variables = { limit };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables,
                    operationName: 'GetClubEvents'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.data.clubEvents;
        } catch (error) {
            console.error('Error fetching club events:', error);
            throw error;
        }
    }

    /**
     * Fetch account details for a specific address
     * @param {string} address - Ethereum address
     * @returns {Promise<Object>} Account details
     */
    async getAccountDetails(address) {
        const query = `
      query GetAccount($address: ID!) {
        account(id: $address) {
          id
          amountVouched
          amountReceived
          vouchesGivenCount
          vouchesReceivedCount
          __typename
        }
      }
    `;

        const variables = { address };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables,
                    operationName: 'GetAccount'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.data.account;
        } catch (error) {
            console.error(`Error fetching account details for ${address}:`, error);
            return null;
        }
    }

    /**
     * Fetch profile information from Neynar API
     * @param {Array<string>} addresses - Array of Ethereum addresses
     * @returns {Promise<Object>} Profile information
     */
    async getProfilesFromNeynar(addresses) {
        if (!addresses || addresses.length === 0) return {};

        try {
            const addressesStr = addresses.join(',');
            const response = await fetch(`${this.neynarApiEndpoint}?addresses=${addressesStr}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.neynarApiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Neynar API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching profiles from Neynar:', error);
            return {};
        }
    }

    /**
     * Transform clubEvents into graph data with nodes and links
     * @param {Array} clubEvents - Array of club events from the API
     * @returns {Promise<{nodes: Array, links: Array}>} Graph data
     */
    async transformToGraphData(clubEvents) {
        // Filter for VOUCHED events only
        const vouchedEvents = clubEvents.filter(event => event.type === 'VOUCHED' && event.other);

        // Extract unique addresses
        const addresses = new Set();
        vouchedEvents.forEach(event => {
            addresses.add(event.account.id);
            if (event.other) addresses.add(event.other.id);
        });

        // Fetch profiles in bulk
        const addressesArray = Array.from(addresses);
        const profiles = await this.getProfilesFromNeynar(addressesArray);

        // Create nodes
        const nodes = [];
        const nodeMap = new Map();

        for (const address of addressesArray) {
            // Get account details from subgraph
            const accountDetails = await this.getAccountDetails(address);

            // Get profile from Neynar data if available
            const profile = profiles[address] && profiles[address][0];

            const nodeId = address.toLowerCase();
            const node = {
                id: nodeId,
                address: nodeId,
                name: profile ? (profile.username || profile.display_name) : this.formatAddress(address),
                val: 20, 
                color: this.getNodeColor(accountDetails), 
                pfpUrl: profile ? profile.pfp_url : null,
                amountVouched: accountDetails ? accountDetails.amountVouched : "0",
                amountReceived: accountDetails ? accountDetails.amountReceived : "0",
                vouchesGiven: accountDetails ? accountDetails.vouchesGivenCount : 0,
                vouchesReceived: accountDetails ? accountDetails.vouchesReceivedCount : 0
            };

            nodes.push(node);
            nodeMap.set(nodeId, node);
        }

        
        const links = vouchedEvents.map(event => {
            const source = event.account.id.toLowerCase();
            const target = event.other.id.toLowerCase();

            
            const amountInEth = event.amount ? (parseInt(event.amount) / 1e6).toFixed(2) : "0";

            return {
                source,
                target,
                value: `$${amountInEth}`,
                rawAmount: event.amount,
                timestamp: event.timestamp
            };
        });

        
        nodes.forEach(node => {
        
            const receivedVouches = links.filter(link => link.target === node.id).length;
            const givenVouches = links.filter(link => link.source === node.id).length;
        
            node.val = 20 + (receivedVouches + givenVouches) * 2;
        });

        return { nodes, links };
    }

    /**
     * Fetch all data needed for the graph
     * @returns {Promise<{nodes: Array, links: Array}>} Graph data
     */
    async getVouchGraph() {
        try {
            const clubEvents = await this.getClubEvents(200); 
            return await this.transformToGraphData(clubEvents);
        } catch (error) {
            console.error('Error generating vouch graph:', error);
            throw new Error('Failed to generate vouching graph data');
        }
    }

    /**
     * Format Ethereum address for display
     * @param {string} address - Ethereum address
     * @returns {string} Formatted address
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    /**
     * Get color for node based on account activity
     * @param {Object} account - Account details
     * @returns {string} Hex color code
     */
    getNodeColor(account) {
        if (!account) return '#607D8B'; // Default gray

        // Color based on vouch activity
        if (account.vouchesGivenCount > 10) return '#4CAF50'; // Active voucher - green
        if (account.vouchesReceivedCount > 10) return '#2196F3'; // Popular recipient - blue
        if (account.amountVouched > 100000000) return '#FF9800'; // Big voucher - orange
        if (account.amountReceived > 100000000) return '#9C27B0'; // Big recipient - purple

        return '#607D8B'; // Default gray
    }
}