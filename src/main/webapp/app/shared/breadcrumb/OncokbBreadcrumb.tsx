import { PAGE_ROUTE } from 'app/config/constants/constants';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import './breadcrumb.scss';
import { getEntityTitle } from 'app/shared/util/entity-utils';

const OncokbBreadcrumb: React.FunctionComponent<StoreProps> = props => {
  const location = useLocation();

  const getEntityIdMapping = (path: string) => {
    const basePath = path.substring(path.indexOf('/'), path.indexOf('/', 1));
    switch (basePath as PAGE_ROUTE) {
      case PAGE_ROUTE.FDA_SUBMISSION:
        return `${props.fdaSubmission?.number}${props.fdaSubmission?.supplementNumber ? '/' + props.fdaSubmission?.supplementNumber : ''}`;
      case PAGE_ROUTE.FDA_SUBMISSION_TYPE:
        return props.fdaSubmissionType.shortName;
      case PAGE_ROUTE.COMPANION_DIAGNOSTIC_DEVICE:
        return props.companionDiagnosticDevice.name;
      case PAGE_ROUTE.GENE:
        return props.gene.hugoSymbol;
      case PAGE_ROUTE.ALTERATION:
        return props.alteration.name;
      case PAGE_ROUTE.ARTICLE:
        return props.article.uid;
      case PAGE_ROUTE.DRUG:
        return props.drug.name;
      default:
        return undefined;
    }
  };

  const parsePath = (pathname: string) => {
    let currentUrl = '';
    let name = '';
    const paths = pathname
      .split('/')
      .slice(1)
      .map((path: string) => {
        currentUrl += `/${path}`;
        if (!isNaN(parseFloat(path))) {
          name = getEntityIdMapping(currentUrl) || path;
        } else {
          name = getEntityTitle(path);
        }
        return {
          path: currentUrl,
          name,
        };
      });

    return [{ path: '/', name: 'Home' }, ...paths];
  };

  const breadcrumbs = parsePath(location.pathname);

  return (
    <Breadcrumb style={{ height: '45px' }} listClassName="ps-0">
      {breadcrumbs.map((trial, index) => {
        return (
          <BreadcrumbItem key={`breadcrumb-item${index}`}>
            <Link to={trial.path}>{trial.name}</Link>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  companionDiagnosticDevice: storeState.companionDiagnosticDeviceStore.entity,
  fdaSubmission: storeState.fdaSubmissionStore.entity,
  fdaSubmissionType: storeState.fdaSubmissionTypeStore.entity,
  gene: storeState.geneStore.entity,
  alteration: storeState.alterationStore.entity,
  drug: storeState.drugStore.entity,
  article: storeState.articleStore.entity,
  user: storeState.userStore.entity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(OncokbBreadcrumb);
