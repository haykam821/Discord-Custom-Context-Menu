const webpack = require("webpack");
const path = require("path");

const package = require("./package.json");
const banner = JSON.stringify({
	name: "CustomContextMenu",
	website: package.homepage,
});

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
		path: path.resolve(__dirname, "./dist"),
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: "//META" + banner + "*//",
			raw: true,
		}),
	],
	target: "node",
};