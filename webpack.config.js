const path = require("path")

module.exports = {
    entry: "./src/index.ts",
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                include: [path.resolve(__dirname, "src")]
            },
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: "file-loader",
                options: {
                    outputPath: "assets",
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/inline",
            },
            {
                test: /\.m?js/,
                resolve: {
                  fullySpecified: false
                }
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, "public"),
        // publicPath: "public/",
        filename: "index.js"
    },
    mode: "production",
    optimization: {
        minimize: true
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
}