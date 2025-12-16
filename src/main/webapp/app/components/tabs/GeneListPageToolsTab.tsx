import { AUTHORITIES, CURATE_NEW_GENE_TEXT, DEFAULT_ICON_SIZE, PAGE_ROUTE } from 'app/config/constants/constants';
import GeneSelect from 'app/shared/select/GeneSelect';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore, hasAnyAuthority } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Col, Row, Spinner } from 'reactstrap';
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

function GeneListPageToolsTab({ metaData, isDev, createGene }: IGeneListPageToolsTab) {
  const selectedGene = useRef<string>();
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [showGeneExistsWarning, setShowGeneExistsWarning] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);

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
    setDownloadPending(true);
    try {
      const newGenesResp = await auditClient.getNewlyReleasedGenes();
      const newGenes = newGenesResp.data ?? [];
      if (newGenes.length === 0) {
        notifyInfo(
          'No new genes released. If you believe this is an error, please check if the gene is released. Otherwise, contact developer.',
        );
        return;
      }

      const somaticGenes = newGenes.filter(entry => entry.releaseType === 'SOMATIC').map(entry => entry.hugoSymbol);
      const germlineGenes = newGenes.filter(entry => entry.releaseType === 'GERMLINE').map(entry => entry.hugoSymbol);
      const maxRows = Math.max(somaticGenes.length, germlineGenes.length);

      const fileContent = [
        `Addition of ${somaticGenes.length} somatic and ${germlineGenes.length} germline new genes`,
        'Somatic Gene\tGermline Gene',
        ...Array.from({ length: maxRows }).map((_, idx) => `${somaticGenes[idx] ?? ''}\t${germlineGenes[idx] ?? ''}`),
      ].join('\n');
      downloadFile(`new-gene-releases-${new Date().getTime().toString()}`, fileContent);
    } catch (error) {
      notifyError(error, 'Issue fetching newly released gene list');
    } finally {
      setDownloadPending(false);
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
      {isDev && (
        <Row className="pt-3 border-top mb-3">
          <DefaultTooltip overlay={<span>Developers: use ArgoCD to trigger a cronjob to refresh</span>}>
            <div>
              <SaveGeneButton disabled />
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
            <Button color="primary" outline onClick={fetchNewlyReleasedGenes} disabled={downloadPending}>
              {downloadPending && <Spinner size="sm" className="me-2" />}
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
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneListPageToolsTab));
