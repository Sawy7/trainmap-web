const path = require("path")
var webpack = require("webpack");

module.exports = {
    entry: {
        "index": "./src/index.ts",
        "login/login": "./src/login.ts",
        "first-setup/first-setup": "./src/first-setup.ts",
        "offlinestoragesw": "./src/offlinestoragesw.ts"
    },
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {
            buffer: require.resolve("buffer/"),
        }
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
        filename: "[name].js"
    },
    mode: "production",
    optimization: {
        minimize: false
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ]
}