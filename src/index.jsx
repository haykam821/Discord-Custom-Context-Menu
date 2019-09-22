const { version, author, description } = require("../package.json");

const React = BdApi.React;

const semver = require("semver");

const yaml = require("js-yaml");

const mapObj = require("map-obj");

const format = require("string-format");
const deepFormat = (obj, ...props) => mapObj(obj, (key, val) => {
	if (typeof val === "string") {
		return [key, format(val, ...props)];
	}
	return [key, val];
}, {
	deep: true,
});

const MessageContextMenu = BdApi.findModuleByDisplayName("MessageContextMenu");
const MenuItem = BdApi.findModuleByDisplayName("MenuItem");
const { closeContextMenu } = BdApi.findModuleByProps("closeContextMenu");

class CustomContextMenu {
	constructor() {
		this.unpatch = null;
	}

	getName() {
		return "Custom Context Menu";
	}
	getDescription() {
		return description;
	}
	getVersion() {
		return version;
	}
	getAuthor() {
		return author;
	}

	getSettingsPanel() {
		const textArea = document.createElement("textarea");

		textArea.rows = 30;
		textArea.placeholder = "Insert your custom context menus here!";

		textArea.style.width = "100%";
		textArea.style.height = "100%";
		textArea.style.resize = "none";
		textArea.style.fontFamily = "monospace";

		textArea.value = BdApi.loadData("CustomContextMenu", "menus") || "";
		textArea.addEventListener("input", () => {
			BdApi.saveData("CustomContextMenu", "menus", textArea.value);
			BdApi.saveData("CustomContextMenu", "syntaxVersion", version);
		});

		textArea.addEventListener("keydown", event => {
			if (event.code !== "Tab") return;
			event.preventDefault();

			textArea.value = textArea.value.substr(0, textArea.selectionStart) + "    " + textArea.value.substr(textArea.selectionStart, textArea.value.length);
		});

		return textArea;
	}
	start() {
		const syntaxVersion = BdApi.loadData("CustomContextMenu", "syntaxVersion");
		if (syntaxVersion === undefined || semver.gt(syntaxVersion, version)) {
			BdApi.showToast(`The custom menu settings you have were saved in a newer version (v${syntaxVersion}) than what you have installed (v${version}). Problems may occur.`, {
				type: "warning",
			});
		}

		if (!global.ZeresPluginLibrary) {
			BdApi.showToast("Install Zere's Plugin Library to take advantage of context menu actions such as sending messages.", {
				type: "warning",
			});
		}

		// Load YAML
		let settings = {};
		try {
			settings = yaml.safeLoad(BdApi.loadData("CustomContextMenu", "menus"));
		} catch (error) {
			return BdApi.alert("Loading error", error.toString());
		}

		// Handle structure errors
		if (typeof settings !== "object" || settings === null) {
			return BdApi.alert("Invalid context menu definitions", "You supplied a " + typeof settings + " rather than an object.");
		}
		if (Array.isArray(settings)) {
			return BdApi.alert("Invalid context menu definitions", "You supplied an array rather than an object.");
		}

		// Patch to include new context menu items
		this.unpatch = BdApi.monkeyPatch(MessageContextMenu.prototype, "render", {
			instead: data => {
				const props = data.thisObject.props;
				const placeholders = {
					...props,
					/* eslint-disable camelcase */
					author_mention: props.message.author.id ? `<@${props.message.author.id}>` : undefined,
					author_tag: props.message.author.username && props.message.author.discriminator ? `${props.message.author.username}#${props.message.author.discriminator}` : undefined,
					channel_mention: props.channel.id ? `<#${props.channel.id}>` : undefined,
					message_link: location.origin && props.channel.guild_id && props.channel.id && props.message.id ? `${location.origin}/channels/${props.channel.guild_id}/${props.channel.id}/${props.message.id}` : undefined,
					/* eslint-enable camelcase */
				};

				const rendered = data.callOriginalMethod();
				Object.values(settings).forEach(rawItemDef => {
					const itemDef = deepFormat({
						...rawItemDef,

						/* eslint-disable camelcase */
						actions: {
							keep_open: false,
							send_message: "",
							...rawItemDef.actions,
						},
						checks: {
							...rawItemDef.checks,
						},
						display: {
							label: "Custom Item",
							...rawItemDef.display,
						},
						/* eslint-enable camelcase */
					}, placeholders);

					const menuItem = <MenuItem label={itemDef.display.label} action={() => {
						if (itemDef.actions.keep_open !== true) {
							closeContextMenu();
						}

						if (itemDef.actions.debug === true) {
							/* eslint-disable-next-line no-console */
							console.log("Debug:", {
								itemDef,
								placeholders,
							});
						}

						if (itemDef.actions.send_message) {
							if (global.ZLibrary) global.ZLibrary.DiscordAPI.currentChannel.sendMessage(itemDef.actions.send_message, true);
						}
					}} />;
					rendered.props.children.push(menuItem);
				});
				return rendered;
			},
		});
	}
	stop() {
		if (typeof this.unpatch === "function") {
			this.unpatch();
		}
	}
}
global.CustomContextMenu = CustomContextMenu;