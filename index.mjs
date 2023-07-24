import parameters from './config/parameters.mjs';
import TelegramBot from 'node-telegram-bot-api';
import {readFromSheet} from './mixins/googleSheetApi.mjs'
import {getLastVideoIds, getVideosInfoByIds} from './mixins/youTubeApi.mjs'
import {getVideosWithoutComment, countingNumberViews, splitNumberIntoGroups} from './mixins/functions.mjs'

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

    const videosAfter14Days = await readFromSheet(parameters.google.sheet.pathToKey, parameters.google.sheet.id, messageText)
    const videoIdsAfter14Days = videosAfter14Days.map(item => item[6])

    // оплаченные видео
    // const paidVideosAfter14Days = videosAfter14Days.filter(row => row[5] == 1)

    // неоплаченные
    // const unpaidVideosAfter14Days = videosAfter14Days.filter(row => row[5] != 1)

    // просмотров видео, которым > 14 дней, но они не оплаченны
    let viewsUnpaidVideosAfter14Days = 0
    let cntUnpaidVideoIdsAfter14Days = 0; // кол-во неоплаченных
    videosAfter14Days.forEach(video => {
      if (Number(video[5]) !== 1) {
        cntUnpaidVideoIdsAfter14Days += 1
        viewsUnpaidVideosAfter14Days += Number(video[2])
      }
    })
    const moneyUnpaidVideosAfter14Days = Math.floor(viewsUnpaidVideosAfter14Days * currentConfig.costThousandViews / 1000)

    // формируем id оплаченных
    /*
    const paidVideoIdsAfter14Days = paidVideosAfter14Days.map(item => item[6])
    */

    /*
    // формируем id неоплаченных
    const unpaidVideoIdsAfter14Days = unpaidVideosAfter14Days.map(item => item[6])
    */

    getLastVideoIds(currentConfig.channelId, parameters.google.youTube.apiKey)
      .then(async (shortsId) => {
        const index = shortsId.findIndex(element => element === currentConfig.startVideoId); // видос с которого считать
        if (index !== -1) {
          shortsId.splice(0, index);
        }

        // убираем оплаченные видео
        // shortsId = shortsId.filter(item => !paidVideoIdsAfter14Days.includes(item));

        let videosInfo = await getVideosInfoByIds(shortsId, parameters.google.youTube.apiKey, currentConfig.comment)

        // ищем видео без коммента
        const videosWithoutComment = getVideosWithoutComment(videosInfo)
        if (videosWithoutComment.length) {
          await bot.sendMessage(chatId, "Видео без коммента: \n");
          for (const item of videosWithoutComment) {
            await bot.sendMessage(chatId, item.url + "\n");
          }
        }

        // убираем неоплаченные видео
        // videosInfo = videosInfo.filter(item => !unpaidVideoIdsAfter14Days.includes(item.videoId));

        // убираем видео, которым > 14 дней
        videosInfo = videosInfo.filter(item => !videoIdsAfter14Days.includes(item.videoId));

        let last4Videos = []
        if (videosInfo.length > 4) {
          last4Videos = videosInfo.slice(0, 4)
        }

        const moneyListLast4Videos = last4Videos.map(item =>  Math.floor(Number(item.viewCount) * currentConfig.costThousandViews / 1000) + " ₽\t")


        const views = countingNumberViews(videosInfo)
        const money = Math.floor(views * currentConfig.costThousandViews / 1000)

        const message = `
          *Общаяя статистика:*
          ${splitNumberIntoGroups(views + viewsUnpaidVideosAfter14Days)} просмотров
          ${splitNumberIntoGroups(money + moneyUnpaidVideosAfter14Days)} ₽
          
          * > 14 дней - НА ВЫВОД (${cntUnpaidVideoIdsAfter14Days} видео):*
          ${splitNumberIntoGroups(viewsUnpaidVideosAfter14Days)} просмотров
          ${splitNumberIntoGroups(moneyUnpaidVideosAfter14Days)} ₽
          
          * < 14 дней (${videosInfo.length} видео):*
          ${splitNumberIntoGroups(views)} просмотров
          ${splitNumberIntoGroups(money)} ₽
          
          * ₽ последние 4 видео видео:*
          ${moneyListLast4Videos.join(' ')} 
          `;

        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

      })
      .catch((error) => {
        console.error('Error:', error);
      });

  }
});
