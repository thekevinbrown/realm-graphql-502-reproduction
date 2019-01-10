exports.DataQuery = {
	name: 'DataQuery',
	primaryKey: 'uuid',
	properties: {
		uuid: 'string',
		description: 'string?',
		components: 'DataQueryComponent[]',
		entityType: 'string',
		entityId: 'string?',
		sortField: 'string?',
		sortDirection: 'string?',
		createdAt: 'date',
		updatedAt: 'date',
	},
};

exports.DataQueryComponent = {
	name: 'DataQueryComponent',
	primaryKey: 'uuid',
	properties: {
		uuid: 'string',
		field: 'string',
		typeSpecifier: 'string?',
		operator: 'string?',
		value: 'string',
		createdAt: 'date',
		updatedAt: 'date',
	},
};

exports.Trial = {
	name: 'Trial',
	primaryKey: 'uuid',
	properties: {
		uuid: 'string',
		name: 'string',
		description: 'string?',
		inclusionCriteria: 'DataQuery[]',
		exclusionCriteria: 'DataQuery[]',
		createdAt: 'date',
		updatedAt: 'date',
	},
};
