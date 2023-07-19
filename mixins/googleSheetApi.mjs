import fs from "fs";
import {google} from 'googleapis';
export const writeToSheet = async (pathToKey, spreadsheetId, tabName, dataToWrite) => {
  try {
    // Чтение содержимого ключевого файла JSON
    const keyFileContent = fs.readFileSync(pathToKey);
    const credentials = JSON.parse(keyFileContent);

    // Установка учетных данных
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Установка клиента Google Sheets API
    const sheets = google.sheets({version: 'v4', auth});

    // Запись данных в таблицу
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: tabName, // Укажите имя листа
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: dataToWrite,
      },
    });

    dataToWrite.forEach(video => {
      console.log(`+ ${video[4]} / ${video[6]}`);
    })

  } catch (error) {
    console.error('Произошла ошибка при записи данных в Google Sheets:', error.message);
  }
};

export const readFromSheet = async (pathToKey, spreadsheetId, tabName) => {
  try {
    // Чтение содержимого ключевого файла JSON
    const keyFileContent = fs.readFileSync(pathToKey);
    const credentials = JSON.parse(keyFileContent);

    // Установка учетных данных
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Установка клиента Google Sheets API
    const sheets = google.sheets({version: 'v4', auth});

    // Чтение данных из таблицы
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A2:G`, // Прочитать значения из всех столбцов от A до G
      majorDimension: 'ROWS', // Прочитать данные по строкам
    });

    return response.data.values; // Получить все строки

  } catch (error) {
    console.error('Произошла ошибка при чтении и фильтрации данных из Google Sheets:', error.message);
  }
};