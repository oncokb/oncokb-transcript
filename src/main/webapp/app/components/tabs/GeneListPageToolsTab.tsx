import { AUTHORITIES, CURATE_NEW_GENE_TEXT, DEFAULT_ICON_SIZE, PAGE_ROUTE } from 'app/config/constants/constants';
import GeneSelect from 'app/shared/select/GeneSelect';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore, hasAnyAuthority } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Col, Row } from 'reactstrap';
import './curation-tools-tab.scss';
import { MetaCollection } from 'app/shared/model/firebase/firebase.model';
import SaveGeneButton from 'app/shared/button/SaveGeneButton';
import { auditClient } from 'app/shared/api/clients';
import { notifyError, notifyInfo } from 'app/oncokb-commons/components/util/NotificationUtils';
import { downloadFile } from 'app/shared/util/file-utils';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import EvidenceDownloader from '../data-download/EvidenceDownloader';

export interface IGeneListPageToolsTab extends StoreProps {
  metaData: MetaCollection | null;
}

function GeneListPageToolsTab({ metaData, isDev, createGene, isGermline }: IGeneListPageToolsTab) {
  const selectedGene = useRef<string>();
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [showGeneExistsWarning, setShowGeneExistsWarning] = useState(false);

  function handleChangeSelectedGene(option) {
    const gene = option?.label;
    selectedGene.current = gene;

    if (!gene) {
      setCreateButtonDisabled(true);
      setShowGeneExistsWarning(false);
    } else if (metaData && Object.keys(metaData).includes(gene)) {
      setCreateButtonDisabled(true);
      setShowGeneExistsWarning(true);
    } else {
      setCreateButtonDisabled(false);
      setShowGeneExistsWarning(false);
    }
  }

  async function handleCreateGene() {
    if (selectedGene.current !== undefined) {
      await createGene?.(selectedGene.current, false, `${PAGE_ROUTE.CURATION}/${selectedGene.current}/somatic`);
    }
  }

  async function fetchNewlyReleasedGenes() {
    try {
      const newGenesResp = await auditClient.getNewlyReleasedGenes();
      const newGenes = newGenesResp.data;
      if (newGenes.length === 0) {
        notifyInfo(
          'No new genes released. If you believe this is an error, please check if the gene is released. Otherwise, contact developer.',
        );
        return;
      }
      const fileContent = [`Addition of ${newGenesResp.data.length} new genes`, ...newGenesResp.data].join('\n');
      downloadFile(`new-gene-releases-${new Date().getTime().toString()}`, fileContent);
    } catch (error) {
      notifyError(error, 'Issue fetching newly released gene list');
    }
  }

  return (
    <>
      <Row>
        <Col className="mb-3">
          <div>
            <h6 className="mb-2">{CURATE_NEW_GENE_TEXT}</h6>
            <div className="mb-2">
              <GeneSelect onChange={handleChangeSelectedGene} />
            </div>
            <div className={`d-flex align-items-center ${showGeneExistsWarning ? 'justify-content-between' : 'justify-content-end'}`}>
              {showGeneExistsWarning && (
                <div className="error-message me-2">
                  <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} color="danger" />
                  <span>Gene already exists</span>
                </div>
              )}
              <Button color="primary" disabled={createButtonDisabled} onClick={handleCreateGene}>
                Create
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="pt-3 border-top mb-3">
        <div>
          <h6 className="mb-2">Download Latest Data</h6>
          <EvidenceDownloader />
        </div>
      </Row>
      {!isGermline && isDev && (
        <Row className="pt-3 border-top mb-3">
          <DefaultTooltip overlay={<span>Please use cronjob to trigger a full refresh</span>}>
            <div>
              <SaveGeneButton disabled={!isGermline} />
            </div>
          </DefaultTooltip>
        </Row>
      )}
      <Row>
        <Col>
          <DefaultTooltip
            overlay={'Click this button to download a file containing a list of newly released genes since the last OncoKB data release.'}
            mouseEnterDelay={0.25}
          >
            <Button color="primary" outline onClick={fetchNewlyReleasedGenes}>
              Download New Genes List
            </Button>
          </DefaultTooltip>
        </Col>
      </Row>
    </>
  );
}

const mapStoreToProps = ({ firebaseGeneService, authStore, routerStore }: IRootStore) => ({
  createGene: firebaseGeneService.createGene,
  isDev: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.DEV]),
  isGermline: routerStore.isGermline,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneListPageToolsTab));
