export default function barChartGenerator(data: number[], height: number, labels: string[]) {
    // find the max value
    const maxValue = Math.max(...data);
    // find the lengh of the longest label or data point
    const longestLabel = Math.max(...labels.map((label) => label.length));
    const longestDataPoint = Math.max(...data.map((data) => data.toString().length));

    // find the lengh of the longest label or data point
    const columnWidth = Math.max(longestLabel, longestDataPoint);

    // calculate the division factor
    const divisionFactor = maxValue / height;

    // generate a string that represents the bar chart as emojis stacked on top of each other
    let barChartStringArray: string[] = [];

    let barChartString = "";
    for (let j = 0; j < data.length; j++) {
        barChartString += `${data[j].toString().padEnd(columnWidth)} `;
    }
    barChartStringArray.push(barChartString);

    barChartString = "";
    for (let j = 0; j < data.length; j++) {
        barChartString += `${labels[j].toString().padEnd(columnWidth)} `;
    }
    barChartStringArray.push(barChartString);

    for (let i = 0; i < height + 1; i++) {
        let barChartString = "";
        for (let j = 0; j < data.length; j++) {
            if (data[j] / divisionFactor >= i) {
                barChartString += "x".padEnd(columnWidth) + " ";
            }
        }

        barChartStringArray.push(barChartString);
    }

    return barChartStringArray.reverse().join("\n");
}