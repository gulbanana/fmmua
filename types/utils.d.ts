// foundry-vtt-types declares mergeObject with `other?: T` instead of `Partial<T>`
declare function mergeObject<T>(
	original: T,
	other?: Partial<T>,
	options?: {
		insertKeys?: boolean;
		insertValues?: boolean;
		overwrite?: boolean;
		recursive?: boolean;
		inplace?: boolean;
		enforceTypes?: boolean;
	},
	_d?: number
): T;
