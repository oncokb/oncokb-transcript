import { Alert } from 'reactstrap';
import React from 'react';
import { CURATE_NEW_GENE_TEXT, PAGE_ROUTE } from 'app/config/constants/constants';
import { Link } from 'react-router-dom';

export const UncuratedGeneAlert: React.FunctionComponent = () => {
  return (
    <Alert color={'warning'} className={'text-center'} fade={false}>
      This gene has not been curated yet. Please use the {CURATE_NEW_GENE_TEXT} tool from the sidebar on{' '}
      <Link to={PAGE_ROUTE.CURATION}>this page</Link>.
    </Alert>
  );
};
