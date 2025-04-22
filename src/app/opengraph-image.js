export const runtime = 'edge';
export const alt = 'Union Vouch Graph - Interactive visualization of the vouching network';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
    return new Response(`<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#2563eb"/>
    <text x="50%" y="45%" font-size="60" text-anchor="middle" fill="white" font-weight="bold" font-family="sans-serif">Union Vouch Graph</text>
    <text x="50%" y="55%" font-size="32" text-anchor="middle" fill="white" font-family="sans-serif">Interactive visualization of the Union vouching network</text>
  </svg>`, {
        headers: {
            'Content-Type': 'image/svg+xml',
        },
    });
}