import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IDrugBrandProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const DrugBrand = (props: IDrugBrandProps) => {
  const drugBrandList = props.drugBrandList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const handleSyncList = () => {
    props.getEntities({});
  };

  const { match } = props;

  return (
    <div>
      <h2 id="drug-brand-heading" data-cy="DrugBrandHeading">
        Drug Brands
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Drug Brand
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {drugBrandList && drugBrandList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Region</th>
                <th>Drug</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {drugBrandList.map((drugBrand, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>{drugBrand.name}</td>
                  <td>{drugBrand.region}</td>
                  <td>{drugBrand.drug ? <Link to={`drug/${drugBrand.drug.id}`}>{drugBrand.drug.name}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${drugBrand.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${drugBrand.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${drugBrand.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Drug Brands found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ drugBrandStore }: IRootStore) => ({
  drugBrandList: drugBrandStore.entities,
  loading: drugBrandStore.loading,
  getEntities: drugBrandStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugBrand);
