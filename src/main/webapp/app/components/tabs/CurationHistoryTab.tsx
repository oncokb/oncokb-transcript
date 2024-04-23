import { APP_HISTORY_FORMAT, APP_TIME_FORMAT, GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import { HistoryList, HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TextFormat } from 'react-jhipster';
import ReactSelect from 'react-select';
import { Button, Input, Label, Row } from 'reactstrap';
import constructTimeSeriesData, { formatLocation } from '../geneHistoryTooltip/gene-history-tooltip-utils';
import { ExtraTimeSeriesEventData, RequiredTimeSeriesEventData } from '../timeSeries/TimeSeries';
import './curation-history-tab.scss';
import { IDrug } from 'app/shared/model/drug.model';
import { GREY } from 'app/config/colors';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import _ from 'lodash';

export interface ICurationHistoryTabProps extends StoreProps {
  historyData: FlattenedHistory[];
}

type HistoryTabData = {
  record: HistoryRecord;
  timeStamp: number;
  admin: string;
  location: string;
  objectField?: string;
};

const CurationHistoryTab = observer(({ historyData, usersData, addUsersListener, historyTabStore, getDrugs }: ICurationHistoryTabProps) => {
  const firebaseUsersPath = getFirebasePath('USERS');

  const [drugList, setDrugList] = useState<IDrug[]>([]);

  function findObjectFieldsInRecord(record: HistoryRecord) {
    const fields = ['description', 'oncogenic', 'effect', 'penetrance', 'inheritanceMechanism', 'monoallelic', 'biallelic', 'mosaic'];

    const output: string[] = [];
    for (const field of fields) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (record.new[field]) {
        output.push(field);
      }
    }
    return output;
  }

  const parsedHistoryData = useMemo(() => {
    if (!historyData) {
      return [];
    }

    const data = _.cloneDeep(historyData);
    data.sort((data1, data2) => new Date(data2.timeStamp).getTime() - new Date(data1.timeStamp).getTime());
    return data;
  }, [historyData]);

  const authorDropdownOptions = useMemo(() => {
    const options = [];
    if (usersData) {
      for (const [email, data] of Object.entries(usersData)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options.push({ value: email, label: data.name || `[${email}]` });
      }
    }
    return options;
  }, [usersData]);

  useEffect(() => {
    const cleanupCallbacks = [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cleanupCallbacks.push(addUsersListener(firebaseUsersPath));

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cleanupCallbacks.forEach(callback => callback && callback());

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      historyTabStore.reset();
    };
  }, []);

  useEffect(() => {
    async function fetchAllDrugs() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const drugs = await getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setDrugList(drugs['data']);
    }

    fetchAllDrugs();
  }, []);

  function getHistoryContent(historyTabData: FlattenedHistory[], maxLength: number | null = null) {
    const filteredData = historyTabData.filter(data => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const author = historyTabStore.appliedAuthor;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const startDate = historyTabStore.appliedStartDate && new Date(historyTabStore.appliedStartDate);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const endDate = historyTabStore.appliedEndDate && new Date(historyTabStore.appliedEndDate);

      let matchesAuthor = false;
      let matchesDates = false;
      const timeStamp = new Date(data.timeStamp);
      if (!author || author.label === data.admin || author.label === data.lastEditBy) {
        matchesAuthor = true;
      }
      if (startDate && endDate) {
        matchesDates = timeStamp >= startDate && timeStamp <= endDate;
      } else if (startDate) {
        matchesDates = timeStamp >= startDate;
      } else if (endDate) {
        matchesDates = timeStamp <= endDate;
      } else {
        matchesDates = true;
      }
      return matchesAuthor && matchesDates;
    });

    // CONSTRUCT TIME SERIES DATA
    const eventData: (RequiredTimeSeriesEventData | ExtraTimeSeriesEventData)[] = [];
    for (const data of filteredData) {
      const timeSeriesData = constructTimeSeriesData(data);
      if (timeSeriesData) {
        eventData.push(timeSeriesData);
      }

      if (maxLength && eventData.length >= maxLength) {
        break;
      }
    }

    // CONSTRUCT HISTORY TAB CONTENT
    const content: JSX.Element[] = [];
    for (const data of eventData) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isContentAvailable = data.content['props']?.children ? true : false;

      content.push(
        <div>
          <Row className="justify-content-between" style={{ marginBottom: '22px' }}>
            <span>
              <TextFormat value={data.createdAt} type="date" format={APP_HISTORY_FORMAT} />
              <span className="mr-2" />
              <TextFormat value={data.createdAt} type="date" format={APP_TIME_FORMAT} />
            </span>
            <DefaultTooltip
              overlayStyle={{ maxWidth: 600 }}
              overlayInnerStyle={{ maxHeight: '400px', overflow: 'auto', maxWidth: 'inherit' }}
              overlay={isContentAvailable ? data.content : 'No history available'}
            >
              <FaHistory color={isContentAvailable ? 'black' : GREY} />
            </DefaultTooltip>
          </Row>
          <Row className="mb-2">
            <span>{`${data.admin} approved ${data.operation} by ${data.editBy}`}</span>
          </Row>
          <Row className="border-bottom pb-3 mb-3">
            <span>
              <b>Location: </b>{' '}
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                `${formatLocation(data.location, drugList, data.objectField)}`
              }
            </span>
          </Row>
        </div>
      );
    }
    return content;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const historyContent = getHistoryContent(parsedHistoryData, historyTabStore.isFiltered ? null : 10);

  return (
    <div>
      <Row className="mb-3">
        <Label for="start-date">Start Date</Label>
        <Input
          id="start-date"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={historyTabStore.selectedStartDate}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          defaultValue={historyTabStore.appliedStartDate}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange={event => historyTabStore.setSelectedStartDate(event.target.value)}
          type="date"
          name="date"
        />
      </Row>
      <Row className="mb-3">
        <Label for="end-date">End Date</Label>
        <Input
          id="end-date"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={historyTabStore.selectedEndDate}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          defaultValue={historyTabStore.appliedEndDate}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange={event => historyTabStore.setSelectedEndDate(event.target.value)}
          type="date"
          name="date"
        />
      </Row>
      <Row className="mb-3">
        <Label for="author">Author</Label>
        <ReactSelect
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={historyTabStore.selectedAuthor}
          id="author"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          defaultValue={historyTabStore.appliedAuthor}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange={selection => historyTabStore.setSelectedAuthor(selection)}
          styles={{
            container: containerStyles => ({
              ...containerStyles,
              width: '100%',
            }),
          }}
          options={authorDropdownOptions}
        />
      </Row>
      <Row
        className={
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `justify-content-${historyTabStore.isFiltered ? 'between' : 'end'}`
        }
      >
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          historyTabStore.isFiltered && (
            <Button
              outline
              color="danger"
              size="sm"
              onClick={
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                () => historyTabStore.reset()
              }
            >
              Clear Filters
            </Button>
          )
        }
        <Button
          onClick={
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            () => historyTabStore.applyFilters()
          }
          color="primary"
        >
          Apply
        </Button>
      </Row>
      <Row className="border-top mt-3">
        <h6 className="pt-3">Change History</h6>
      </Row>
      <Row className="mb-3 change-history-length">
        <span>{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `Showing ${!historyTabStore.isFiltered ? 'latest' : ''} ${historyContent.length} ${
            historyContent.length !== 1 ? 'changes' : 'change'
          }`
        }</span>
      </Row>
      {historyContent}
    </div>
  );
});

const mapStoreToProps = ({ historyTabStore, firebaseUsersStore, drugStore }: IRootStore) => ({
  usersData: firebaseUsersStore.data,
  addUsersListener: firebaseUsersStore.addListener,
  getDrugs: drugStore.getEntities,
  historyTabStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationHistoryTab);
