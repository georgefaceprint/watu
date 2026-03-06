export default function manifest() {
    return {
        name: 'Watu.Network',
        short_name: 'Watu.Network',
        description: 'A global collaborative family tree tracing connections and heritage.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
