import {PageConfig} from 'next';
import {NextkitError} from 'nextkit';
import getRawBody from 'raw-body';
import {api} from '../../server/api';
import {
	headerSchema,
	verifyKey,
} from '../../server/util/discord/verify-interaction';
import {env} from '../../server/util/env';
import {
	APIInteraction,
	InteractionResponseType,
	InteractionType,
	RESTPostAPIInteractionCallbackJSONBody,
} from 'discord-api-types/v9';

export const config: PageConfig = {
	api: {bodyParser: false},
};

export default api<{
	POST: RESTPostAPIInteractionCallbackJSONBody;
}>({
	async POST({req}) {
		const body = await getRawBody(req);

		const {
			'X-Signature-Ed25519': signature,
			'X-Signature-Timestamp': timestamp,
		} = headerSchema.parse(req.headers);

		const valid = verifyKey({
			body,
			signature,
			timestamp,
			clientPublicKey: env.DISCORD_INTERACTION_PUBLIC_KEY,
		});

		if (!valid) {
			throw new NextkitError(401, 'Invalid signature');
		}

		const interaction = JSON.parse(body.toString()) as APIInteraction;

		switch (interaction.type) {
			case InteractionType.Ping: {
				return {
					type: InteractionResponseType.Pong,
				};
			}

			case InteractionType.ApplicationCommand: {
				return {
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: 'Pong',
					},
				};
			}

			default: {
				throw new NextkitError(400, 'Unsupported interaction type');
			}
		}
	},
});
