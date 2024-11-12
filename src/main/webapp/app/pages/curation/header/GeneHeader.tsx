import { CBIOPORTAL, COSMIC, ENTITY_TYPE, REFERENCE_GENOME } from 'app/config/constants/constants';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import { HgncLink } from 'app/shared/links/HgncLink';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import React, { useEffect, useMemo, useState } from 'react';
import WithSeparator from 'react-with-separator';
import { IGene } from 'app/shared/model/gene.model';
import { Col, Row } from 'reactstrap';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { getCbioportalResultsPageMutationTabUrl } from 'app/shared/util/url-utils';
import GeneAliasesDescription from 'app/oncokb-commons/components/texts/GeneAliasesDescription';
import { GREY } from 'app/config/colors';
import { ITranscript } from 'app/shared/model/transcript.model';
import EnsemblIdText from 'app/shared/text/EnsemblIdText';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';
import RefSeqText from 'app/shared/text/RefSeqText';
import { InlineDivider } from 'app/shared/links/PubmedGeneArticlesLink';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import axios from 'axios';

const apiUrl = getEntityResourcePath(ENTITY_TYPE.TRANSCRIPT);

async function fetchOncokbCanonicalTranscripts(ensemblGenes: IEnsemblGene[]) {
  const requests = ensemblGenes?.map(async gene => {
    const response = await axios.get<ITranscript[]>(`${apiUrl}?ensemblGeneId.equals=${gene.id}`);
    const transcripts = response.data;
    const canonicalTranscript = transcripts.find(transcript => transcript.canonical === true);
    return canonicalTranscript;
  });

  const canonicalTranscripts = await Promise.all(requests);
  return canonicalTranscripts.filter(ct => ct !== undefined) as ITranscript[];
}

export interface IGeneHeaderProps {
  firebaseGenePath: string;
  geneEntity: IGene;
  isReviewing?: boolean;
}

const GeneHeader = ({ firebaseGenePath, geneEntity, isReviewing }: IGeneHeaderProps) => {
  const hideEntrezGeneId = geneEntity.hugoSymbol === 'Other Biomarkers';

  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [transcripts, setTranscripts] = useState<ITranscript[]>();

  useEffect(() => {
    if (!geneEntity?.ensemblGenes) return;
    setLoadingTranscripts(true);
    fetchOncokbCanonicalTranscripts(geneEntity?.ensemblGenes)
      .then(results => setTranscripts(results))
      .finally(() => setLoadingTranscripts(false));
  }, [geneEntity]);

  const transcriptInfoByReferenceGenome = useMemo(() => {
    const grch37 = transcripts?.find(transcript => transcript?.referenceGenome === ReferenceGenome.GRCh37);
    const grch38 = transcripts?.find(transcript => transcript?.referenceGenome === ReferenceGenome.GRCh38);
    return {
      [REFERENCE_GENOME.GRCH37]: {
        ensemblTranscriptId: grch37?.ensemblTranscriptId ?? '',
        referenceSequenceId: grch37?.referenceSequenceId ?? '',
      },
      [REFERENCE_GENOME.GRCH38]: {
        ensemblTranscriptId: grch38?.ensemblTranscriptId ?? '',
        referenceSequenceId: grch38?.referenceSequenceId ?? '',
      },
    };
  }, [transcripts]);

  return (
    <Row className={'mb-2'}>
      <Col>
        <div style={{ width: '100%' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-baseline mb-1">
              <span style={{ fontSize: '3rem', lineHeight: 1 }} className={'me-2'}>
                {geneEntity.hugoSymbol}
              </span>
              {!isReviewing && (
                <>
                  <CommentIcon id={`${geneEntity.hugoSymbol}_curation_page`} path={`${firebaseGenePath}/name_comments`} />
                  {geneEntity?.synonyms && geneEntity.synonyms.length > 0 && (
                    <GeneAliasesDescription geneAliases={geneEntity.synonyms.map(s => s.name)} className={'ms-2'} style={{ color: GREY }} />
                  )}
                </>
              )}
            </div>
          </div>
          {!isReviewing && (
            <>
              <div className="d-flex">
                <WithSeparator separator={InlineDivider}>
                  {!hideEntrezGeneId && geneEntity?.entrezGeneId !== undefined && <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />}
                  {geneEntity?.hgncId && <HgncLink id={geneEntity.hgncId} />}
                  <ExternalLinkIcon link={getCbioportalResultsPageMutationTabUrl(geneEntity.hugoSymbol)}>{CBIOPORTAL}</ExternalLinkIcon>
                  <ExternalLinkIcon link={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${geneEntity.hugoSymbol}`}>
                    {COSMIC}
                  </ExternalLinkIcon>
                </WithSeparator>
              </div>
              {!loadingTranscripts ? (
                <>
                  {(transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH37].ensemblTranscriptId ||
                    transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH38].ensemblTranscriptId) && (
                    <div className="d-flex">
                      <div>Ensembl Transcript: </div>
                      <EnsemblIdText
                        grch37={transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH37].ensemblTranscriptId}
                        grch38={transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH38].ensemblTranscriptId}
                      />
                    </div>
                  )}
                  {(transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH37].referenceSequenceId ||
                    transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH38].referenceSequenceId) && (
                    <div className="d-flex">
                      <div>Ref Seq:</div>
                      <RefSeqText
                        grch37={transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH37].referenceSequenceId}
                        grch38={transcriptInfoByReferenceGenome[REFERENCE_GENOME.GRCH38].referenceSequenceId}
                      />
                    </div>
                  )}
                </>
              ) : undefined}
            </>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default GeneHeader;
