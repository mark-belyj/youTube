import fs from "fs";
import {google} from 'googleapis';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import {formatDateToDDMMYYYY} from "./functions.mjs";

export const writeToGoogleSheetPeriodType = async (pathToKey, spreadsheetId, tabName, dataToWrite) => {
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

    // dataToWrite.forEach(video => {
    //   console.log(`+ ${video[4]} / ${video[6]}`);
    // })

  } catch (error) {
    console.error('Произошла ошибка при записи данных в Google Sheets:', error.message);
  }
};

export const readFromGoogleSheet = async (pathToKey, spreadsheetId, tabName) => {
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


export const updateGoogleSheetWithoutPeriod = async (pathToKey, spreadsheetId, tabName, elementsInBothItem) => {
  try {
    const keyFileContent = fs.readFileSync(pathToKey);
    const credentials = JSON.parse(keyFileContent);

    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    for (const item of elementsInBothItem) {
      const googleSheetRowToUpdate = item.googleSheetIndex + 2; // Adding 2 because Google Sheets rows start from 2 (1-based index)
      const rangePublishedAt = `${tabName}!D${googleSheetRowToUpdate}`; // Column D (publishedAt)
      const rangeViewCount = `${tabName}!F${googleSheetRowToUpdate}`; // Column F (viewCount)

      const resourcePublishedAt = {
        values: [[formatDateToDDMMYYYY()]]
      };

      const resourceViewCount = {
        values: [[parseInt(item.viewCount)]]
      };

      // Update publishedAt
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: rangePublishedAt,
        valueInputOption: 'RAW',
        resource: resourcePublishedAt
      });

      // Update viewCount difference
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: rangeViewCount,
        valueInputOption: 'RAW',
        resource: resourceViewCount
      });

      console.log(`Updated publishedAt and viewCount difference for videoId: ${item.videoId}`);
    }

  } catch (error) {
    console.error('Произошла ошибка при записи данных в Google Sheets:', error.message);
  }
};