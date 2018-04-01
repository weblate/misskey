import * as express from 'express';

import config from '../conf';
import { extractPublic } from '../crypto_key';
import parseAcct from '../common/user/parse-acct';
import User, { ILocalAccount } from '../models/user';

const app = express();

app.get('/@:user', async (req, res, next) => {
	const accepted = req.accepts(['html', 'application/activity+json', 'application/ld+json']);
	if (!['application/activity+json', 'application/ld+json'].includes(accepted)) {
		return next();
	}

	const { username, host } = parseAcct(req.params.user);
	if (host !== null) {
		return res.sendStatus(422);
	}

	const user = await User.findOne({
		usernameLower: username.toLowerCase(),
		host: null
	});
	if (user === null) {
		return res.sendStatus(404);
	}

	const id = `${config.url}/@${user.username}`;

	if (username !== user.username) {
		return res.redirect(id);
	}

	res.json({
		'@context': [
			'https://www.w3.org/ns/activitystreams',
			'https://w3id.org/security/v1'
		],
		type: 'Person',
		id,
		preferredUsername: user.username,
		name: user.name,
		summary: user.description,
		icon: user.avatarId && {
			type: 'Image',
			url: `${config.drive_url}/${user.avatarId}`
		},
		image: user.bannerId && {
			type: 'Image',
			url: `${config.drive_url}/${user.bannerId}`
		},
		publicKey: {
			type: 'Key',
			owner: id,
			publicKeyPem: extractPublic((user.account as ILocalAccount).keypair)
		}
	});
});

export default app;