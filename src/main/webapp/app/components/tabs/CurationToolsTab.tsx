import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore, hasAnyAuthority } from 'app/stores';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Row } from 'reactstrap';
import { FaRegCheckCircle } from 'react-icons/fa';
import { FaRegCircleXmark, FaArrowRotateLeft } from 'react-icons/fa6';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IGene } from 'app/shared/model/gene.model';
import _ from 'lodash';
import { IFlag } from 'app/shared/model/flag.model';
import { AUTHORITIES, CURRENT_REVIEWER } from 'app/config/constants/constants';
import { GeneType } from 'app/shared/model/firebase/firebase.model';
import { onValue, ref } from 'firebase/database';
import { FB_COLLECTION } from 'app/config/constants/firebase';
import SaveGeneButton from 'app/shared/button/SaveGeneButton';
import { Unsubscribe } from 'firebase/database';
import { geneIsReleased } from 'app/shared/util/entity-utils/gene-entity-utils';
import Tooltip from 'rc-tooltip';

export type ReleaseGeneTestData = {
  passed: boolean;
  text: string;
  type: 'optional' | 'required';
};

export interface ICurationToolsTabProps extends StoreProps {
  genePath: string;
  somaticGenePath: string;
  isGermline: boolean;
  hugoSymbol: string;
}

export function CurationToolsTab({
  genePath,
  somaticGenePath,
  firebaseDb,
  metaList,
  addMetaListListener,
  geneEntities,
  searchGenes,
  updateGene,
  searchFlags,
  isGermline,
  hugoSymbol,
  isDev,
  firebaseGeneService,
}: ICurationToolsTabProps) {
  const [geneName, setGeneName] = useState<string>();
  const [geneSummary, setGeneSummary] = useState<string>();
  const [geneBackground, setGeneBackground] = useState<string>();
  const [geneType, setGeneType] = useState<GeneType>();

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${genePath}/name`), snapshot => {
        setGeneName(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${genePath}/summary`), snapshot => {
        setGeneSummary(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${somaticGenePath}/background`), snapshot => {
        setGeneBackground(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${somaticGenePath}/type`), snapshot => {
        setGeneType(snapshot.val());
      }),
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [genePath, firebaseDb]);

  const reviewList = geneName ? metaList?.[geneName]?.review ?? {} : {};

  const tests: ReleaseGeneTestData[] = [
    {
      passed: reviewList
        ? !Object.keys(reviewList).some(key => key !== CURRENT_REVIEWER && key !== 'lastActiveReview' && reviewList[key])
        : true,
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
      text: 'Somatic gene background is not empty',
      type: 'required',
    },
    {
      passed: !!geneType?.ocg || !!geneType?.tsg || !!geneType?.neither || !!geneType?.insufficient_evidence,
      text: 'Somatic gene type is specified',
      type: 'optional',
    },
  ];

  const confirmButtonDisabled = tests.some(test => !test.passed && test.type === 'required');

  const [isReleased, setIsReleased] = useState<boolean>();
  const [releaseGeneClicked, setReleaseGeneClicked] = useState(false);

  const geneToUpdate = useRef<IGene>();

  useEffect(() => {
    const callback = addMetaListListener?.(FB_COLLECTION.META);

    return () => {
      callback && callback();
    };
  }, []);

  function isReleasedFlag(flag: IFlag) {
    const flagFlag = isGermline ? 'ONCOKB_GERMLINE' : 'ONCOKB_SOMATIC';
    return flag.type === 'GENE_PANEL' && flag.flag === flagFlag;
  }

  useEffect(() => {
    const geneData = geneEntities?.find(entity => entity.hugoSymbol === geneName);
    setIsReleased(geneData === undefined ? false : geneIsReleased(geneData, isGermline));
    geneToUpdate.current = geneData;
  }, [geneEntities, geneName]);

  function getStatusIcon(checkPassed: boolean) {
    const marginClassNames = 'mb-1 me-2';
    return checkPassed ? (
      <FaRegCheckCircle className={`text-success ${marginClassNames}`} />
    ) : (
      <FaRegCircleXmark className={`text-danger ${marginClassNames}`} />
    );
  }

  async function handleConfirmClick() {
    const newGene = _.cloneDeep(geneToUpdate.current);

    try {
      if (!newGene) {
        throw new Error('Error retrieving gene');
      }
      const newFlag = (await searchFlags?.({ query: 'OncoKB' }))?.['data'].find(flag => isReleasedFlag(flag));
      if (!newFlag) {
        throw new Error('Error retrieving flag');
      }

      if (newGene.flags) {
        newGene.flags.push(newFlag);
      } else {
        newGene.flags = [newFlag];
      }
      await updateGene?.(newGene);
      await searchGenes?.({ query: geneName, exact: true }); // repopulate gene store entities
      await firebaseGeneService?.saveGene(hugoSymbol);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleUndoReleaseGeneConfirmClick() {
    const newGene = _.cloneDeep(geneToUpdate.current);

    try {
      if (!newGene) {
        throw new Error('Error retrieving gene');
      }

      if (newGene.flags) {
        newGene.flags = newGene.flags.filter(flag => !isReleasedFlag(flag));
      } else {
        newGene.flags = [];
      }
      await updateGene?.(newGene);
      await searchGenes?.({ query: geneName, exact: true }); // repopulate gene store entities
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
        <>
          <Row className="mb-3">
            <Col className={'d-flex align-items-center'}>
              <FaRegCheckCircle className="text-success me-2" />
              <span>Gene is released</span>
              <Tooltip overlay={'Undo Release'}>
                <Button size={'sm'} onClick={handleUndoReleaseGeneConfirmClick} className={'ms-2'} color="danger" outline>
                  <FaArrowRotateLeft />
                </Button>
              </Tooltip>
            </Col>
          </Row>
          <Row className="border-top pt-3">
            <Col>
              <SaveGeneButton gene={geneToUpdate.current} />
            </Col>
          </Row>
        </>
      );
    }

    if (releaseGeneClicked) {
      return (
        <div>
          <div className="mb-3">
            {tests.map((test, index) => (
              <div key={index} className="mb-1">
                {getStatusIcon(test.passed)}
                <span>{test.text}</span>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-end pt-3 border-top">
            <Button className="me-2" outline color="danger" onClick={() => setReleaseGeneClicked(clicked => !clicked)}>
              Cancel
            </Button>
            <Button className="me-2" color="primary" disabled={confirmButtonDisabled} onClick={handleConfirmClick}>
              Confirm
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <Button color="primary" onClick={() => setReleaseGeneClicked(clicked => !clicked)}>
          Release Gene
        </Button>
      </div>
    );
  }

  return getContent();
}

const mapStoreToProps = ({ firebaseAppStore, firebaseMetaStore, geneStore, flagStore, authStore, firebaseGeneService }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  metaList: firebaseMetaStore.data,
  addMetaListListener: firebaseMetaStore.addListener,
  geneEntities: geneStore.entities,
  searchGenes: geneStore.searchEntities,
  updateGene: geneStore.updateEntity,
  searchFlags: flagStore.searchEntities,
  isDev: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.DEV]),
  firebaseGeneService,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationToolsTab);
