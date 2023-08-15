import parameters from '../config/parameters.mjs';
import {
  readFromGoogleSheet, updateGoogleSheetWithoutPeriod,
  writeToGoogleSheetPeriodType,
} from '../mixins/googleSheetApi.mjs'
import {extractVideoId, formatDateToDDMMYYYY} from '../mixins/functions.mjs'
import {getLastVideoIds, getVideosInfoByIds, getVideoStatsPublishedNDaysAgo} from '../mixins/youTubeApi.mjs'

const recordVideoStatisticsToGoogleSheet = async (key) => {
  try {
    const currentConfig = parameters.partners[key];
    let videoList = []
    if (currentConfig.paymentDaysCount === Infinity) {
      const shortsId= await getLastVideoIds(currentConfig.channelId, parameters.google.youTube.apiKey)
      const index = shortsId.findIndex(element => element === currentConfig.startVideoId); // видос с которого считать
      if (index !== -1) {
        shortsId.splice(0, index);
      }
      const videosInfo = await getVideosInfoByIds(shortsId, parameters.google.youTube.apiKey, currentConfig.comment, false)// const googleSheetData= await readFromGoogleSheet(parameters.google.sheet.pathToKey, parameters.google.sheet.id, key)z
      const googleSheetData= await readFromGoogleSheet(parameters.google.sheet.pathToKey, parameters.google.sheet.id, key)
      // const videosInfo = [
      //   {
      //     videoId: 'ozfamSpOVfI',
      //     url: 'https://www.youtube.com/shorts/ozfamSpOVfI',
      //     title: 'Отар Кушанашвили: Проститутки и кокос 😱 | ДНЕВНИК ХАЧА | ИНТЕРВЬЮ #амирансардаров #shorts',
      //     viewCount: '1216',
      //     publishedAt: '2023-08-12T07:30:11Z'
      //   },
      //   {
      //     videoId: 'axSh9WwWPis',
      //     url: 'https://www.youtube.com/shorts/axSh9WwWPis',
      //     title: 'Николай Соболев: П*здабол ли блогер? 🤔 |  ВОПРОС РЕБРОМ #соболев #вопросребром #shorts',
      //     viewCount: '5015',
      //     publishedAt: '2023-08-12T14:00:02Z'
      //   },
      //   {
      //     videoId: 'bbJ4fTrPL8M',
      //     url: 'https://www.youtube.com/shorts/bbJ4fTrPL8M',
      //     title: 'Шок от Чипонкоса: Моргенштерн мне должен 🤣 | ВПИСКА | ИНТЕРВЬЮ #чипинкос #вписка #shorts',
      //     viewCount: '16174',
      //     publishedAt: '2023-08-13T07:00:13Z'
      //   },
      //   {
      //     videoId: 'JilB2l0PqLY',
      //     url: 'https://www.youtube.com/shorts/JilB2l0PqLY',
      //     title: 'Чипинкос скандально про хейтеров 😂 | ПОЯСНИ ЗА ТРУ #чипинкос #смокимо #shorts',
      //     viewCount: '7815',
      //     publishedAt: '2023-08-13T14:00:10Z'
      //   },
      //   {
      //     videoId: '3AxBICTdp7Y',
      //     url: 'https://www.youtube.com/shorts/3AxBICTdp7Y',
      //     title: 'Чипонкос о доходах с музыки | ВПИСКА | ИНТЕРВЬЮ #чипинкос #вписка #shorts',
      //     viewCount: '33293',
      //     publishedAt: '2023-08-14T07:00:01Z'
      //   },
      //   {
      //     videoId: 'yu8F2XUDq0A',
      //     url: 'https://www.youtube.com/shorts/yu8F2XUDq0A',
      //     title: 'Чипинкос: «‎Меня умоляли Моргенштерн и Тимати»‎ 🤣 | ВПИСКА | ИНТЕРВЬЮ #чипинкос #вписка #shorts',
      //     viewCount: '5105',
      //     publishedAt: '2023-08-14T14:00:46Z'
      //   },
      //   {
      //     videoId: 'wDbYYdpshOc',
      //     url: 'https://www.youtube.com/shorts/wDbYYdpshOc',
      //     title: 'Чипинкос: «Меня заказали»  🤣 | ВПИСКА | ИНТЕРВЬЮ #чипинкос #вписка #интервью # short',
      //     viewCount: '6135',
      //     publishedAt: '2023-08-15T07:00:34Z'
      //   },
      //   {
      //     videoId: 'AA9eLSUYbVA',
      //     url: 'https://www.youtube.com/shorts/AA9eLSUYbVA',
      //     title: 'Чипинкос: «Я-легенда! Я круче Майкла Джексона» | ВПИСКА | ИНТЕРВЬЮ #чипинкос #вписка #shorts',
      //     viewCount: '2419',
      //     publishedAt: '2023-08-15T14:00:07Z'
      //   }
      // ]
      //
      // const googleSheetData = [
      //   [
      //     'YouTube',
      //     'https://youtube.com/shorts/ozfamSpOVfI',
      //     '12.08.2023',
      //     '14.08.2023',
      //     '774',
      //     '774',
      //     '0'
      //   ],
      //   [
      //     'YouTube',
      //     'https://youtube.com/shorts/axSh9WwWPis',
      //     '12.08.2023',
      //     '14.08.2023',
      //     '3690',
      //     '3690',
      //     '0'
      //   ],
      //   [
      //     'YouTube',
      //     'https://youtube.com/shorts/bbJ4fTrPL8M',
      //     '13.08.2023',
      //     '14.08.2023',
      //     '11324',
      //     '11324',
      //     '0'
      //   ],
      //   [
      //     'YouTube',
      //     'https://youtube.com/shorts/JilB2l0PqLY',
      //     '13.08.2023',
      //     '14.08.2023',
      //     '3578',
      //     '3578',
      //     '0'
      //   ]
      // ]

      const elementsOnlyInVideosInfo = [];
      const elementsInBothItem = [];

      videosInfo.forEach((videosInfoItem) => {
        const videoId = videosInfoItem.videoId;
        const googleSheetMatch = googleSheetData.find(
          (googleSheetDataItem) => extractVideoId(googleSheetDataItem[1]) === videoId
        );

        if (!googleSheetMatch) {
          elementsOnlyInVideosInfo.push(videosInfoItem);
        } else {
          const googleSheetIndex = googleSheetData.indexOf(googleSheetMatch);
          const googleSheetViewCount = googleSheetMatch[4];

          elementsInBothItem.push({
            ...videosInfoItem,
            googleSheetIndex,
            googleSheetViewCount,
          });
        }
      });



      // обновляем
      await updateGoogleSheetWithoutPeriod(
        parameters.google.sheet.pathToKey,
        parameters.google.sheet.id,
        key,
        elementsInBothItem
      )


      // добавили новые видосы, которых еще нет в таблице
      if (elementsOnlyInVideosInfo.length) {
        const dataToWrite = elementsOnlyInVideosInfo.map(video => [
          'YouTube',
          `https://youtube.com/shorts/${video.videoId}`,
          formatDateToDDMMYYYY(video.publishedAt),
          formatDateToDDMMYYYY(),
          0,
          parseInt(video.viewCount),
        ])

        await writeToGoogleSheetPeriodType(
          parameters.google.sheet.pathToKey,
          parameters.google.sheet.id,
          key,
          dataToWrite
        )
      }


    } else {
      videoList = await getVideoStatsPublishedNDaysAgo(currentConfig.channelId, parameters.google.youTube.apiKey, currentConfig.paymentDaysCount, 5);

      if (videoList.length) {
        const dataToWrite = videoList.map(video => [
          formatDateToDDMMYYYY(video.publishedAt),
          video.url,
          video.viewCount,
          video.viewCount / 1000 * currentConfig.costThousandViews,
          video.title,
          0,
          video.videoId,
        ])

        await writeToGoogleSheetPeriodType(
          parameters.google.sheet.pathToKey,
          parameters.google.sheet.id,
          key,
          dataToWrite
        )
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const key = process.argv[2];
recordVideoStatisticsToGoogleSheet(key);


