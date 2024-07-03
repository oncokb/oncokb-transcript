import { ExtraTimeSeriesEventData, RequiredTimeSeriesEventData } from './TimeSeries';

export function groupTimeSeriesDataByDay(data: RequiredTimeSeriesEventData[] | ExtraTimeSeriesEventData[]) {
  const dataForEachDay: { [dateString: string]: RequiredTimeSeriesEventData[] & ExtraTimeSeriesEventData[] } = {};
  for (const eventData of data) {
    const dateWithoutTime = new Date(eventData.createdAt);
    dateWithoutTime.setHours(0, 0, 0, 0);

    const dateString = dateWithoutTime.toISOString();
    if (!dataForEachDay[dateString]) {
      dataForEachDay[dateString] = [];
    }

    dataForEachDay[dateString].push(eventData);
  }

  for (const eventData of Object.values<RequiredTimeSeriesEventData[] | ExtraTimeSeriesEventData[]>(dataForEachDay)) {
    eventData.sort((event1, event2) => event2.createdAt.getTime() - event1.createdAt.getTime());
  }

  return dataForEachDay;
}
