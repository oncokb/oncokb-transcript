import React, { useEffect, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { onValue, ref } from 'firebase/database';
import { TI, Treatment } from 'app/shared/model/firebase/firebase.model';
import { getTxName, sortByTxLevel } from 'app/shared/util/firebase/firebase-utils';
import { Button } from 'reactstrap';
import ModifyTherapyModal from 'app/shared/modal/ModifyTherapyModal';
import { GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import TherapyCollapsible from '../collapsible/TherapyCollapsible';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';

export interface ITherapiesList extends StoreProps {
  tisPath: string;
  parsedHistoryList: Map<string, FlattenedHistory[]>;
  mutationName: string;
  cancerTypeName: string;
  cancerTypePath: string;
}

type TxObject = {
  tiIndex: number;
  treatmentIndex: number;
  treatment: Treatment;
};

const TherapiesList = ({
  tisPath,
  parsedHistoryList,
  mutationName,
  cancerTypeName,
  cancerTypePath,
  firebaseDb,
  drugList,
  getDrugs,
  createDrug,
  addTreatment,
  modifyTherapyModalStore,
}: ITherapiesList) => {
  const [txObjects, setTxObjects] = useState<TxObject[]>([]);
  const [isSorted, setIsSorted] = useState(false);
  const [tisLength, setTisLength] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tisRef = ref(firebaseDb, tisPath);
    const unsubscribe = onValue(tisRef, snapshot => {
      const tis = snapshot.val() as TI[];
      setTisLength(tis.length);
      const fetchedTxObjects = tis.reduce((accumulator: TxObject[], ti, tiIndex) => {
        if (!ti.treatments) {
          return accumulator;
        }

        return accumulator.concat(
          ti.treatments.map((treatment, treatmentIndex) => {
            return {
              tiIndex,
              treatmentIndex,
              treatment,
            };
          })
        );
      }, []);

      if (fetchedTxObjects.length !== txObjects.length) {
        if (!isSorted) {
          fetchedTxObjects.sort((txA, txB) => {
            const compResult = sortByTxLevel(txA.treatment.level, txB.treatment.level);
            if (compResult === 0) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              return getTxName(drugList, txA.treatment.name).localeCompare(getTxName(drugList, txB.treatment.name));
            } else {
              return compResult;
            }
          });
          setIsSorted(true);
        }
        setTxObjects(fetchedTxObjects);
      }
    });

    return () => unsubscribe?.();
  }, [txObjects, firebaseDb, tisPath]);

  return (
    <>
      {txObjects.map((therapy, index) => {
        return (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <div key={therapy.treatment.name_uuid} className={index > 0 ? 'mt-2' : null}>
            <TherapyCollapsible
              therapyPath={`${tisPath}/${therapy.tiIndex}/treatments/${therapy.treatmentIndex}`}
              parsedHistoryList={parsedHistoryList}
              mutationName={mutationName}
              cancerTypeName={cancerTypeName}
              cancerTypePath={cancerTypePath}
            />
          </div>
        );
      })}
      <Button
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        className={txObjects.length > 0 ? `mt-2` : null}
        outline
        color="primary"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onClick={() => modifyTherapyModalStore.openModal(`new_treatment_for_${cancerTypePath}`)}
      >
        Add Therapy
      </Button>
      <ModifyTherapyModal
        treatmentUuid={`new_treatment_for_${cancerTypePath}`}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        drugList={drugList}
        cancerTypePath={cancerTypePath}
        onConfirm={async (newTreatment, newDrugs) => {
          try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await Promise.all(newDrugs.map(drug => createDrug(drug)));
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await addTreatment(`${tisPath}/${tisLength - 1}/treatments`, newTreatment);
          } catch (error) {
            notifyError(error);
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          modifyTherapyModalStore.closeModal();
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onCancel={modifyTherapyModalStore.closeModal}
      />
    </>
  );
};

const mapStoreToProps = ({ firebaseAppStore, drugStore, modifyTherapyModalStore, firebaseGeneService }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  drugList: drugStore.entities,
  getDrugs: drugStore.getEntities,
  createDrug: drugStore.createEntity,
  addTreatment: firebaseGeneService.addTreatment,
  modifyTherapyModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TherapiesList));
