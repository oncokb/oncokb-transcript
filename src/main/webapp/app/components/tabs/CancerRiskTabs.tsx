import React, { useEffect, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import Tabs from './tabs';
import { CancerRisk } from 'app/shared/model/firebase/firebase.model';
import { RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import { onValue, ref } from 'firebase/database';
import NoEntryBadge from 'app/shared/badge/NoEntryBadge';
import { ALLELE_STATE } from 'app/config/constants/firebase';

export interface ICancerRiskTabsProps extends StoreProps {
  cancerRiskPath: string;
  textAreaClass?: string;
}

function CancerRiskTabs({ cancerRiskPath, firebaseDb, textAreaClass }: ICancerRiskTabsProps) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [cancerRisk, setCancerRisk] = useState<CancerRisk>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const unsubscribe = onValue(ref(firebaseDb, cancerRiskPath), snapshot => {
      setCancerRisk(snapshot.val());
    });

    return () => unsubscribe?.();
  }, [cancerRiskPath, firebaseDb]);

  return (
    <>
      <b>Cancer Risk</b>
      <Tabs
        className="mt-3"
        contentClassName="px-0"
        tabs={[ALLELE_STATE.MONOALLELIC, ALLELE_STATE.BIALLELIC, ALLELE_STATE.MOSAIC].map(alleleState => {
          const lowercaseAlleleState = alleleState.toLowerCase();

          return {
            title: (
              <div className="d-flex align-items-center">
                <span>{alleleState}</span>
                {!cancerRisk?.[lowercaseAlleleState] && <NoEntryBadge />}
              </div>
            ),
            content: (
              <RealtimeTextAreaInput
                key={lowercaseAlleleState}
                firebasePath={`${cancerRiskPath}/${lowercaseAlleleState}`}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                inputClass={textAreaClass || null}
                label=""
                name={lowercaseAlleleState}
                parseRefs
              />
            ),
          };
        })}
      />
    </>
  );
}

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CancerRiskTabs));
