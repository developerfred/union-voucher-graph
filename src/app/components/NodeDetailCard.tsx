import React from 'react';

export default function NodeDetailCard({ node, connections, onClose, formatTimestamp }) {
    if (!node) return null;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">{node.name}</h2>
                <button
                    className="text-gray-500 p-1"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
            <div className="text-xs text-gray-500 mb-2">{node.address}</div>

            <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-blue-50 p-2 rounded">
                    <div className="text-sm font-medium">Vouches Given</div>
                    <div className="text-lg font-semibold">{node.vouchesGiven || 0}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                    <div className="text-sm font-medium">Vouches Received</div>
                    <div className="text-lg font-semibold">{node.vouchesReceived || 0}</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                    <div className="text-sm font-medium">Amount Vouched</div>
                    <div className="text-lg font-semibold">
                        ${node.amountVouched ? (parseInt(node.amountVouched) / 1e6).toFixed(2) : '0'}
                    </div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-sm font-medium">Amount Received</div>
                    <div className="text-lg font-semibold">
                        ${node.amountReceived ? (parseInt(node.amountReceived) / 1e6).toFixed(2) : '0'}
                    </div>
                </div>
            </div>

            <h3 className="font-semibold mt-4 mb-2">Vouching Connections:</h3>
            {connections.length === 0 ? (
                <p className="text-gray-500">No connections</p>
            ) : (
                <div className="mt-2 max-h-60 overflow-y-auto">
                    {connections.map((conn, idx) => (
                        <div key={`${conn.direction}-${conn.id}-${idx}`} className="mb-2 p-2 border rounded bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="font-medium text-sm">
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
                                <div className="text-green-600 font-medium text-sm">{conn.value}</div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(conn.timestamp)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
                {connections.length} total connection(s)
            </div>
        </div>
    );
}