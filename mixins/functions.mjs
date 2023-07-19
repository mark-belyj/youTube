export const getVideosWithoutComment = list => {
  const result = []
  for (const item of list) {
    if (!item.hasCommentWithLink) {
      result.push(item)
    }
  }
  return result
}

export const countingNumberViews = list => {
  let count = 0;
  for (const item of list) {
    count += Number(item.viewCount);
  }
  return count
}

export const splitNumberIntoGroups = number => {
  let numberString = String(number);
  let groups = [];
  for (let i = numberString.length - 1; i >= 0; i--) {
    let group = numberString[i];
    if (i > 0 && (numberString.length - i) % 3 === 0) {
      group = " " + group; // Добавляем пробел перед каждой третьей цифрой, начиная с конца
    }
    groups.unshift(group); // Добавляем тетраду в начало массива
  }
  return groups.join("");
}

export const extractVideoId = shortsUrl => {
  const match = shortsUrl.match(/shorts\/([^?]+)/);
  return match ? match[1] : null;
}

export const formatDateToDDMMYYYY = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
};

export const logFormatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const dayOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  return `${day}.${month}.${year} ${hours}:${minutes} ${dayOfWeek} ${monthNames[date.getMonth()]}`;
}