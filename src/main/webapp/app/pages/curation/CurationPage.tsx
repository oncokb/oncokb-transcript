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
  ONCOGENICITY,
  PAGE_ROUTE,
  PATHOGENICITY,
  PENETRANCE,
} from 'app/config/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getCancerTypeName, getSectionClassName } from 'app/shared/util/utils';
import { ONCOGENE, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeBasicInput, RealtimeDropdownInput, RealtimeInputType } from 'app/shared/firebase/FirebaseRealtimeInput';
import { getFirebasePath, getMutationName, getTxName } from 'app/shared/util/firebase/firebase-utils';
import Collapsible, { NestLevel } from 'app/pages/curation/collapsible/Collapsible';
import styles from './styles.module.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

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
          <RealtimeBasicInput
            data={props.data}
            fieldKey="summary"
            label="Summary"
            labelClass="font-weight-bold"
            name="geneSummary"
            type={RealtimeInputType.TEXTAREA}
          />
          <div className="flex d-flex">
            <RealtimeBasicInput
              label="Tumor Supressor"
              name="tumorSupressor"
              type={RealtimeInputType.CHECKBOX}
              checked={!!props.data.type?.tsg}
              onChange={e => {
                props.updateGeneType(firebaseGenePath, TUMOR_SUPPRESSOR, e.target.checked);
              }}
            />
            <RealtimeBasicInput
              className="ml-4"
              label="Oncogene"
              name="oncogene"
              type={RealtimeInputType.CHECKBOX}
              checked={!!props.data.type?.ocg}
              onChange={e => {
                props.updateGeneType(firebaseGenePath, ONCOGENE, e.target.checked);
              }}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <div className="flex d-flex">
            <span className="font-weight-bold">Penetrance:</span>
            {['High', 'Intermediate', 'Low', 'Other'].map(label => {
              return (
                <RealtimeBasicInput
                  key={label}
                  className="ml-2"
                  label={label}
                  name={label.toLowerCase()}
                  type={RealtimeInputType.CHECKBOX}
                  checked={props.data.penetrance === label}
                  onChange={e => {}}
                />
              );
            })}
          </div>
        </Col>
      </Row>
      <Row className={'mb-5'}>
        <Col>
          <RealtimeBasicInput
            inputClass={styles.textarea}
            label="Background"
            labelClass="font-weight-bold"
            name="geneBackground"
            type={RealtimeInputType.TEXTAREA}
            value={props.data.background || ''}
            onChange={e => {
              props.updateReviewableContent(firebaseGenePath, 'background', e.target.value);
            }}
          />
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
        <>
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
            .map((mutation, index) => (
              <Row key={index} className={'mb-2'}>
                <Col>
                  <Collapsible nestLevel={NestLevel.MUTATION} className={'mb-1'} title={`Mutation: ${getMutationName(mutation)}`}>
                    <Collapsible nestLevel={NestLevel.MUTATION_EFFECT} title={'Mutation Effect'}>
                      <Collapsible nestLevel={NestLevel.BIOLOGICAL_EFFECT} title={'Biological Effect'}>
                        <div className="flex d-flex">
                          <span className="font-weight-bold text-nowrap">Mutation Effect:</span>
                          <span className="d-flex flex-wrap">
                            {[
                              MUTATION_EFFECT.GAIN_OF_FUNCTION,
                              MUTATION_EFFECT.LIKELY_GAIN_OF_FUNCTION,
                              MUTATION_EFFECT.LOSS_OF_FUNCTION,
                              MUTATION_EFFECT.LIKELY_LOSS_OF_FUNCTION,
                              MUTATION_EFFECT.SWITCH_OF_FUNCTION,
                              MUTATION_EFFECT.LIKELY_SWITCH_OF_FUNCTION,
                              MUTATION_EFFECT.NEUTRAL,
                              MUTATION_EFFECT.LIKELY_NEUTRAL,
                              MUTATION_EFFECT.INCONCLUSIVE,
                            ].map(label => {
                              return (
                                <RealtimeBasicInput
                                  key={label}
                                  className="ml-2"
                                  label={label}
                                  name={label.toLowerCase()}
                                  type={RealtimeInputType.CHECKBOX}
                                  checked={mutation.mutation_effect.effect === label}
                                  onChange={e => {}}
                                />
                              );
                            })}
                          </span>
                        </div>
                        <RealtimeBasicInput
                          inputClass={styles.textarea}
                          label="Description of Evidence"
                          labelClass="font-weight-bold"
                          name="description"
                          type={RealtimeInputType.TEXTAREA}
                          value={mutation.mutation_effect.description || ''}
                          onChange={e => {}}
                        />
                      </Collapsible>
                      <Collapsible nestLevel={NestLevel.SOMATIC} className={'mt-2'} title={'Somatic'}>
                        <div className="flex d-flex">
                          <span className="font-weight-bold">Oncogenic:</span>
                          {[
                            ONCOGENICITY.ONCOGENIC,
                            ONCOGENICITY.LIKELY_ONCOGENIC,
                            ONCOGENICITY.LIKELY_NEUTRAL,
                            ONCOGENICITY.INCONCLUSIVE,
                          ].map(label => {
                            return (
                              <RealtimeBasicInput
                                key={label}
                                className="ml-2"
                                label={label}
                                name={label.toLowerCase()}
                                type={RealtimeInputType.CHECKBOX}
                                checked={mutation.mutation_effect.oncogenic === label}
                                onChange={e => {}}
                              />
                            );
                          })}
                        </div>
                      </Collapsible>
                      {mutation.mutation_effect.germline && (
                        <Collapsible nestLevel={NestLevel.GERMLINE} className={'mt-2'} title={'Germline'}>
                          <div className="flex d-flex">
                            <span className="font-weight-bold">Pathogenic:</span>
                            {[
                              PATHOGENICITY.PATHOGENIC,
                              PATHOGENICITY.LIKELY_PATHOGENIC,
                              PATHOGENICITY.BENIGN,
                              PATHOGENICITY.LIKELY_BENIGN,
                              PATHOGENICITY.UNKNOWN,
                            ].map(label => {
                              return (
                                <RealtimeBasicInput
                                  key={label}
                                  className="ml-2"
                                  label={label}
                                  name={label.toLowerCase()}
                                  type={RealtimeInputType.CHECKBOX}
                                  checked={mutation.mutation_effect.germline.pathogenic === label}
                                  onChange={e => {}}
                                />
                              );
                            })}
                          </div>
                          <div className="flex d-flex">
                            <span className="font-weight-bold">Penetrance:</span>
                            {[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => {
                              return (
                                <RealtimeBasicInput
                                  key={label}
                                  className="ml-2"
                                  label={label}
                                  name={label.toLowerCase()}
                                  type={RealtimeInputType.CHECKBOX}
                                  checked={mutation.mutation_effect.germline.penetrance === label}
                                  onChange={e => {}}
                                />
                              );
                            })}
                          </div>
                          <div className="flex d-flex">
                            <span className="font-weight-bold">Mechanism of Inheritance:</span>
                            {[GERMLINE_INHERITANCE_MECHANISM.RECESSIVE, GERMLINE_INHERITANCE_MECHANISM.DOMINANT].map(label => {
                              return (
                                <RealtimeBasicInput
                                  key={label}
                                  className="ml-2"
                                  label={label}
                                  name={label.toLowerCase()}
                                  type={RealtimeInputType.CHECKBOX}
                                  checked={mutation.mutation_effect.germline.inheritanceMechanism === label}
                                  onChange={e => {}}
                                />
                              );
                            })}
                          </div>
                          <RealtimeBasicInput
                            inputClass={styles.textarea}
                            label="Cancer Risk"
                            labelClass="font-weight-bold"
                            name="cancerRisk"
                            type={RealtimeInputType.TEXTAREA}
                            value={mutation.mutation_effect.germline.cancerRisk || ''}
                            onChange={e => {}}
                          />
                        </Collapsible>
                      )}
                    </Collapsible>
                    {mutation.tumors &&
                      mutation.tumors.map(tumor => (
                        <Collapsible
                          className={'mt-2'}
                          key={tumor.cancerTypes_uuid}
                          nestLevel={NestLevel.CANCER_TYPE}
                          title={`Cancer Type: ${tumor.cancerTypes.map(cancerType => getCancerTypeName(cancerType)).join(', ')}`}
                        >
                          <RealtimeBasicInput
                            inputClass={styles.textarea}
                            label="Therapeutic Summary (Optional)"
                            labelClass="font-weight-bold"
                            name="txSummary"
                            type={RealtimeInputType.TEXTAREA}
                            value={tumor.summary || ''}
                            onChange={e => {}}
                          />
                          {tumor.TIs.reduce((accumulator, ti) => {
                            if (!ti.treatments) {
                              return accumulator;
                            }
                            return accumulator.concat(
                              ti.treatments.map(treatment => {
                                return (
                                  <Collapsible
                                    className={'mt-2'}
                                    key={tumor.cancerTypes_uuid}
                                    nestLevel={NestLevel.THERAPY}
                                    title={`Therapy: ${getTxName(props.drugList, treatment.name)}`}
                                  >
                                    <RealtimeBasicInput
                                      label="Highest level of evidence"
                                      labelClass="font-weight-bold"
                                      name="level"
                                      type={RealtimeInputType.INLINE_TEXT}
                                      value={treatment.level || ''}
                                      onChange={e => {}}
                                    />
                                    <RealtimeBasicInput
                                      label="Level of Evidence in other solid tumor types"
                                      labelClass="font-weight-bold"
                                      name="propagationLevel"
                                      type={RealtimeInputType.INLINE_TEXT}
                                      value={treatment.propagation || ''}
                                      onChange={e => {}}
                                    />
                                    <RealtimeBasicInput
                                      label="Level of Evidence in other liquid tumor types"
                                      labelClass="font-weight-bold"
                                      name="propagationLiquidLevel"
                                      type={RealtimeInputType.INLINE_TEXT}
                                      value={treatment.propagationLiquid || ''}
                                      onChange={e => {}}
                                    />
                                    <RealtimeBasicInput
                                      label="FDA Level of Evidence"
                                      labelClass="font-weight-bold"
                                      name="propagationLiquidLevel"
                                      type={RealtimeInputType.INLINE_TEXT}
                                      value={treatment.fdaLevel || ''}
                                      onChange={e => {}}
                                    />
                                    <RealtimeBasicInput
                                      inputClass={styles.textarea}
                                      label="Description of Evidence"
                                      labelClass="font-weight-bold"
                                      name="evidenceDescription"
                                      type={RealtimeInputType.TEXTAREA}
                                      value={treatment.description || ''}
                                      onChange={e => {}}
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
        </>
      )}
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
  updateGeneType: firebaseGeneStore.updateGeneType,
  metaData: firebaseMetaStore.data,
  drugList: firebaseDrugsStore.drugList,
  addDrugListListener: firebaseDrugsStore.addDrugListListener,
  metaCollaboratorsData: firebaseMetaStore.metaCollaborators,
  updateCollaborator: firebaseMetaStore.updateCollaborator,
  account: authStore.account,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
