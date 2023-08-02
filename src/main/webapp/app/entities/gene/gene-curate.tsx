import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { Else, If, Then } from 'react-if';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { FirebaseCollectionName } from 'app/config/constants';

export interface IGeneCurateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneCurate = (props: IGeneCurateProps) => {
  const firebaseParentPath = `${FirebaseCollectionName.GENES}/${props.geneEntity.hugoSymbol}`;

  useEffect(() => {
    let unsubscribe = undefined;
    props.getEntity(props.match.params.id).then(result => {
      unsubscribe = props.addListener(`${FirebaseCollectionName.GENES}/${result.data.hugoSymbol}/`);
    });
    if (unsubscribe) {
      return () => unsubscribe();
    }
  }, []);

  return (
    <If condition={!props.loading}>
      <Then>
        <div>
          <Row>
            <Col>
              <h2>Gene: {props.data?.name}</h2>
              <ValidatedField
                label="Summary"
                name="geneSummary"
                type="textarea"
                value={props.data?.summary || ''}
                onChange={event => {
                  props.update(firebaseParentPath, { summary: event.target.value });
                }}
              />
              <ValidatedField
                label="Background"
                name="geneBackground"
                type="textarea"
                value={props.data?.background || ''}
                onChange={event => {
                  props.update(firebaseParentPath, { background: event.target.value });
                }}
              />
            </Col>
          </Row>
        </div>
      </Then>
      <Else>
        <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading={props.loading} />
      </Else>
    </If>
  );
};

const mapStoreToProps = ({ geneStore, firebaseGeneStore }: IRootStore) => ({
  geneEntity: geneStore.entity,
  loading: geneStore.loading,
  getEntity: geneStore.getEntity,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
  create: firebaseGeneStore.create,
  push: firebaseGeneStore.push,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneCurate);
