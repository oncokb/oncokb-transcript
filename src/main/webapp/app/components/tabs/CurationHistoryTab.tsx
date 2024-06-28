import { APP_HISTORY_FORMAT, APP_TIME_FORMAT, GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TextFormat } from 'react-jhipster';
import ReactSelect from 'react-select';
import { Button, Input, Label } from 'reactstrap';
import constructTimeSeriesData, { formatLocation } from '../geneHistoryTooltip/gene-history-tooltip-utils';
import { ExtraTimeSeriesEventData, RequiredTimeSeriesEventData } from '../timeSeries/TimeSeries';
import './curation-history-tab.scss';
import { IDrug } from 'app/shared/model/drug.model';
import { GREY } from 'app/config/colors';
import { FlattenedHistory, isBetweenDates } from 'app/shared/util/firebase/firebase-history-utils';
import _ from 'lodash';

export interface ICurationHistoryTabProps extends StoreProps {
  historyData: FlattenedHistory[];
}

const CurationHistoryTab = observer(({ historyData, getUsers, users, historyTabStore, getDrugs, mutations }: ICurationHistoryTabProps) => {
  const [mutationInput, setMutationInput] = useState('');
  const [drugList, setDrugList] = useState<IDrug[]>([]);

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
    if (users) {
      for (const user of users) {
        options.push({ value: user.email, label: `${user.firstName} ${user.lastName}` });
      }
    }
    return options;
  }, [users]);

  useEffect(() => {
    getUsers({});
    return () => {
      historyTabStore.reset();
    };
  }, []);

  const alterations = useMemo(() => {
    const alts = new Set<string>();
    for (const mutation of mutations || []) {
      for (const alteration of mutation.alterations || []) {
        alts.add(alteration.alteration);
      }
      mutation.name.split(',').forEach(alt => alts.add(alt.trim()));
    }
    return alts;
  }, [mutations]);

  const mutationOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];

    const searchedMutation = mutationInput.trim().toLowerCase();
    let searchedMutationExists = false;
    for (const alt of alterations) {
      if (alt.toLowerCase() === searchedMutation) {
        searchedMutationExists = true;
      }
      options.push({ label: alt, value: alt });
    }

    return !mutationInput || searchedMutationExists ? options : [{ label: mutationInput, value: mutationInput }, ...options];
  }, [alterations, mutationInput]);

  useEffect(() => {
    async function fetchAllDrugs() {
      const drugs = await getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: ['id,asc'] });
      setDrugList(drugs['data']);
    }

    fetchAllDrugs();
  }, []);

  function getHistoryContent(historyTabData: FlattenedHistory[], maxLength: number = null) {
    const filteredData = historyTabData.filter(data => {
      const author = historyTabStore.appliedAuthor;
      const mutation = historyTabStore.appliedMutation;
      const startDate = historyTabStore.appliedStartDate && new Date(historyTabStore.appliedStartDate);
      const endDate = historyTabStore.appliedEndDate && new Date(historyTabStore.appliedEndDate);

      let matchesAuthor = false;
      let matchesMutation = false;
      let matchesDates = false;
      const timeStamp = new Date(data.timeStamp);
      if (!author || author.label === data.admin || author.label === data.lastEditBy) {
        matchesAuthor = true;
      }
      if (
        !mutation ||
        data.location.toLowerCase().includes(mutation.label.toLowerCase()) ||
        data.info?.mutation?.name.toLowerCase().includes(mutation.label.toLowerCase())
      ) {
        matchesMutation = true;
      }
      matchesDates = isBetweenDates(timeStamp, startDate, endDate);
      return matchesAuthor && matchesMutation && matchesDates;
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
      const isContentAvailable = data.content['props']?.children ? true : false;

      content.push(
        <div>
          <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '22px' }}>
            <span>
              <TextFormat value={data.createdAt} type="date" format={APP_HISTORY_FORMAT} />
              <span className="me-2" />
              <TextFormat value={data.createdAt} type="date" format={APP_TIME_FORMAT} />
            </span>
            <DefaultTooltip
              overlayStyle={{ maxWidth: 600 }}
              overlayInnerStyle={{ maxHeight: '400px', overflow: 'auto', maxWidth: 'inherit' }}
              overlay={isContentAvailable ? data.content : 'No history available'}
            >
              <FaHistory color={isContentAvailable ? 'black' : GREY} />
            </DefaultTooltip>
          </div>
          <div className="mb-2">
            <span>{`${data.admin} approved ${data.operation} by ${data.editBy}`}</span>
          </div>
          <div className="border-bottom pb-3 mb-3">
            <span>
              <b>Location: </b> {`${formatLocation(data.location, drugList, data.objectField)}`}
            </span>
          </div>
        </div>,
      );
    }
    return content;
  }

  const historyContent = getHistoryContent(parsedHistoryData, historyTabStore.isFiltered ? null : 10);

  return (
    <div>
      <div className="mb-3">
        <Label for="start-date">Start Date</Label>
        <Input
          id="start-date"
          value={historyTabStore.selectedStartDate}
          defaultValue={historyTabStore.appliedStartDate}
          onChange={event => historyTabStore.setSelectedStartDate(event.target.value)}
          type="date"
          name="date"
        />
      </div>
      <div className="mb-3">
        <Label for="end-date">End Date</Label>
        <Input
          id="end-date"
          value={historyTabStore.selectedEndDate}
          defaultValue={historyTabStore.appliedEndDate}
          onChange={event => historyTabStore.setSelectedEndDate(event.target.value)}
          type="date"
          name="date"
        />
      </div>
      <div className="mb-3">
        <Label for="author">Author</Label>
        <ReactSelect
          value={historyTabStore.selectedAuthor}
          id="author"
          defaultValue={historyTabStore.appliedAuthor}
          onChange={selection => historyTabStore.setSelectedAuthor(selection)}
          styles={{
            container: containerStyles => ({
              ...containerStyles,
              width: '100%',
            }),
          }}
          options={authorDropdownOptions}
        />
      </div>
      <div className="mb-3">
        <Label for="mutation">Mutation</Label>
        <ReactSelect
          value={historyTabStore.selectedMutation}
          id="mutation"
          defaultValue={historyTabStore.appliedMutation}
          onInputChange={setMutationInput}
          onChange={selection => historyTabStore.setSelectedMutation(selection)}
          styles={{
            container: containerStyles => ({
              ...containerStyles,
              width: '100%',
            }),
          }}
          options={mutationOptions}
        />
      </div>
      <div className={`d-flex justify-content-${historyTabStore.isFiltered ? 'between' : 'end'}`}>
        {historyTabStore.isFiltered && (
          <Button outline color="danger" size="sm" onClick={() => historyTabStore.reset()}>
            Clear Filters
          </Button>
        )}
        <Button onClick={() => historyTabStore.applyFilters()} color="primary">
          Apply
        </Button>
      </div>
      <div className="border-top mt-3">
        <h6 className="pt-3">Change History</h6>
      </div>
      <div className="mb-3 change-history-length">
        <span>{`Showing ${!historyTabStore.isFiltered ? 'latest' : ''} ${historyContent.length} ${
          historyContent.length !== 1 ? 'changes' : 'change'
        }`}</span>
      </div>
      {historyContent}
    </div>
  );
});

const mapStoreToProps = ({ historyTabStore, drugStore, userStore, firebaseMutationListStore }: IRootStore) => ({
  users: userStore.entities,
  getUsers: userStore.getEntities,
  getDrugs: drugStore.getEntities,
  historyTabStore,
  mutations: firebaseMutationListStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationHistoryTab);
