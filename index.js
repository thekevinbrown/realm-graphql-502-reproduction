require('dotenv').config();

// UUID v4 generates a random ID.
// https://stackoverflow.com/questions/20342058/which-uuid-version-to-use
const uuid = require('uuid/v4');
const axios = require('axios');
const rimraf = require('rimraf');
const Realm = require('realm');
const { Credentials, User } = require('realm-graphql-client');

const { REALM_HOST, REALM_NAME } = process.env;

// This just adds noise to our output otherwise.
Realm.Sync.setLogLevel('off');

const schema = require('./schema');

const run = async () => {
	// Log in
	const user = await Realm.Sync.User.login(
		`https://${REALM_HOST}`,
		Realm.Sync.Credentials.usernamePassword(
			process.env.ADMIN_USERNAME,
			process.env.ADMIN_PASSWORD,
			false
		)
	);

	const config = user.createConfiguration({
		deleteRealmIfMigrationNeeded: true,
		sync: {
			fullSynchronization: true,
			url: `realms://${REALM_HOST}/${REALM_NAME}`,
		},
		schema: Object.values(schema),
	});

	console.log('Connecting to Realm...');

	const realm = await Realm.open(config);

	realm.write(() => {
		console.log('Clearing all existing data...');
		realm.deleteAll();

		console.log('Creating seed data...');
		realm.create('Trial', {
			uuid: uuid(),
			name: 'Ashley only trial',
			description: 'This is the description of the trial',
			inclusionCriteria: [
				{
					uuid: uuid(),
					description: "Patient's name is Ashley",
					entityType: 'patient',
					components: [
						{
							uuid: uuid(),
							field: 'name',
							value: 'Ashley',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	});

	// Set the permissions
	console.log('Setting default permissions');
	await Realm.Sync.User.current.applyPermissions('*', `/${REALM_NAME}`, 'read');

	// Wait for these changes to sync to the server
	await new Promise(resolve => {
		realm.syncSession.addProgressNotification(
			'upload',
			'forCurrentlyOutstandingWork',
			(transferred, transferrable) => {
				console.log(`Syncing... (${transferred} bytes of ${transferrable} bytes)`);

				if (transferred === transferrable) {
					resolve();
				}
			}
		);
	});

	console.log('Closing connection...');
	realm.close();

	console.log('Cleaning up realm files...');
	rimraf.sync('./realm-object-server');

	console.log('Getting auth token for admin user...');
	const credentials = Credentials.usernamePassword(
		process.env.ADMIN_USERNAME,
		process.env.ADMIN_PASSWORD
	);
	const graphqlUser = await User.authenticate(credentials, `https://${REALM_HOST}`);

	console.log('Deleting cached schema...');

	await axios.delete(`https://${REALM_HOST}/graphql/schema/${REALM_NAME}`, {
		headers: {
			Authorization: graphqlUser.token,
		},
	});

	console.log('Making GraphQL request to realm...');
	const result = await axios.post(
		`https://${REALM_HOST}/graphql/%2F${REALM_NAME}`,
		{ query: 'query { trials { uuid }}' },
		{
			headers: {
				Authorization: graphqlUser.token,
			},
		}
	);

	console.log(`Result status: ${result.status}`);
};

run()
	.catch(err => {
		console.log('Unhandled error', err);
		process.exit(1);
	})
	.then(() => {
		// Without this, the script never finishes. It's a known issue.
		// https://github.com/realm/realm-js/issues/1387
		process.exit();
	});
