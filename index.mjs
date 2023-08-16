import parameters from './config/parameters.mjs';
import TelegramBot from 'node-telegram-bot-api';
import {readFromGoogleSheet} from './mixins/googleSheetApi.mjs'
import {getLastVideoIds, getVideosInfoByIds} from './mixins/youTubeApi.mjs'
import {
  getVideosWithoutComment,
  countingNumberViews,
  splitNumberIntoGroups,
  extractVideoId
} from './mixins/functions.mjs'

// Создаем экземпляр бота
const bot = new TelegramBot(parameters.tg.token, {polling: true});
const partners = Object.keys(parameters.partners);

// Обработчик входящих сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  if (parameters.tg.chatId !== chatId) {
    bot.sendMessage(chatId, 'БАН');
    return false
  }
  const messageText = msg.text;

  if (messageText === '/start') {
    const keyboard = {
      keyboard: [
        partners,
      ],
      resize_keyboard: true,
    };

    const replyMarkup = JSON.stringify(keyboard);

    const options = {
      reply_markup: replyMarkup
    };

    bot.sendMessage(chatId, 'Выберите одну из кнопок:', options);
  } else if (partners.includes(messageText)) {
    const currentConfig = parameters.partners[messageText]

    const shortsId= await getLastVideoIds(currentConfig.channelId, parameters.google.youTube.apiKey)
    const index = shortsId.findIndex(element => element === currentConfig.startVideoId); // видос с которого считать
    if (index !== -1) {
      shortsId.splice(0, index);
    }

    let videosInfo = await getVideosInfoByIds(shortsId, parameters.google.youTube.apiKey, currentConfig.comment)

    // ищем видео без коммента
    const videosWithoutComment = getVideosWithoutComment(videosInfo)
    if (videosWithoutComment.length) {
      await bot.sendMessage(chatId, "Видео без коммента: \n");
      for (const item of videosWithoutComment) {
        await bot.sendMessage(chatId, item.url + "\n");
      }
    }

    if (currentConfig.paymentDaysCount === 'Infinity') {
      const googleSheetData= await readFromGoogleSheet(parameters.google.sheet.pathToKey, parameters.google.sheet.id, messageText)
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
          })
        }
      })

      let totalNewViewCount = 0;
      elementsOnlyInVideosInfo.forEach((element) => {
        totalNewViewCount += parseInt(element.viewCount);
      });

      let totalOldViewCount = 0;
      elementsInBothItem.forEach((element) => {
        totalOldViewCount = totalOldViewCount + parseInt(element.viewCount) - parseInt(element.googleSheetViewCount);
      });

      const message = ` 
          * Старые видео (с последней выплаты) (${elementsInBothItem.length} шт.): *
          ${splitNumberIntoGroups(totalOldViewCount)} просмотров
          ${splitNumberIntoGroups(Math.floor(totalOldViewCount * currentConfig.costThousandViews / 1000))} ₽
          
          * Новые (${elementsOnlyInVideosInfo.length} шт.):*
          ${splitNumberIntoGroups(totalNewViewCount)} просмотров
          ${splitNumberIntoGroups(Math.floor(totalNewViewCount * currentConfig.costThousandViews / 1000))} ₽
          
          * средняя прибыль за 1 видео :*
          ${Math.floor((totalNewViewCount + totalOldViewCount) * currentConfig.costThousandViews / 1000 / (elementsInBothItem.length + elementsOnlyInVideosInfo.length))} ₽
          `;

      await bot.sendMessage(chatId, message, {parse_mode: 'Markdown'});

    } else {
      const videosAfterNDays = await readFromGoogleSheet(parameters.google.sheet.pathToKey, parameters.google.sheet.id, messageText)
      const videoIdsAfterNDays = videosAfterNDays.map(item => item[6])

      // оплаченные видео
      // const paidVideosAfterNDays = videosAfterNDays.filter(row => row[5] == 1)

      // неоплаченные
      // const unpaidVideosAfterNDays = videosAfterNDays.filter(row => row[5] != 1)

      // просмотров видео, которым > 14 дней, но они не оплаченны
      let viewsUnpaidVideosAfterNDays = 0
      let cntUnpaidVideoIdsAfterNDays = 0; // кол-во неоплаченных
      videosAfterNDays.forEach(video => {
        if (Number(video[5]) !== 1) {
          cntUnpaidVideoIdsAfterNDays += 1
          viewsUnpaidVideosAfterNDays += Number(video[2])
        }
      })
      const moneyUnpaidVideosAfter14Days = Math.floor(viewsUnpaidVideosAfterNDays * currentConfig.costThousandViews / 1000)

      // формируем id оплаченных
      /*
      const paidVideoIdsAfter14Days = paidVideosAfterNDays.map(item => item[6])
      */

      /*
      // формируем id неоплаченных
      const unpaidVideoIdsAfter14Days = unpaidVideosAfterNDays.map(item => item[6])
      */

      // убираем оплаченные видео
      // shortsId = shortsId.filter(item => !paidVideoIdsAfter14Days.includes(item));

      // убираем неоплаченные видео
      // videosInfo = videosInfo.filter(item => !unpaidVideoIdsAfter14Days.includes(item.videoId));

      // убираем видео, которым > 14 дней
      videosInfo = videosInfo.filter(item => !videoIdsAfterNDays.includes(item.videoId));

      let last4Videos = []
      if (videosInfo.length > 4) {
        last4Videos = videosInfo.slice(0, 4)
      }

      const moneyListLast4Videos = last4Videos.map(item => Math.floor(Number(item.viewCount) * currentConfig.costThousandViews / 1000) + " ₽\t")

      const views = countingNumberViews(videosInfo)
      const money = Math.floor(views * currentConfig.costThousandViews / 1000)

      const message = `
          *Общаяя статистика:*
          ${splitNumberIntoGroups(views + viewsUnpaidVideosAfterNDays)} просмотров
          ${splitNumberIntoGroups(money + moneyUnpaidVideosAfter14Days)} ₽
          
          * > 14 дней - НА ВЫВОД (${cntUnpaidVideoIdsAfterNDays} видео):*
          ${splitNumberIntoGroups(viewsUnpaidVideosAfterNDays)} просмотров
          ${splitNumberIntoGroups(moneyUnpaidVideosAfter14Days)} ₽
          
          * < 14 дней (${videosInfo.length} видео):*
          ${splitNumberIntoGroups(views)} просмотров
          ${splitNumberIntoGroups(money)} ₽
          
          * ₽ последние 4 видео видео:*
          ${moneyListLast4Videos.join(' ')} 
          `;

      await bot.sendMessage(chatId, message, {parse_mode: 'Markdown'});

    }
  }
});
