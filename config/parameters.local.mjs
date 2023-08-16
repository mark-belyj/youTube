import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parameters = {
  tg: {
    token: '',
    chatId: 0
  },
  google: {
    sheet: {
      id: '',
      pathToKey: path.join(__dirname, './youtybe-shorts-stats-6c21e0bcf3c1.json')
    },
    youTube: {
      apiKey: '',
    },
  },
  partners: {
    JokeZone: {
      costThousandViews: 10,
      paymentDaysCount: 'Infinity', // СКОЛЬКО ДНЕЙ ОПЛАЧИВАЕТСЯ
      comment: [''],
      startVideoId: '',
      channelId: '',
      cronTime: '0 10 * * 1'
    }
  }
}
export default parameters
