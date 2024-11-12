import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';

export interface ITimeAgoText {
  date: Date;
}

const TimeAgoText = ({ date }: ITimeAgoText) => {
  const [formattedTime, setFormattedTime] = useState(formatDistanceToNow(date, { addSuffix: true }));

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(formatDistanceToNow(date, { addSuffix: true }));
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return <span>{formattedTime}</span>;
};

export default TimeAgoText;
