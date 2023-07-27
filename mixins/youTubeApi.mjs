import axios from "../config/axiosConfig.mjs";
import {subDays, addMinutes} from 'date-fns'
export const getLastVideoIds = async (channelId, apiKey) => {
  try {
    let allShortsId = [];
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&type=video&key=${apiKey}&order=date`
    // взять видосы за последнии 14 дней
    // const currentDate = new Date();
    // const fourteenDaysAgo = new Date();
    // fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    // url += `&publishedAfter=${fourteenDaysAgo.toISOString()}`

    const response = await axios.get(url);

    const items = response.data.items;
    const shortsId = items.map((item) => item.id.videoId)
    allShortsId = allShortsId.concat(shortsId);
    return allShortsId.reverse(); // Отразить порядок ссылок

  } catch (error) {
    console.error(`Failed to fetch shorts video links for channel ${channelId}`);
    console.error(error);
    return [];
  }
}

export const getVideosInfoByIds = async (videosId, apiKey, desiredCommentList) => {
  try {

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&part=statistics&id=${videosId.join()}&key=${apiKey}`
    );

    const list = response.data.items;
    const promises = list.map(async item => {

      // Получение комментариев к видео
      const commentsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${item.id}&key=${apiKey}`
      );

      const commentItems = commentsResponse.data.items;

      const commentWithLink = commentItems.find(item2 => {
        return desiredCommentList.some(comment => item2.snippet.topLevelComment.snippet.textOriginal.includes(comment));
      });

      return {
        videoId: item.id,
        url: 'https://www.youtube.com/shorts/' + item.id,
        title: item.snippet.title,
        viewCount: item.statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
        hasCommentWithLink: !!commentWithLink,
        commentDate: commentWithLink ? commentWithLink.snippet.topLevelComment.snippet.publishedAt : 'N/A',
      };
    });
    return await Promise.all(promises);
  } catch (error) {
    console.error(`Failed to fetch video info for ${videosId.join()}`);
    console.error(error);
    return [];
  }
}

export const getVideoWithin14Days = async (channelId, apiKey, offsetMinutes = 5) => {
  try {
    const currentDate = new Date();
    const fourteenDaysAgo = subDays(currentDate, 14);
    const fourteenDaysAgoMinusOffsetMinutes = addMinutes(fourteenDaysAgo, -1 * offsetMinutes);
    const fourteenDaysAgoPlusOffsetMinutes = addMinutes(fourteenDaysAgo, offsetMinutes);

    const url = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=1&type=video&key=${apiKey}&publishedAfter=${fourteenDaysAgoMinusOffsetMinutes.toISOString()}&publishedBefore=${fourteenDaysAgoPlusOffsetMinutes.toISOString()}`;
    const response = await axios.get(url);
    const video = response.data.items[0];

    if (!video) {
      throw new Error();
    }

    const videoId = video.id.videoId;

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&part=statistics&id=${videoId}&key=${apiKey}`;

    const statsResponse = await axios.get(statsUrl);

    const videoData = statsResponse.data.items.map((item) => ({
      videoId: item.id,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      title: item.snippet.title,
      viewCount: parseInt(item.statistics.viewCount),
      publishedAt: item.snippet.publishedAt,
    }));

    return videoData[0];
  } catch (error) {
    console.error(error.message);
  }
};
