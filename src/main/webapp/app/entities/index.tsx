import React from 'react';
import { Switch } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Sequence from './sequence';
import Transcript from './transcript';
import Info from './info';
import Gene from './gene';
import GeneAlias from './gene-alias';
import GenomeFragment from './genome-fragment';
import EnsemblGene from './ensembl-gene';
import Drug from './drug';
import DrugSynonym from './drug-synonym';
import SpecimenType from './specimen-type';
import CompanionDiagnosticDevice from './companion-diagnostic-device';
import FdaSubmissionType from './fda-submission-type';
import FdaSubmission from './fda-submission';
import Alteration from './alteration';
import CancerType from './cancer-type';
import BiomarkerAssociation from './biomarker-association';
import { PAGE_ROUTE } from 'app/config/constants';
import Article from './article';
import DrugBrand from './drug-brand';
import CategoricalAlteration from './categorical-alteration';
import Consequence from './consequence';
import ClinicalTrialsGovCondition from './clinical-trials-gov-condition';
import FdaDrug from './fda-drug';
/* jhipster-needle-add-route-import - JHipster will add routes here */

const Routes = ({ match }) => (
  <div>
    <Switch>
      {/* prettier-ignore */}
      <ErrorBoundaryRoute path={`${match.url}sequence`} component={Sequence} />
      <ErrorBoundaryRoute path={`${match.url}transcript`} component={Transcript} />
      <ErrorBoundaryRoute path={`${match.url}info`} component={Info} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.GENE.substring(1)}`} component={Gene} />
      <ErrorBoundaryRoute path={`${match.url}gene-alias`} component={GeneAlias} />
      <ErrorBoundaryRoute path={`${match.url}genome-fragment`} component={GenomeFragment} />
      <ErrorBoundaryRoute path={`${match.url}ensembl-gene`} component={EnsemblGene} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.DRUG.substring(1)}`} component={Drug} />
      <ErrorBoundaryRoute path={`${match.url}drug-synonym`} component={DrugSynonym} />
      <ErrorBoundaryRoute path={`${match.url}specimen-type`} component={SpecimenType} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.CDX.substring(1)}`} component={CompanionDiagnosticDevice} />
      <ErrorBoundaryRoute path={`${match.url}fda-submission-type`} component={FdaSubmissionType} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.FDA_SUBMISSION.substring(1)}`} component={FdaSubmission} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.ALTERATION.substring(1)}`} component={Alteration} />
      <ErrorBoundaryRoute path={`${match.url}cancer-type`} component={CancerType} />
      <ErrorBoundaryRoute path={`${match.url}biomarker-association`} component={BiomarkerAssociation} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.ARTICLE.substring(1)}`} component={Article} />
      <ErrorBoundaryRoute path={`${match.url}drug-brand`} component={DrugBrand} />
      <ErrorBoundaryRoute path={`${match.url}categorical-alteration`} component={CategoricalAlteration} />
      <ErrorBoundaryRoute path={`${match.url}consequence`} component={Consequence} />
      <ErrorBoundaryRoute path={`${match.url}clinical-trials-gov-condition`} component={ClinicalTrialsGovCondition} />
      <ErrorBoundaryRoute path={`${match.url}drug`} component={Drug} />
      <ErrorBoundaryRoute path={`${match.url}companion-diagnostic-device`} component={CompanionDiagnosticDevice} />
      <ErrorBoundaryRoute path={`${match.url}fda-submission`} component={FdaSubmission} />
      <ErrorBoundaryRoute path={`${match.url}fda-drug`} component={FdaDrug} />
      {/* jhipster-needle-add-route-path - JHipster will add routes here */}
    </Switch>
  </div>
);

export default Routes;
