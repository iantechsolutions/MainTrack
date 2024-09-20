
await import('./src/env.js')

/** @type {import("next").NextConfig} */
const nextconfig = {
    experimental: {
        esmExternals: 'loose',
    },
    webpack: (config, { webpack }) => {
        // Add externalsPresets configuration
        config.externalsPresets = {
            node: true, // Enable node.js specific externals (e.g., ignoring built-in modules like fs or path)
        };

        config.plugins.push(new webpack.IgnorePlugin({
            resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
        }));
        
        return config;
    },
};

export default nextconfig;
