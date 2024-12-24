import type { ComponentType } from 'react';
import Pastel from './index.js';

export type AppProps = {
	/**
	 * Command's component.
	 */
	Component: ComponentType<{
		options: Record<string, unknown>;
		args: unknown[];
		app: Pastel;
	}>;

	/**
	 * Props to pass to command's component.
	 */
	commandProps: {
		/**
		 * Options.
		 */
		options: Record<string, unknown>;

		/**
		 * Arguments.
		 */
		args: unknown[];
		/**
		 * Reference to created Pastel instance
		 */
		app: Pastel;
	};
};

/**
 * Additional metadata for an option.
 */
export type CommandOptionConfig = {
	/**
	 * Description. If description is missing, option won't appear in the "Options" section of the help message.
	 */
	description?: string;

	/**
	 * Description of a default value.
	 *
	 * @default JSON.stringify(defaultValue)
	 */
	defaultValueDescription?: string;

	/**
	 * Description of a value. Replaces "value" in `--flag <value>` in the help message.
	 *
	 * @default "value"
	 */
	valueDescription?: string;

	/**
	 * Alias. Usually a first letter of the full option name.
	 */
	alias?: string;
};

/**
 * Additional metadata for an argument.
 */
export type CommandArgumentConfig = {
	/**
	 * Argument's name. Displayed in "Usage" part of the help message. Doesn't affect how argument is parsed.
	 *
	 * @default "arg"
	 */
	name?: string;

	/**
	 * Description of an argument. If description is missing, argument won't appear in the "Arguments" section of the help message.
	 */
	description?: string;

	/**
	 * Description of a default value.
	 *
	 * @default JSON.stringify(defaultValue)
	 */
	defaultValueDescription?: string;
};
