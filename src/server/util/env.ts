import {envsafe, str} from 'envsafe';

export const env = envsafe({
	DISCORD_INTERACTION_PUBLIC_KEY: str({
		desc: 'Discord interaction public key',
	}),
});
