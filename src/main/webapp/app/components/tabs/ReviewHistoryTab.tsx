import { FB_COLLECTION } from 'app/config/constants/firebase';
import { HistoryCollection, HistoryList } from 'app/shared/model/firebase/firebase.model';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Row, Label, Input, Button } from 'reactstrap';

// export interface IReviewHistoryTabProps  StoreProps {};

function ReviewHistoryTab({ firebaseDb }: StoreProps) {
  const [historyCollection, setHistoryCollection] = useState<HistoryCollection>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, FB_COLLECTION.HISTORY), snapshot => {
      setHistoryCollection(snapshot.val());
    });

    return () => unsubscribe?.();
  }, []);

  function getAllGeneHistoryForDateRange(historyCollection: HistoryCollection, start: Date, end: Date) {
    if (end < start) {
      return [];
    }
  }

  function getGeneHistoryForDateRange(historyList: HistoryList, start: Date, end: Date) {
    if (end < start) {
      return [];
    }

    const historyLogs: string[] = [];
    for (const historyEntry of Object.values(historyList)) {
      if (Symbol.iterator in historyEntry.records) {
        for (const record of historyEntry.records) {
          // historyLogs.push(record.location + )
        }
      }
    }
    return historyLogs;
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
      <Row>
        <Button onClick={() => {}} color="primary">
          Apply
        </Button>
      </Row>
    </div>
  );
}

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(ReviewHistoryTab);
