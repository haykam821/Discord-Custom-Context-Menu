const webpack = require("webpack");

module.exports = {
	entry: "./src/index.jsx",
	mode: process.env.WEBPACK_MODE || "production",
	module: {
		rules: [{
			test: /\.jsx$/,
			use: "jsx-loader",
		}],
	},
	output: {
		filename: "CustomContextMenu.plugin.js",
		path: __dirname + "/dist",
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: "//META{\"name\":\"CustomContextMenu\"}*//",
			raw: true,
		}),
	],
	target: "node",
};