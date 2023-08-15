import path from 'path';
import cron from 'node-cron';
import {spawn} from 'child_process';
import {logFormatDate} from './mixins/functions.mjs'
import parameters from './config/parameters.mjs';

const commandPath = path.join('command', 'recordVideoStatisticsToGoogleSheet.mjs');
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

for (const key in parameters.partners) {
  cron.schedule(parameters.partners[key].cronTime, async () => {
    console.log(logFormatDate(new Date()))
    try {
      await executeScript(`node ${commandPath} ${key}`);
    } catch (error) {
      console.error('Ошибка при запуске скрипта:', error);
    }
    console.log('-----------------------------------------');
  })
}




