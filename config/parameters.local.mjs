import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parameters = {
  tg: {
    token: '',
    chatId: 2
  },
  google: {
    sheet: {
      id: '',
      pathToKey: path.join(__dirname, './youtybe....json')
    },
    youTube: {
      apiKey: '',
    },
  },
  partners: {
    JokeZone: {
      costThousandViews: 2,
      comment: [''],
      startVideoId: '',
      channelId: ''
    }
  }
}
export default parameters
