declare interface MacroData {
	command: string;
}

/**
 * The Macro entity which implements a triggered chat or script expression which can be quickly activated by the user.
 * All users have permission to create and use chat-based Macros, but users must be given special permission to use
 * script-based macros.
 *
 * @see {@link Macros}        The Collection of Macro entities
 * @see {@link MacroConfig}   The Macro Configuration sheet
 * @see {@link Hotbar}        The Hotbar interface application
 */
declare class Macro extends Entity {
	/** @override */
	static get config(): {
		baseEntity: Macro;
		collection: Macros;
		embeddedEntities: [];
    };

	/**
	 * Execute the Macro command
	 */
    execute(): Promise<any>;
    
    static create(data: object, options?: object): Promise<Macro>; // added

	data: EntityData & {
		command: string; 
	}
}