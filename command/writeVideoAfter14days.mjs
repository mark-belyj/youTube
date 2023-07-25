import parameters from '../config/parameters.mjs';
import {writeToSheet} from '../mixins/googleSheetApi.mjs'
import {formatDateToDDMMYYYY} from '../mixins/functions.mjs'
import {getVideoWithin14Days} from '../mixins/youTubeApi.mjs'

const writeVideoAfter14days = async () => {
  try {
    for (const key in parameters.partners) {
      const currentConfig = parameters.partners[key];
      const video = await getVideoWithin14Days(currentConfig.channelId, parameters.google.youTube.apiKey);
      if (video) {
        await writeToSheet(
          parameters.google.sheet.pathToKey,
          parameters.google.sheet.id,
          key,
          [
            [
              formatDateToDDMMYYYY(video.publishedAt),
              video.url,
              video.viewCount,
              video.viewCount / 1000 * currentConfig.costThousandViews,
              video.title,
              0,
              video.videoId,
            ]
          ]
        )
      }
    }
  } catch (error) {
    console.error(error);
  }
};

writeVideoAfter14days()


