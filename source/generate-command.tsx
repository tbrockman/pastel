import process from 'node:process';
import type { Command as CommanderCommand } from 'commander';
import { render } from 'ink';
import React, { type ComponentType } from 'react';
import { StatusMessage } from '@inkjs/ui';
import { fromZodError } from 'zod-validation-error';
import { type Command } from './internal-types.js';
import generateOptions from './generate-options.js';
import generateArguments from './generate-arguments.js';
import { type AppProps } from './types.js';
import Pastel from './index.js';

const generateCommand = (
	commanderCommand: CommanderCommand,
	pastelCommand: Command,
	{ appComponent, app }: { appComponent: ComponentType<AppProps>, app: Pastel },
) => {
	commanderCommand.helpOption('-h, --help', 'Show help');

	if (pastelCommand.description) {
		commanderCommand.description(pastelCommand.description);
	}

	if (pastelCommand.alias) {
		commanderCommand.alias(pastelCommand.alias);
	}

	const optionsSchema = pastelCommand.options;

	if (optionsSchema) {
		const options = generateOptions(optionsSchema);

		for (const option of options) {
			commanderCommand.addOption(option);
		}
	}

	let hasVariadicArgument = false;

	const argumentsSchema = pastelCommand.args;

	if (argumentsSchema) {
		const arguments_ = generateArguments(argumentsSchema);

		for (const argument of arguments_) {
			if (argument.variadic) {
				hasVariadicArgument = true;
			}

			commanderCommand.addArgument(argument);
		}
	}

	const { component } = pastelCommand;

	if (component) {
		commanderCommand.action(async (...input) => {
			// Remove the last argument, which is an instance of Commander command
			input.pop();

			const options = input.pop() as Record<string, unknown>;
			let parsedOptions: Record<string, unknown> = {};

			if (pastelCommand.options) {
				const result = await pastelCommand.options.safeParseAsync(options);

				if (result.success) {
					parsedOptions = result.data ?? {};
				} else {
					render(
						<StatusMessage variant="error">
							{
								fromZodError(result.error, {
									maxIssuesInMessage: 1,
									prefix: '',
									prefixSeparator: '',
								}).message
							}
						</StatusMessage>,
						app.renderOptions
					);

					// eslint-disable-next-line unicorn/no-process-exit
					process.exit(1);
				}
			}

			let arguments_: unknown[] = [];

			if (pastelCommand.args) {
				const result = await pastelCommand.args.safeParseAsync(
					hasVariadicArgument ? input.flat() : input,
				);

				if (result.success) {
					arguments_ = result.data ?? [];
				} else {
					render(
						<StatusMessage variant="error">
							{
								fromZodError(result.error, {
									maxIssuesInMessage: 1,
									prefix: '',
									prefixSeparator: '',
								}).message
							}
						</StatusMessage>,
						app.renderOptions
					);

					// eslint-disable-next-line unicorn/no-process-exit
					process.exit(1);
				}
			}

			const { waitUntilExit } = render(
				React.createElement(appComponent, {
					Component: component,
					commandProps: {
						options: parsedOptions,
						args: arguments_,
						app
					},
				}),
				app.renderOptions
			);
			await waitUntilExit();
		});
	}
};

export default generateCommand;
