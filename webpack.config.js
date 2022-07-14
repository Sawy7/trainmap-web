const path = require("path")

module.exports = {
    entry: "./src/index.ts",
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
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: "file-loader",
                options: {
                    outputPath: "assets",
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
        minimize: false
    }
}