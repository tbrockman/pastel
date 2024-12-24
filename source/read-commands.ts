import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import decamelize from 'decamelize';
import type { CommandExports, Command } from './internal-types.js';

const readCommands = async (
	directory: string,
): Promise<Map<string, Command>> => {
	const commands = new Map<string, Command>();
	const files = await fs.readdir(directory);

	for (const file of files) {
		if (file.startsWith('_app')) {
			continue;
		}

		const filePath = path.join(directory, file);
		const stat = await fs.stat(filePath);

		if (stat.isDirectory()) {
			const subCommands = await readCommands(filePath);
			const indexCommand = subCommands.get('index');

			if (indexCommand) {
				indexCommand.name = file;
				indexCommand.commands = subCommands;
				subCommands.delete('index');
				commands.set(file, indexCommand);
				continue;
			}

			const command: Command = indexCommand ?? {
				name: file,
				isDefault: false,
				commands: subCommands,
			};

			commands.set(file, command);
			continue;
		}

		if (!/\.(js|ts)x?$/.test(file) || file.endsWith('.d.ts')) {
			continue;
		}

		const fileUrl = pathToFileURL(filePath);
		const { description, isDefault, alias, options, args, default: component, ...rest } = (await import(fileUrl.href)) as CommandExports;
		const name = decamelize(file.replace(/\.(js|ts)x?$/, ''), { separator: '-' });

		commands.set(name, {
			name,
			description,
			isDefault: isDefault ?? false,
			alias,
			options,
			args,
			component,
			...rest,
		});
	}

	return commands;
};

export default readCommands;
