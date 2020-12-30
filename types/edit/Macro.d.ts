declare namespace Macro {	
	export function create(data: object, options?: object): Promise<Macro>;
}

declare interface Macro {
	data: MacroData;
	execute(): Promise<any>;	
}