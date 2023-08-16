import axios from "../config/axiosConfig.mjs";
import {subDays, addMinutes} from 'date-fns'
export const getLastVideoIds = async (channelId, apiKey, limit = 50) => {
  try {
    let nextPageToken = '';
    let allShortsId = [];

    do {
      const url = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=${limit}&type=video&key=${apiKey}&order=date&pageToken=${nextPageToken}`
      const response = await axios.get(url);

      const items = response.data.items;
      const shortsId = items.map((item) => item.id.videoId)
      allShortsId = allShortsId.concat(shortsId);

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);
    return allShortsId.reverse(); // Отразить порядок ссылок
  } catch (error) {
    console.error(`Failed to fetch shorts video links for channel ${channelId}`);
    console.error(error);
    return [];
  }
}

export const getVideosInfoByIds = async (videosId, apiKey, desiredCommentList, isNeedCheckComment = true) => {
  try {

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&part=statistics&id=${videosId.join()}&key=${apiKey}`
    );

    const list = response.data.items;
    const promises = list.map(async item => {

      const result = {
        videoId: item.id,
        url: 'https://www.youtube.com/shorts/' + item.id,
        title: item.snippet.title,
        viewCount: item.statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
      }

      if (isNeedCheckComment) {
      // Получение комментариев к видео
        const commentsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${item.id}&key=${apiKey}`
        );

        const commentItems = commentsResponse.data.items;

        const commentWithLink = commentItems.find(item2 => {
          return desiredCommentList.some(comment => item2.snippet.topLevelComment.snippet.textOriginal.includes(comment));
        });

        result.hasCommentWithLink = !!commentWithLink
        result.commentDate = commentWithLink ? commentWithLink.snippet.topLevelComment.snippet.publishedAt : 'N/A'
      }
      return result
    });
    return await Promise.all(promises);
  } catch (error) {
    console.error(`Failed to fetch video info for ${videosId.join()}`);
    console.error(error);
    return [];
  }
}

export const getVideoStatsPublishedNDaysAgo = async (channelId, apiKey, paymentDaysCount, offsetMinutes = 5) => {
  try {
    const currentDate = new Date();
    const nDaysAgo = subDays(currentDate, paymentDaysCount);
    const nDaysAgoMinusOffsetMinutes = addMinutes(nDaysAgo, -1 * offsetMinutes);
    const nDaysAgoPlusOffsetMinutes = addMinutes(nDaysAgo, offsetMinutes);

    const url = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=10&type=video&key=${apiKey}&publishedAfter=${nDaysAgoMinusOffsetMinutes.toISOString()}&publishedBefore=${nDaysAgoPlusOffsetMinutes.toISOString()}`;
    const response = await axios.get(url);
    const videos = response.data.items;

    if (!videos.length) {
      throw new Error();
    }

    const videoStatsArray = [];

    for (const video of videos) {
      const videoId = video.id.videoId;

      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&part=statistics&id=${videoId}&key=${apiKey}`;

      try {
        const statsResponse = await axios.get(statsUrl);

        const videoData = statsResponse.data.items.map((item) => ({
          videoId: item.id,
          url: `https://www.youtube.com/watch?v=${item.id}`,
          title: item.snippet.title,
          viewCount: parseInt(item.statistics.viewCount),
          publishedAt: item.snippet.publishedAt,
        }));

        videoStatsArray.push(...videoData);
      } catch (error) {
        console.error(`Error fetching statistics for video ${videoId}:`, error);
      }
    }

    return videoStatsArray
  } catch (error) {
    console.error(error.message);
  }
};
