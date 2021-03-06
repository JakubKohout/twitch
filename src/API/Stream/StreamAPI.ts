import UserTools, { UserIdResolvable } from '../../Toolkit/UserTools';
import { Cacheable, Cached } from '../../Toolkit/Decorators';
import BaseAPI from '../BaseAPI';
import Stream, { StreamData, StreamType } from './Stream';
import { UniformObject } from '../../Toolkit/ObjectTools';

@Cacheable
export default class StreamAPI extends BaseAPI {
	@Cached(60)
	async getStreamByChannel(channel: UserIdResolvable) {
		const channelId = UserTools.getUserId(channel);

		const data = await this._client.apiCall<StreamData>({ url: `streams/${channelId}` });
		return new Stream(data, this._client);
	}

	async getStreams(
		channels?: string | string[], game?: string, languageCode?: string,
		type?: StreamType,
		page?: number, limit: number = 25
	): Promise<Stream[]> {
		const query: UniformObject<string> = { limit: limit.toString() };

		if (channels) {
			query.channel = typeof channels === 'string' ? channels : channels.join(',');
		}

		if (game) {
			query.game = game;
		}

		if (languageCode) {
			query.broadcaster_language = languageCode;
		}

		if (type) {
			query.stream_type = type;
		}

		if (page) {
			query.offset = ((page - 1) * limit).toString();
		}

		const data = await this._client.apiCall({ url: 'streams', query });

		return data.streams.map((streamData: StreamData) => new Stream(streamData, this._client));
	}

	async getAllStreams(page?: number, limit?: number) {
		return this.getStreams(undefined, undefined, undefined, StreamType.All, page, limit);
	}

	async getAllLiveStreams(page?: number, limit?: number) {
		return this.getStreams(undefined, undefined, undefined, StreamType.Live, page, limit);
	}

	@Cached(60)
	async getFollowedStreams(type?: StreamType, page?: number, limit: number = 25) {
		const query: UniformObject<string> = { limit: limit.toString() };

		if (type) {
			query.type = type;
		}

		if (page) {
			query.offset = ((page - 1) * limit).toString();
		}

		const data = await this._client.apiCall({ url: 'streams/followed', query, scope: 'user_read' });

		return data.streams.map((streamData: StreamData) => new Stream(streamData, this._client));
	}
}
