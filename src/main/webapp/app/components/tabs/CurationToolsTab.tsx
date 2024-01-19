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

export type ReleaseGeneTestData = {
  passed: boolean;
  text: string;
  type: 'optional' | 'required';
};

export function CurationToolsTab({ metaList, addMetaListListener, gene, geneEntities, searchGenes, updateGene, searchFlags }: StoreProps) {
  const reviewList = metaList?.[gene.name].review;

  const tests: ReleaseGeneTestData[] = [
    {
      passed: reviewList ? !Object.keys(reviewList).some(key => key !== CURRENT_REVIEWER && reviewList[key]) : true,
      text: 'Reviewed all content before releasing',
      type: 'required',
    },
    {
      passed: !!gene.summary,
      text: 'Gene summary is not empty',
      type: 'required',
    },
    {
      passed: !!gene.background,
      text: 'Gene background is not empty',
      type: 'required',
    },
    {
      passed: !!gene.type.ocg || !!gene.type.tsg,
      text: 'Gene type is specified',
      type: 'optional',
    },
  ];

  const confirmButtonDisabled = tests.some(test => !test.passed && test.type === 'required');

  const [isReleased, setIsReleased] = useState<boolean>(null);
  const [releaseGeneClicked, setReleaseGeneClicked] = useState(false);

  const geneToUpdate = useRef<IGene>(null);

  useEffect(() => {
    const callback = addMetaListListener();

    return () => {
      callback && callback();
    };
  }, []);

  function isReleasedFlag(flag: IFlag) {
    return flag.type === 'GENE_PANEL' && flag.flag === 'ONCOKB';
  }

  useEffect(() => {
    const geneData = geneEntities.find(entity => entity.hugoSymbol === gene.name);
    setIsReleased(geneData?.flags?.some(flag => isReleasedFlag(flag)) || false);
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
      const newFlag = (await searchFlags({ query: 'OncoKB' }))['data'].find(flag => isReleasedFlag(flag));
      if (!newFlag) {
        throw new Error('Error retrieving flag');
      }

      if (newGene.flags) {
        newGene.flags.push(newFlag);
      } else {
        newGene.flags = [newFlag];
      }
      await updateGene(newGene);
      await searchGenes({ query: gene.name, exact: true }); // repopulate gene store entities
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
                {test.text}
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

const mapStoreToProps = ({ firebaseMetaStore, firebaseGeneStore, geneStore, flagStore }: IRootStore) => ({
  metaList: firebaseMetaStore.metaList,
  addMetaListListener: firebaseMetaStore.addMetaListListener,
  gene: firebaseGeneStore.data,
  geneEntities: geneStore.entities,
  searchGenes: geneStore.searchEntities,
  updateGene: geneStore.updateEntity,
  searchFlags: flagStore.searchEntities,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationToolsTab);
