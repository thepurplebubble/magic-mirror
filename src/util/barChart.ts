export default function barChartGenerator(data: number[], height: number, labels: string[]) {
    const dataPoint = "▓";
    const padChar = "░";
    // find the max value
    const maxValue = Math.max(...data);
    // find the lengh of the longest label or data point
    const longestLabel = Math.max(...labels.map((label) => label.length));
    const longestDataPoint = Math.max(...data.map((data) => data.toString().length)) + 2;

    // find the lengh of the longest label or data point
    const columnWidth = Math.max(longestLabel, longestDataPoint);

    // calculate the division factor
    const divisionFactor = maxValue / height;

    // generate a string that represents the bar chart as emojis stacked on top of each other
    let barChartStringArray: string[] = [];

    let barChartString = "";
    for (let j = 0; j < data.length; j++) {
        barChartString += `${("(" + data[j] + ")").toString().padEnd((columnWidth) * 2 - data[j].toString().length, " ") + " "} `;
    }
    barChartStringArray.push(barChartString);

    barChartString = "";
    for (let j = 0; j < data.length; j++) {
        barChartString += `${labels[j].padEnd((columnWidth) * 2 - labels[j].toString().length, " ")}  `;
    }
    barChartStringArray.push(barChartString);

    for (let i = 0; i < height + 1; i++) {
        let barChartString = "";
        for (let j = 0; j < data.length; j++) {
            if (Math.round(data[j] / divisionFactor) >= i) {
                barChartString += dataPoint.padEnd(columnWidth - dataPoint.length, padChar) + " ";
            } else {
                barChartString += padChar.padEnd(columnWidth - dataPoint.length, padChar) + " ";
            }
        }

        barChartStringArray.push(barChartString);
    }

    return barChartStringArray.reverse().join("\n");
}

export function convertToMonaspace(str: string): string {
    const replaceChars = ["𝙼𝚘𝚗", "𝚃𝚞𝚎", "𝚆𝚎𝚍", "𝚃𝚑𝚞", "𝙵𝚛𝚒", "𝚂𝚊𝚝", "𝚂𝚞𝚗", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿", "𝟶"]
    const normalChars = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    // search for every char in normalChars and replace it with the corresponding char in replaceChars
    for (let i = 0; i < normalChars.length; i++) {
        str = str.replace(normalChars[i], replaceChars[i]);
    }

    return str;
}
