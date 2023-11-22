import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Col, Input, Row } from 'reactstrap';
import { IRootStore } from 'app/stores';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import {
  CBIOPORTAL,
  COSMIC,
  GERMLINE_INHERITANCE_MECHANISM,
  MUTATION_EFFECT,
  PAGE_ROUTE,
  PATHOGENICITY,
  PENETRANCE,
} from 'app/config/constants/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getCancerTypeName, getSectionClassName } from 'app/shared/util/utils';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import { getFirebasePath, getMutationName, getTxName } from 'app/shared/util/firebase/firebase-utils';
import Collapsible, { NestLevelType } from 'app/pages/curation/collapsible/Collapsible';
import styles from './styles.module.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { FIREBASE_ONCOGENICITY, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import RealtimeDropdownInput from 'app/shared/firebase/input/RealtimeDropdownInput';
import { GENE_TYPE, GENE_TYPE_KEY } from 'app/config/constants/firebase';
import VusTable from '../../shared/table/VusTable';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import { FaAccessibleIcon } from 'react-icons/fa';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

const CurationPage = (props: ICurationPageProps) => {
  const history = useHistory();
  const hugoSymbol = props.match.params.hugoSymbol;
  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);
  const [mutationFilter, setMutationFilter] = useState('');

  useEffect(() => {
    props.findAllGeneEntities(hugoSymbol);
    const cleanupCallbacks = [];
    cleanupCallbacks.push(props.addListener(firebaseGenePath));
    cleanupCallbacks.push(props.addMetaCollaboratorsListener());
    cleanupCallbacks.push(props.addDrugListListener());
    cleanupCallbacks.push(() => props.metaCollaboratorsData && props.updateCollaborator(hugoSymbol, false));
    return () => cleanupCallbacks.forEach(callback => callback && callback());
  }, []);

  const geneEntity = useMemo(() => {
    return props.entities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [props.entities]);

  useEffect(() => {
    if (props.metaCollaboratorsData && props.data?.name) {
      props.updateCollaborator(props.data.name, true).catch(error => {
        notifyError(error);
        history.push(PAGE_ROUTE.CURATION);
      });
    }
  }, [props.metaCollaboratorsData, props.data]);

  return !!props.data && props.drugList && !!geneEntity ? (
    <div>
      <Row>
        <Col>
          <h2>Gene: {props.data.name}</h2>
        </Col>
      </Row>
      <Row className={`${getSectionClassName()} justify-content-between`}>
        <Col>
          <div className={'d-flex mb-2'}>
            <div>
              <span className="font-weight-bold">Entrez Gene:</span>
              <span className="ml-1">
                <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />
              </span>
            </div>
            <div className="ml-2">
              <span className="font-weight-bold">Gene aliases:</span>
              <span className="ml-1">
                <PubmedGeneArticlesLink hugoSymbols={geneEntity.geneAliases?.map(alias => alias.name)} />
              </span>
            </div>
          </div>
          <RealtimeTextAreaInput fieldKey="summary" label="Summary" />
          <RealtimeCheckedInputGroup
            groupHeader="Gene Type"
            options={[GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE].map(label => {
              return {
                label,
                fieldKey: GENE_TYPE_KEY[label],
              };
            })}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <RealtimeCheckedInputGroup
            groupHeader="Penetrance"
            isRadio
            options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => {
              return {
                label,
                fieldKey: 'penetrance',
              };
            })}
          />
        </Col>
      </Row>
      <Row className={'mb-5'}>
        <Col>
          <RealtimeTextAreaInput fieldKey="background" inputClass={styles.textarea} label="Background" name="geneBackground" />
          <div className="mb-2">
            <AutoParseRefField summary={props.data.background} />
          </div>
          <div>
            <span className="font-weight-bold mr-2">External Links:</span>
            <WithSeparator separator={InlineDivider}>
              <a href={`https://cbioportal.mskcc.org/ln?q=${props.data.name}`} target="_blank" rel="noopener noreferrer">
                {CBIOPORTAL} <ExternalLinkIcon />
              </a>
              <a href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${props.data.name}`} target="_blank" rel="noopener noreferrer">
                {COSMIC} <ExternalLinkIcon />
              </a>
            </WithSeparator>
          </div>
        </Col>
      </Row>
      {props.data.mutations && (
        <div className={'mb-5'}>
          <Row>
            <Col>
              <div className={'d-flex justify-content-between align-items-center mb-2'}>
                <div className={'h5'}>Mutations:</div>
                <div>
                  <Input placeholder={'Search Mutation'} value={mutationFilter} onChange={event => setMutationFilter(event.target.value)} />
                </div>
              </div>
            </Col>
          </Row>
          {props.data.mutations
            .filter(mutation => {
              return !mutationFilter || getMutationName(mutation).toLowerCase().includes(mutationFilter.toLowerCase());
            })
            .map((mutation, mutationIndex) => (
              <Row key={mutationIndex} className={'mb-2'}>
                <Col>
                  <Collapsible
                    nestLevel={NestLevelType.MUTATION}
                    className={'mb-1'}
                    title={`Mutation: ${getMutationName(mutation)}`}
                    mutationUuid={mutation.name_uuid}
                  >
                    <Collapsible nestLevel={NestLevelType.MUTATION_EFFECT} title={'Mutation Effect'}>
                      <Collapsible nestLevel={NestLevelType.BIOLOGICAL_EFFECT} title={'Biological Effect'}>
                        <RealtimeCheckedInputGroup
                          groupHeader="Mutation Effect"
                          isRadio
                          options={[
                            MUTATION_EFFECT.GAIN_OF_FUNCTION,
                            MUTATION_EFFECT.LIKELY_GAIN_OF_FUNCTION,
                            MUTATION_EFFECT.LOSS_OF_FUNCTION,
                            MUTATION_EFFECT.LIKELY_LOSS_OF_FUNCTION,
                            MUTATION_EFFECT.SWITCH_OF_FUNCTION,
                            MUTATION_EFFECT.LIKELY_SWITCH_OF_FUNCTION,
                            MUTATION_EFFECT.NEUTRAL,
                            MUTATION_EFFECT.LIKELY_NEUTRAL,
                            MUTATION_EFFECT.INCONCLUSIVE,
                          ].map(label => ({
                            label,
                            fieldKey: `mutations/${mutationIndex}/mutation_effect/effect`,
                          }))}
                        />
                        <RealtimeTextAreaInput
                          fieldKey={`mutations/${mutationIndex}/mutation_effect/description`}
                          inputClass={styles.textarea}
                          label="Description of Evidence"
                          name="description"
                        />
                      </Collapsible>
                      <Collapsible nestLevel={NestLevelType.SOMATIC} className={'mt-2'} title={'Somatic'}>
                        <RealtimeCheckedInputGroup
                          groupHeader="Oncogenic"
                          isRadio
                          options={[
                            FIREBASE_ONCOGENICITY.YES,
                            FIREBASE_ONCOGENICITY.LIKELY,
                            FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL,
                            FIREBASE_ONCOGENICITY.INCONCLUSIVE,
                            FIREBASE_ONCOGENICITY.RESISTANCE,
                          ].map(label => ({
                            label,
                            fieldKey: `mutations/${mutationIndex}/mutation_effect/oncogenic`,
                          }))}
                        />
                      </Collapsible>
                      {mutation.mutation_effect.germline && (
                        <Collapsible nestLevel={NestLevelType.GERMLINE} className={'mt-2'} title={'Germline'}>
                          <RealtimeCheckedInputGroup
                            groupHeader="Pathogenic"
                            isRadio
                            options={[
                              PATHOGENICITY.PATHOGENIC,
                              PATHOGENICITY.LIKELY_PATHOGENIC,
                              PATHOGENICITY.BENIGN,
                              PATHOGENICITY.LIKELY_BENIGN,
                              PATHOGENICITY.UNKNOWN,
                            ].map(label => ({
                              label,
                              fieldKey: `mutations/${mutationIndex}/mutation_effect/germline/pathogenic`,
                            }))}
                          />
                          <RealtimeCheckedInputGroup
                            groupHeader="Penetrance"
                            isRadio
                            options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => ({
                              label,
                              fieldKey: `mutations/${mutationIndex}/mutation_effect/germline/penetrance`,
                            }))}
                          />
                          <RealtimeCheckedInputGroup
                            groupHeader="Mechanism of Inheritance"
                            isRadio
                            options={[GERMLINE_INHERITANCE_MECHANISM.RECESSIVE, GERMLINE_INHERITANCE_MECHANISM.DOMINANT].map(label => ({
                              label,
                              fieldKey: `mutations/${mutationIndex}/mutation_effect/germline/inheritanceMechanism`,
                            }))}
                          />
                          <RealtimeTextAreaInput
                            fieldKey={`mutations/${mutationIndex}/mutation_effect/germline/cancerRisk`}
                            inputClass={styles.textarea}
                            label="Cancer Risk"
                            name="cancerRisk"
                          />
                        </Collapsible>
                      )}
                    </Collapsible>
                    {mutation.tumors &&
                      mutation.tumors.map((tumor, tumorIndex) => (
                        <Collapsible
                          className={'mt-2'}
                          mutationUuid={mutation.name_uuid}
                          cancerTypeUuid={tumor.cancerTypes_uuid}
                          key={tumor.cancerTypes_uuid}
                          nestLevel={NestLevelType.CANCER_TYPE}
                          title={`Cancer Type: ${tumor.cancerTypes.map(cancerType => getCancerTypeName(cancerType)).join(', ')}`}
                        >
                          <RealtimeTextAreaInput
                            fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/summary`}
                            inputClass={styles.textarea}
                            label="Therapeutic Summary (Optional)"
                            name="txSummary"
                          />
                          {tumor.TIs.reduce((accumulator, ti, tiIndex) => {
                            if (!ti.treatments) {
                              return accumulator;
                            }
                            return accumulator.concat(
                              ti.treatments.map((treatment, treatmentIndex) => {
                                return (
                                  <Collapsible
                                    className={'mt-2'}
                                    key={tumor.cancerTypes_uuid}
                                    nestLevel={NestLevelType.THERAPY}
                                    title={`Therapy: ${getTxName(props.drugList, treatment.name)}`}
                                  >
                                    <RealtimeDropdownInput
                                      fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/level`}
                                      label="Highest level of evidence"
                                      name="level"
                                      options={[TX_LEVELS.LEVEL_NO, TX_LEVELS.LEVEL_1, TX_LEVELS.LEVEL_2]}
                                    />
                                    <RealtimeDropdownInput
                                      fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagation`}
                                      label="Level of Evidence in other solid tumor types"
                                      name="propagationLevel"
                                      options={[]} // Todo
                                    />
                                    <RealtimeDropdownInput
                                      fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagationLiquid`}
                                      label="Level of Evidence in other liquid tumor types"
                                      name="propagationLiquidLevel"
                                      options={[]}
                                    />
                                    <RealtimeDropdownInput
                                      fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/fdaLevel`}
                                      label="FDA Level of Evidence"
                                      name="propagationLiquidLevel"
                                      options={[]}
                                    />
                                    <RealtimeTextAreaInput
                                      fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/description`}
                                      inputClass={styles.textarea}
                                      label="Description of Evidence"
                                      name="evidenceDescription"
                                    />
                                    <div className="mb-2">
                                      <AutoParseRefField summary={treatment.description} />
                                    </div>
                                  </Collapsible>
                                );
                              })
                            );
                          }, [])}
                        </Collapsible>
                      ))}
                  </Collapsible>
                </Col>
              </Row>
            ))}
        </div>
      )}
      <VusTable hugoSymbol={hugoSymbol} />
    </div>
  ) : (
    <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
  );
};

const mapStoreToProps = ({ geneStore, firebaseGeneStore, firebaseMetaStore, firebaseDrugsStore, authStore }: IRootStore) => ({
  findAllGeneEntities: geneStore.findAllGeneEntities,
  entities: geneStore.entities,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
  addMetaCollaboratorsListener: firebaseMetaStore.addMetaCollaboratorsListener,
  metaData: firebaseMetaStore.data,
  drugList: firebaseDrugsStore.drugList,
  addDrugListListener: firebaseDrugsStore.addDrugListListener,
  metaCollaboratorsData: firebaseMetaStore.metaCollaborators,
  updateCollaborator: firebaseMetaStore.updateCollaborator,
  account: authStore.account,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
