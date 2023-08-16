import axios from 'axios';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

// Функция для получения всех ссылок на видео YouTube Shorts для заданного канала
async function getAllShortsVideoLinks(channelId, apiKey) {
    try {
        let nextPageToken = '';
        let allShortsLinks = [];

        do {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&type=video&key=${apiKey}&order=date&pageToken=${nextPageToken}`
            );

            const items = response.data.items;
            const shortsLinks = items.map((item) => `https://www.youtube.com/shorts/${item.id.videoId}`);
            allShortsLinks = allShortsLinks.concat(shortsLinks);

            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        return allShortsLinks.reverse(); // Отразить порядок ссылок
    } catch (error) {
        console.error(`Failed to fetch shorts video links for channel ${channelId}`);
        return [];
    }
}

// // Функция для получения ссылок на последние 50 видео YouTube Shorts для заданного канала
// async function getLatestShortsVideoLinks(channelId, apiKey) {
//     try {
//         const response = await axios.get(
//             `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&type=video&key=${apiKey}&order=date`
//         );
//
//         const items = response.data.items;
//         return items.map((item) => `https://www.youtube.com/shorts/${item.id.videoId}`).reverse();
//     } catch (error) {
//         console.error(`Failed to fetch latest shorts video links for channel ${channelId}`);
//         return [];
//     }
// }

// Функция для получения информации о видео
async function getVideoInfo(videoId, apiKey) {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&part=statistics&id=${videoId}&key=${apiKey}`
        );

        const snippet = response.data.items[0].snippet;
        const statistics = response.data.items[0].statistics;

        // Получение комментариев к видео
        const commentsResponse = await axios.get(
            `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}`
        );

        const commentItems = commentsResponse.data.items;
        const commentWithLink = commentItems.find(
            (item) => item.snippet.topLevelComment.snippet.textOriginal.includes('https://t.me/+jJlQttufW9k5OWNi')
        );
        // qq rus
        // const commentWithLink = commentItems.find(
        //     (item) => item.snippet.topLevelComment.snippet.textOriginal.includes('https://t.me/mostxrus/28')
        // );

        // Shorts_Best_Moments
        // const commentWithLink = commentItems.find(
        //     (item) => item.snippet.topLevelComment.snippet.textOriginal.includes('https://t.me/+MHtNVKDOZtQyMzNi')
        // );
        // СМЕХОВОРОТ
        // const commentWithLink = commentItems.find(
        //     (item) => item.snippet.topLevelComment.snippet.textOriginal.includes('https://bit.ly/CMEXOBOPOT')
        // );

        const date = new Date(snippet.publishedAt);
        const formattedDate = date.toISOString().split('T')[0];
        return {
            videoId: 'https://www.youtube.com/shorts/' + videoId,
            title: snippet.title,
            viewCount: statistics.viewCount,
            publishedAt: formattedDate,
            hasCommentWithLink: !!commentWithLink,
            commentDate: commentWithLink ? commentWithLink.snippet.topLevelComment.snippet.publishedAt : 'N/A',
        };
    } catch (error) {
        console.error(`Failed to fetch video info for ${videoId}`);
        return { videoId, title: 'N/A', viewCount: 'N/A', isCommentPinned: 'N/A' };
    }
}

// Функция для извлечения ID ролика из ссылки YouTube Shorts
function extractVideoId(shortsUrl) {
    const match = shortsUrl.match(/shorts\/([^?]+)/);
    return match ? match[1] : null;
}


// Создание CSV writer
const csvWriter = createObjectCsvWriter({
    path: 'RRS-11.08.2023.csv',
    // path: 'Shorts_Best_Moments-23.06.2023.csv',
    header: [
        { id: 'videoId', title: 'Video ID' },
        { id: 'title', title: 'Title' },
        { id: 'publishedAt', title: 'publishedAt' },
        { id: 'viewCount', title: 'View Count' },
        { id: 'hasCommentWithLink', title: 'Has Comment with Link' },
        { id: 'commentDate', title: 'Comment Date' },
    ],
});

// Основная функция для обработки массива ссылок
async function processShortsUrls(shortsUrls, apiKey) {
    const videoInfoList = [];

    for (const shortsUrl of shortsUrls) {
        const videoId = extractVideoId(shortsUrl);
        const videoInfo = await getVideoInfo(videoId, apiKey);
        videoInfoList.push(videoInfo);
    }

    // Запись результата в CSV файл
    csvWriter
        .writeRecords(videoInfoList)
        .then(() => console.log('CSV file has been written successfully'))
        .catch((error) => console.error('Failed to write CSV file', error));
}

const apiKey = 'AIzaSyBm8qOl4oP3bssmaaY4cBMxbmxlXRwyUiE';

// Запуск скрипта
// processShortsUrls(apiKey);
//UCOpLrM_U06x2cl84YmMp4Mg //best
//UClZMmFdc19WDaZuC160BGlg //qqrus
//UC3-WiNk2Ruz5YCMLfKc_R-Q //cmex
//UCXqjJ8HXOCZdJmwwKE3DmJw rrs

// getLatestShortsVideoLinks('UCOpLrM_U06x2cl84YmMp4Mg', apiKey)
//     .then((shortsLinks) => {
//         const latestShortsLinks = shortsLinks.slice(-50); // Получаем последние 50 ссылок
//         console.log('Latest Shorts Video Links (oldest to newest):');
//         console.log(latestShortsLinks);
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });


getAllShortsVideoLinks('UCrSHYGFvx7aRpQ_5x2LZllQ', apiKey)
    .then((shortsLinks) => {

        const index = shortsLinks.findIndex(element => element === 'https://www.youtube.com/shorts/4mWRs7nZ8ZI');
        // const index = shortsLinks.findIndex(element => element === 'https://www.youtube.com/shorts/gALEgIqhcT4');
        if (index !== -1) {
            shortsLinks.splice(0, index);
        }
        // console.log(shortsLinks);
        //
        processShortsUrls(shortsLinks, apiKey);
    })
    .catch((error) => {
        console.error('Error:', error);
    });