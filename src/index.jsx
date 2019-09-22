const yaml = require("js-yaml");

const stringFormat = require("string-format");
const format = (string, props) => {
	return stringFormat(string, {
		...props,
		channel_mention: props.channel.id ? `<#${props.channel.id}>` : undefined,
		author_mention: props.message.author.id ? `<@${props.message.author.id}>` : undefined,
		message_link: location.origin && props.channel.guild_id && props.channel.id && props.message.id ? `${location.origin}/channels/${props.channel.guild_id}/${props.channel.id}/${props.message.id}` : undefined,
	});
};

const MessageContextMenu = BdApi.findModuleByDisplayName("MessageContextMenu");
const MenuItem = BdApi.findModuleByDisplayName("MenuItem");
const { closeContextMenu } = BdApi.findModuleByProps("closeContextMenu");

const textArea = document.getElementsByClassName("da-textArea")[0];

class CustomContextMenu {
	constructor() {
		this.unpatch = null;
	}

	getName() {
		return "Custom Context Menu";
	}
	getDescription() {
		return "A BetterDiscord plugin for generating custom context menu actions using YAML.";
	}
	getVersion() {
		return "1.0.0";
	}
	getAuthor() {
		return "haykam821";
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
		});

		textArea.addEventListener("keydown", event => {
			if (event.code !== "Tab") return;
			event.preventDefault();

			textArea.value = textArea.value.substr(0, textArea.selectionStart) + "    " + textArea.value.substr(textArea.selectionStart, textArea.value.length);
		});

		return textArea;
	}
	start() {
		if (!global.ZeresPluginLibrary) return BdApi.toast("Zere's Plugin Library Missing", "Install Zere's Plugin Library to take advantage of context menu actions such as sending messages.");

		// Load YAML
		let settings = {};
		try {
			settings = yaml.safeLoad(BdApi.loadData("CustomContextMenu", "menus"));
		} catch (error) {
			return BdApi.alert("Loading error", error.toString());
			return BdApi.alert("Invalid syntax", error.toString());
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
				const rendered = data.callOriginalMethod();
				Object.values(settings).forEach(itemDef => {
					const menuItem = BdApi.React.createElement(MenuItem, {
						label: itemDef.label,
						action: () => {
							if (itemDef.keep_open !== true) {
								closeContextMenu();
							}

							if (itemDef.send_message) {
								if (global.ZLibrary) global.ZLibrary.DiscordAPI.currentChannel.sendMessage(format(itemDef.send_message, data.thisObject.props), true);
							}
						}
					});

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