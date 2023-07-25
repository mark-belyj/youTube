import path from 'path';
import cron from 'node-cron';
import {spawn} from 'child_process';
import {logFormatDate} from './mixins/functions.mjs'

const commandPath = path.join('command', 'writeVideoAfter14days.mjs');
const executeScript = command => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, {shell: true, stdio: 'inherit'});

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Запуск скрипта каждую минуту
// cron.schedule('* * * * *', async () => {
// Запуск скрипта каждый день в 14:00 и 21:00
cron.schedule('0 14,21 * * *', async () => {
  console.log(logFormatDate(new Date()))
  try {
    await executeScript(`node ${commandPath}`);
  } catch (error) {
    console.error('Ошибка при запуске скрипта:', error);
  }
  console.log('-----------------------------------------');
});




