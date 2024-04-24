import { GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import { FB_COLLECTION } from 'app/config/constants/firebase';
import { HistoryCollection } from 'app/shared/model/firebase/firebase.model';
import { downloadFile } from 'app/shared/util/file-utils';
import { getAllGeneHistoryForDateRange, getHistoryEntryStrings } from 'app/shared/util/firebase/firebase-history-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Button, Input, Label, Row, Spinner } from 'reactstrap';

function ReviewHistoryTab({ firebaseDb, drugList, getDrugs }: StoreProps) {
  const [historyCollection, setHistoryCollection] = useState<HistoryCollection>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, FB_COLLECTION.HISTORY), snapshot => {
      setHistoryCollection(snapshot.val());
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
  }, []);

  function handleDownload() {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const history = getAllGeneHistoryForDateRange(historyCollection, drugList, start, end);

    const content: string[] = [];
    if (history.gene.length > 0) {
      const segments: string[] = [];
      segments.push('### Gene\n```');
      segments.push(...getHistoryEntryStrings(history.gene));
      segments.push('```\n');
      content.push(segments.join('\n'));
    }
    if (history.alteration.length > 0) {
      const segments: string[] = [];
      segments.push('### Alteration\n```');
      segments.push(...getHistoryEntryStrings(history.alteration));
      segments.push('```\n');
      content.push(segments.join('\n'));
    }
    if (history.evidence.length > 0) {
      const segments: string[] = [];
      segments.push('### Evidence\n```');
      segments.push(...getHistoryEntryStrings(history.evidence));
      segments.push('```\n');
      content.push(segments.join('\n'));
    }

    downloadFile('README.md', content.join('\n'));
  }

  return (
    <div>
      <Row className="mb-3">
        <Label for="start-date">Start Date</Label>
        <Input id="start-date" value={startDate} onChange={event => setStartDate(event.target.value)} type="date" name="date" />
      </Row>
      <Row className="mb-3">
        <Label for="end-date">End Date</Label>
        <Input id="end-date" value={endDate} onChange={event => setEndDate(event.target.value)} type="date" name="date" />
      </Row>
      <Row className="align-items-center justify-content-end">
        {!historyCollection && <Spinner className="mr-2" color="primary" size="sm" />}
        <Button disabled={!historyCollection} onClick={handleDownload} color="primary">
          Download
        </Button>
      </Row>
    </div>
  );
}

const mapStoreToProps = ({ firebaseAppStore, drugStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  drugList: drugStore.entities,
  getDrugs: drugStore.getEntities,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(ReviewHistoryTab);
