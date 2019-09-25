const { version } = require("../../package.json");

const React = require("react");
const styled = require("styled-components").default;

const SettingsPanel = styled(class SettingsPanel extends React.Component {
	constructor(props) {
		super(props);

		this.update = this.update.bind(this);
		this.keyDown = this.keyDown.bind(this);

		this.textAreaRef = React.createRef();
	}

	update(event) {
		BdApi.saveData("CustomContextMenu", "menus", event.target.value);
		BdApi.saveData("CustomContextMenu", "syntaxVersion", version);
	}

	keyDown(event) {
		if (event.key !== "Tab") return;
		event.preventDefault();

		const before = this.textAreaRef.current.value.substr(0, this.textAreaRef.current.selectionStart);
		const after = this.textAreaRef.current.value.substr(this.textAreaRef.current.selectionStart, this.textAreaRef.current.value.length);
		this.textAreaRef.current.value = before + "    " + after;
	}

	render() {
		return <textarea
			className={this.props.className}
			ref={this.textAreaRef}
			defaultValue={BdApi.loadData("CustomContextMenu", "menus") || ""}

			rows={30}
			placeholder="Insert your custom context menus here!"

			onInput={this.update}
			onKeyDown={this.keyDown}
		></textarea>;
	}
})`
	width: 100%;
	height: 100%;
	resize: none;
	font-family: monospace;
`;
module.exports = SettingsPanel;