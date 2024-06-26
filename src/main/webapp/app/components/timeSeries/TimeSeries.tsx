import { APP_HISTORY_FORMAT, APP_TIME_FORMAT } from 'app/config/constants/constants';
import React, { useEffect, useRef, useState } from 'react';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { TextFormat } from 'react-jhipster';
import { Col, Row } from 'reactstrap';
import './time-series.scss';
import { groupTimeSeriesDataByDay } from './time-series-utils';

export type RequiredTimeSeriesEventData = {
  createdAt: Date;
  admin: string;
  editBy: string;
  operation: string;
  bubbleColor: string;
  content: React.ReactNode;
  location: string;
  objectField?: string;
};

export type ExtraTimeSeriesEventData = RequiredTimeSeriesEventData & {
  title: string;
  subtitle: string;
};
interface ITimeSeriesPropsGroupByDay {
  groupByDay?: true;
  data: ExtraTimeSeriesEventData[];
}

interface ITimeSeriesPropsNoGroupByDay {
  groupByDay: false;
  data: RequiredTimeSeriesEventData[];
}

export type ITimeSeriesProps = ITimeSeriesPropsGroupByDay | ITimeSeriesPropsNoGroupByDay;

const TimeSeries = ({ data, groupByDay = true }: ITimeSeriesProps) => {
  if (data.length === 0) {
    return <div>No history available</div>;
  }

  const dataForEachDay = groupTimeSeriesDataByDay(data);

  const days = Object.keys(dataForEachDay);
  days.sort((day1, day2) => new Date(day2).getTime() - new Date(day1).getTime());

  return groupByDay ? (
    <>
      {days.map(day => (
        <TimeSeriesInfo key={day} date={new Date(day)}>
          {dataForEachDay[day].map((eventData: ExtraTimeSeriesEventData) => (
            <TimeSeriesEvent
              key={`${day}-${eventData.createdAt.toString()}`}
              title={eventData.title}
              subtitle={eventData.subtitle}
              createdAt={eventData.createdAt}
              editBy={eventData.editBy}
              operation={eventData.operation}
              bubbleColor={eventData.bubbleColor}
              content={eventData.content}
            />
          ))}
        </TimeSeriesInfo>
      ))}
    </>
  ) : (
    <>
      {days.map(day =>
        dataForEachDay[day].map((eventData: RequiredTimeSeriesEventData) => (
          <TimeSeriesInfo key={`${day}-${eventData.createdAt.toString()}`}>
            <TimeSeriesEvent
              admin={eventData.admin}
              createdAt={eventData.createdAt}
              editBy={eventData.editBy}
              operation={eventData.operation}
              bubbleColor={eventData.bubbleColor}
              content={eventData.content}
              groupByDay={false}
            />
          </TimeSeriesInfo>
        )),
      )}
    </>
  );
};

export interface ITimeSeriesInfoProps {
  date?: Date;
  children: React.ReactNode;
}

const TimeSeriesInfo = ({ date, children }: ITimeSeriesInfoProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastChildRef = useRef<HTMLDivElement>(null);

  const [lineHeight, setLineHeight] = useState<number | null>(0);

  useEffect(() => {
    function updateLineHeight() {
      setLineHeight(
        timelineRef.current !== null && lastChildRef.current !== null
          ? (timelineRef.current.clientHeight ?? 0) - (lastChildRef.current.clientHeight ?? 0) - 10
          : null,
      ); // 10 is height of margin from react-event-timeline
    }

    updateLineHeight();
    window.addEventListener('resize', updateLineHeight);

    return () => {
      window.removeEventListener('resize', updateLineHeight);
    };
  }, []);

  return (
    <Col>
      {date && (
        <Row className="ps-1">
          <h5>
            <TextFormat value={date} type="date" format={APP_HISTORY_FORMAT} />
          </h5>
        </Row>
      )}
      <Row>
        <div ref={timelineRef}>
          <Timeline
            style={{ padding: '0px', width: '100%', fontSize: '100%', fontWeight: 'normal' }}
            lineStyle={lineHeight !== null ? { height: `${lineHeight}px`, top: '10px', left: '10px' } : undefined}
            lineColor="#B0B0B0"
          >
            {React.Children.map(children, (child, index) => {
              if (index === React.Children.count(children) - 1) {
                return <div ref={lastChildRef}>{child}</div>;
              }
              return child;
            })}
          </Timeline>
        </div>
      </Row>
    </Col>
  );
};

export interface ITimeSeriesEventProps extends Partial<ExtraTimeSeriesEventData> {
  groupByDay?: boolean;
}

const TimeSeriesEvent = ({
  title,
  subtitle,
  createdAt,
  admin,
  editBy,
  operation,
  bubbleColor,
  content,
  groupByDay = true,
}: ITimeSeriesEventProps) => {
  return (
    <TimelineEvent
      bubbleStyle={{ backgroundColor: bubbleColor, borderWidth: '0px', width: '20px', height: '20px', cursor: 'initial' }}
      contentStyle={{ boxShadow: 'none', padding: '0px 20px 0px 0px', width: '100%' }}
      subtitleStyle={{ fontSize: '100%', marginTop: '8px', color: '#212529' }}
      title={
        groupByDay ? (
          <div>
            <span className="time-series-event-timestamp">
              {createdAt && <TextFormat value={createdAt} type="date" format={APP_TIME_FORMAT} />}
            </span>{' '}
            <span>{`${admin} approved ${operation} by ${editBy}`}</span>
          </div>
        ) : (
          <h5>{createdAt && <TextFormat value={createdAt} type="date" format={APP_HISTORY_FORMAT} />}</h5>
        )
      }
      subtitle={
        groupByDay ? (
          <div>
            {title && <h5 className="mb-1">{title}</h5>}
            {subtitle && <h6>{subtitle}</h6>}
          </div>
        ) : (
          <div>
            <span className="time-series-event-timestamp">
              {createdAt && <TextFormat value={createdAt} type="date" format={APP_TIME_FORMAT} />}
            </span>{' '}
            <span>{`${admin} approved ${operation} by ${editBy}`}</span>
          </div>
        )
      }
    >
      {content}
    </TimelineEvent>
  );
};

export default TimeSeries;
