import React, { useEffect, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import Tabs from './tabs';
import { Alteration, MutationPenetrance, Penetrance } from 'app/shared/model/firebase/firebase.model';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import { onValue, ref } from 'firebase/database';
import NoEntryBadge from 'app/shared/badge/NoEntryBadge';
import { ALLELE_STATE, PENETRANCE_OPTIONS } from 'app/config/constants/firebase';
import { RADIO_OPTION_NONE } from 'app/config/constants/constants';
import GeneHistoryTooltip from '../geneHistoryTooltip/GeneHistoryTooltip';
import { ParsedHistoryRecord } from 'app/pages/curation/CurationPage';
import { getMutationName } from 'app/shared/util/firebase/firebase-utils';

export interface IMutationPenetranceTabsProps extends StoreProps {
  mutationPenetrancePath: string;
  mutationName: string;
  mutationAlterations: Alteration[];
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
  textAreaClass?: string;
}

function MutationPenetranceTabs({
  mutationPenetrancePath,
  mutationName,
  mutationAlterations,
  parsedHistoryList,
  firebaseDb,
  textAreaClass,
}: IMutationPenetranceTabsProps) {
  const [mutationPenetrance, setMutationPenetrance] = useState<MutationPenetrance>(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, mutationPenetrancePath), snapshot => {
      setMutationPenetrance(snapshot.val());
    });

    return () => unsubscribe?.();
  }, [mutationPenetrancePath, firebaseDb]);

  return (
    <Tabs
      className="mt-3"
      contentClassName="px-0"
      tabs={[ALLELE_STATE.MONOALLELIC, ALLELE_STATE.BIALLELIC, ALLELE_STATE.MOSAIC].map(alleleState => {
        const lowercaseAlleleState = alleleState.toLowerCase();

        return {
          title: (
            <div className="d-flex align-items-center">
              <span>{alleleState}</span>
              {!mutationPenetrance?.[lowercaseAlleleState]?.penetrance && !mutationPenetrance?.[lowercaseAlleleState]?.description && (
                <NoEntryBadge />
              )}
            </div>
          ),
          content: (
            <div>
              <RealtimeCheckedInputGroup
                groupHeader={
                  <>
                    <span style={{ marginRight: '8px' }}>Penetrance</span>
                    {
                      <GeneHistoryTooltip
                        historyData={parsedHistoryList}
                        location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Specific Penetrance, ${alleleState}`}
                        contentFieldWhenObject="penetrance"
                      />
                    }
                  </>
                }
                isRadio
                options={[...PENETRANCE_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                  label,
                  firebasePath: `${mutationPenetrancePath}/${lowercaseAlleleState}/penetrance`,
                }))}
              />
              <RealtimeTextAreaInput
                key={lowercaseAlleleState}
                firebasePath={`${mutationPenetrancePath}/${lowercaseAlleleState}/description`}
                inputClass={textAreaClass || null}
                label="Description of Penetrance"
                labelIcon={
                  <GeneHistoryTooltip
                    historyData={parsedHistoryList}
                    location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Specific Penetrance, ${alleleState}`}
                    contentFieldWhenObject="description"
                  />
                }
                name={lowercaseAlleleState}
                parseRefs
              />
            </div>
          ),
        };
      })}
    />
  );
}

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationPenetranceTabs));
