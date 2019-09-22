# Discord Custom Context Menu

[![GitHub release](https://img.shields.io/github/release/haykam821/Discord-Custom-Context-Menu.svg?style=popout&label=github)](https://github.com/haykam821/Discord-Custom-Context-Menu/releases/latest)
[![Travis (.com)](https://img.shields.io/travis/com/haykam821/Discord-Custom-Context-Menu.svg?style=popout)](https://travis-ci.com/haykam821/Discord-Custom-Context-Menu)

A [BetterDiscord](https://betterdiscord.net/) plugin for generating custom context menu actions using YAML.

## Documentation

This plugin uses YAML to allow users to define their own custom context menus (currently on messages only).

Here is an example of a complete custom menu definition:

```yaml
greet:
	display:
		label: "Greet User"
	actions:
		send_message: "Hello, {user_mention}!"
throwback:
	display:
		label: "Throwback"
	actions:
		send_message: "Remember this message? {message_link}"
```

Properties are shown using the following syntax:

> * `property` (type): Description...

The property represents the thing you must put before the colon, and the types in parentheses represent what the value (the thing after the colon)'s type must be. The description describes what the property affects or does.

Placeholders are shown using a similar syntax, but the values in parentheses represent what types of context menus support the placeholders.

### Display

Display options are options that allow you to customize the display of the context menu item. They are defined under `display`.

* `label` (string): The label of the context menu item.

### Checks

Checks allow you to show or hide context menu items based on placeholder properties. They are defined under `checks`.

There are currently no checks.

### Actions

Actions allow you to give your context menu item behavior. They are defined under `actions`.

* `send_message` (string): Sends a specified message in the channel.
* `keep_open` (boolean): May not work with other actions. Prevents closing the context menu once it has been clicked. Disabled by default.
* `debug` (boolean): Logs information about the context menu item to console. Disabled by default.

### Placeholders

All actions that let you set a custom string (such as `label` and `send_message`) support placeholders. Placeholders may not be available for all fields.

* `message.content` (message): The raw Markdown content of the message.
* `message.id` (message): The message's ID.
* `message.author.username` (message): The discriminator of the message's author, such as `Username`.
* `message.author.discriminator` (message): The discriminator of the message's author, such as `1337`.
* `message.author.id` (message): The ID of the message's author.
* `channel.name` (message): The channel's name, minus the preceeding `#`.
* `channel.id` (message): The channel's ID.
* `channel.guild_id` (message): The ID of the guild where the message occurred.
* More, viewable by enabling the `debug` action...

There are a few custom shortcuts:

* `author_mention` (message): A mention of the message's author.
* `author_tag` (message): The author's tag, such as `Username#1337`.
* `channel_mention` (message): A mention of the channel the message is in.
* `message_link` (message): A link to the message, like the 'Copy Link' button provides.
