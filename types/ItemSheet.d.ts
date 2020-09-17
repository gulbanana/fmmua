declare interface ItemSheetData<DataType = any>
	extends BaseEntitySheetData<DataType> {
	item: Item<DataType>;
	data: DataType;
}

declare interface FormApplication {
    /**
     * Get an object of update data used to update the form's target object
     * @param {object} updateData     Additional data that should be merged with the form data
     * @return {object}               The prepared update data
     */
    _getSubmitData(updateData={}): Record<string, any>;
}

declare interface ItemSheet {
    _onEditImage(ev: Event);
}