function pad(number, length = 2) {
  return String(number).padStart(length, '0');
}

let lastTimestampKey = null;
let sequenceWithinSecond = 0;

export function generateTransactionId(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const timestampKey = `${year}${month}${day}${hours}${minutes}${seconds}`;

  if (timestampKey === lastTimestampKey) {
    sequenceWithinSecond += 1;
  } else {
    lastTimestampKey = timestampKey;
    sequenceWithinSecond = 0;
  }

  const suffix = sequenceWithinSecond > 0 ? `-${pad(sequenceWithinSecond, 3)}` : '';
  return `TXN-${year}${month}${day}-${hours}${minutes}${seconds}${suffix}`;
}
