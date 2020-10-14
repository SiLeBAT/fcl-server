'use strict';

const fs = require('fs');
const path = require ('path');
const mongoose = require('mongoose');
const mongoUrl = 'mongodb://127.0.0.1:27017/epilab';

const models = require('./institution');
const User = models.User;
const Institution = models.Institution;
const State = models.State;


start();

async function start() {
	const argv = process.argv;
	const scriptName = path.posix.basename(argv[1]);
	let filename;
	if (argv.length < 3) {
		printUsage(scriptName);
		process.exit(0);
	} else {
		filename = argv[2];
	}

	try {
		const rawData = fs.readFileSync(filename);
		const data = JSON.parse(rawData);

		await getMongoConnection();
		console.log('db connection ok');
		console.log();

		const user = await findUser(data.user.email);
		if (!user) {
			console.log(`${data.user.email} does not exist in db, exiting...`);
			process.exit(0);
		}

		const state = await findState(data.newInstitution.state_short);
		if (!state) {
			console.log(`The state for ${data.newInstitution.state_short} does not exist in db, exiting...`);
			process.exit(0);
		}

		let inst = await findInst(data.newInstitution);
		let newInst;
		if (inst) {
			console.log('The institution');
			console.log();
			console.log(`${inst}`);
			console.log();
			console.log('already exists in the db, linking user to it');
			console.log();
		} else {
			let instToImport = data.newInstitution;
			instToImport.state_id = state._id;
			inst = await createInst(instToImport);
		}

		const updatedUser = await updateUser(data.user.email, inst._id);
		console.log('updatedUser: ', updatedUser);
		console.log();
		console.log('has the institution:');
		console.log();
		console.log(await findInstById(updatedUser.institution));
		console.log();
		console.log('import institution and linking to user SUCCESSFUL, exiting...');

		process.exit(0);

	} catch (err) {
		console.log('error during data import: ', err);
		printUsage(scriptName);
		process.exit(0);
	}
}

function printUsage(scriptName) {
	console.log('Usage:');
	console.log('------');
	console.log('1. Copy template.json to <filename>.json');
	console.log('2. Remove all comments in <filename>.json');
	console.log('3. Edit it with current user and institution data');
	console.log('4. run');
	console.log(`$ node ${scriptName} <filename>.json`);
}

async function getMongoConnection() {
	const options = {
		autoIndex: false, // Don't build indexes
		keepAlive: 1,
		connectTimeoutMS: 30000,
		reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
		reconnectInterval: 500 // Reconnect every 500ms
	};

	mongoose.connect(mongoUrl, options)
	.then(() => {
		return mongoose.connection;
	})
}

async function findState(short) {
	const state = await State.findOne(
		{ short: short }
	);

	return state;
}

async function findUser(email) {
	const user = await User.findOne(
		{email: email}
	);

	return user;
}

async function findInst(institution) {
	const toFind = {
		state_short: institution.state_short,
		name1: institution.name1,
		name2: institution.name2,
		location: institution.location
	}
	const inst = await Institution.findOne(toFind);

	return inst;
}

async function findInstById(id) {
	const inst = await Institution.findById(id);

	return inst;
}

async function createInst(institution) {
	const newInst = await Institution.create(institution);

	return newInst;
}

async function updateUser(email, institutionId) {
	const query = {
		email: email
	};

	const updateValues = {
		institution: institutionId,
		updated: Date.now()
	}

	const options = {
		new: true,
		runValidators: true
	};

	const updatedUser = User.findOneAndUpdate(
		query,
		{$set: updateValues},
		options
	);

	return updatedUser;
}
