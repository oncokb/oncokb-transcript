import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Row } from 'reactstrap';
import { FaRegCheckCircle } from 'react-icons/fa';
import { FaRegCircleXmark } from 'react-icons/fa6';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IGene } from 'app/shared/model/gene.model';
import _ from 'lodash';
import { IFlag } from 'app/shared/model/flag.model';
import { CURRENT_REVIEWER } from 'app/config/constants/constants';
import { GeneType } from 'app/shared/model/firebase/firebase.model';
import { onValue, ref } from 'firebase/database';
import { FB_COLLECTION } from 'app/config/constants/firebase';

export type ReleaseGeneTestData = {
  passed: boolean;
  text: string;
  type: 'optional' | 'required';
};

export interface ICurationToolsTabProps extends StoreProps {
  genePath: string;
}

export function CurationToolsTab({
  genePath,
  firebaseDb,
  metaList,
  addMetaListListener,
  geneEntities,
  searchGenes,
  updateGene,
  searchFlags,
}: ICurationToolsTabProps) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [geneName, setGeneName] = useState<string>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [geneSummary, setGeneSummary] = useState<string>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [geneBackground, setGeneBackground] = useState<string>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [geneType, setGeneType] = useState<GeneType>(null);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${genePath}/name`), snapshot => {
        setGeneName(snapshot.val());
      })
    );
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${genePath}/summary`), snapshot => {
        setGeneSummary(snapshot.val());
      })
    );
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${genePath}/background`), snapshot => {
        setGeneBackground(snapshot.val());
      })
    );
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${genePath}/type`), snapshot => {
        setGeneType(snapshot.val());
      })
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return () => callbacks.forEach(callback => callback?.());
  }, [genePath, firebaseDb]);

  const reviewList = metaList?.[geneName]?.review;

  const tests: ReleaseGeneTestData[] = [
    {
      passed: reviewList ? !Object.keys(reviewList).some(key => key !== CURRENT_REVIEWER && reviewList[key]) : true,
      text: 'Reviewed all content before releasing',
      type: 'required',
    },
    {
      passed: !!geneSummary,
      text: 'Gene summary is not empty',
      type: 'required',
    },
    {
      passed: !!geneBackground,
      text: 'Gene background is not empty',
      type: 'required',
    },
    {
      passed: !!geneType?.ocg || !!geneType?.tsg,
      text: 'Gene type is specified',
      type: 'optional',
    },
  ];

  const confirmButtonDisabled = tests.some(test => !test.passed && test.type === 'required');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [isReleased, setIsReleased] = useState<boolean>(null);
  const [releaseGeneClicked, setReleaseGeneClicked] = useState(false);

  const geneToUpdate = useRef<IGene>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const callback = addMetaListListener(FB_COLLECTION.META);

    return () => {
      callback && callback();
    };
  }, []);

  function isReleasedFlag(flag: IFlag) {
    return flag.type === 'GENE_PANEL' && flag.flag === 'ONCOKB';
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const geneData = geneEntities.find(entity => entity.hugoSymbol === geneName);
    setIsReleased(geneData?.flags?.some(flag => isReleasedFlag(flag)) || false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    geneToUpdate.current = geneData;
  }, [geneEntities]);

  function getStatusIcon(checkPassed: boolean) {
    const marginClassNames = 'mt-1 mr-2';
    return checkPassed ? (
      <FaRegCheckCircle className={`text-success ${marginClassNames}`} />
    ) : (
      <FaRegCircleXmark className={`text-danger ${marginClassNames}`} />
    );
  }

  async function handleConfirmClick() {
    const newGene = _.cloneDeep(geneToUpdate.current);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newFlag = (await searchFlags({ query: 'OncoKB' }))['data'].find(flag => isReleasedFlag(flag));
      if (!newFlag) {
        throw new Error('Error retrieving flag');
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (newGene.flags) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        newGene.flags.push(newFlag);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        newGene.flags = [newFlag];
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await updateGene(newGene);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await searchGenes({ query: geneName, exact: true }); // repopulate gene store entities
    } catch (error) {
      notifyError(error);
    }
  }

  function getContent() {
    if (isReleased === null) {
      // loading state
      return <></>;
    }

    if (isReleased) {
      return (
        <Row>
          <FaRegCheckCircle size="24px" className="text-success mt-1 mr-2" />
          <h6 style={{ marginTop: '6px' }}>Gene is released</h6>
        </Row>
      );
    }

    if (releaseGeneClicked) {
      return (
        <div>
          <div className="mb-3">
            {tests.map((test, index) => (
              <Row key={index} className="mb-1">
                {getStatusIcon(test.passed)}
                <span>{test.text}</span>
              </Row>
            ))}
          </div>
          <Row className="justify-content-end pt-3 border-top">
            <Button className="mr-2" outline color="danger" onClick={() => setReleaseGeneClicked(clicked => !clicked)}>
              Cancel
            </Button>
            <Button className="mr-2" color="primary" disabled={confirmButtonDisabled} onClick={handleConfirmClick}>
              Confirm
            </Button>
          </Row>
        </div>
      );
    }

    return (
      <Row>
        <Button color="primary" onClick={() => setReleaseGeneClicked(clicked => !clicked)}>
          Release Gene
        </Button>
      </Row>
    );
  }

  return getContent();
}

const mapStoreToProps = ({ firebaseAppStore, firebaseMetaStore, geneStore, flagStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  metaList: firebaseMetaStore.data,
  addMetaListListener: firebaseMetaStore.addListener,
  geneEntities: geneStore.entities,
  searchGenes: geneStore.searchEntities,
  updateGene: geneStore.updateEntity,
  searchFlags: flagStore.searchEntities,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationToolsTab);
