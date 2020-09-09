// foundry-pc-types does not use Partial

/**
 * Update a source object by replacing its keys and values with those from a target object.
 *
 * @param original		The initial object which should be updated with values from the target
 * @param other			A new object whose values should replace those in the source
 * @param insert		Control whether to insert new parent objects in the structure which did not previously
 *						exist in the source object.
 * @param overwrite		Control whether to replace existing values in the source, or only merge values which
 *						do not exist in the source.
 * @param inplace		Update the values of original inplace? Otherwise duplicate the original and return a
 *						safe copy.
 * @param enforceTypes	Enforce that the type of an inner value in the source object match the type of the
 *                              new value. Default is false for now (for BC), but should be true in the future.
 * @param _d			A privately used parameter to track recursion depth
 *
 * @returns				The original source object including updated, inserted, or overwritten records
 */
declare function mergeObject<T>(
	original: T,
	other?: Partial<T>,
	{
		insertKeys,
		insertValues,
		overwrite,
		inplace,
		enforceTypes,
	}?: {
		insertKeys?: boolean;
		insertValues?: boolean;
		overwrite?: boolean;
		inplace?: boolean;
		enforceTypes?: boolean;
	},
	_d?: number
): T;