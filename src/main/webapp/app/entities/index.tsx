import React from 'react';
import { Switch } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Sequence from './sequence';
import Transcript from './transcript';
import Info from './info';
import Gene from './gene';
import GenomeFragment from './genome-fragment';
import EnsemblGene from './ensembl-gene';
import Drug from './drug';
import SpecimenType from './specimen-type';
import CompanionDiagnosticDevice from './companion-diagnostic-device';
import FdaSubmissionType from './fda-submission-type';
import FdaSubmission from './fda-submission';
import Alteration from './alteration';
import CancerType from './cancer-type';
import { PAGE_ROUTE } from 'app/config/constants';
import Article from './article';
import DrugBrand from './drug-brand';
import CategoricalAlteration from './categorical-alteration';
import Consequence from './consequence';
import FdaDrug from './fda-drug';
import SeqRegion from './seq-region';
import Flag from './flag';
import OncoKBBreadcrumb from 'app/shared/breadcrumb/OncokbBreadcrumb';
import ClinicalTrial from './clinical-trial';
import ClinicalTrialArm from './clinical-trial-arm';
import DrugPriority from './drug-priority';
import EligibilityCriteria from './eligibility-criteria';
import Evidence from './evidence';
import GenomicIndicator from './genomic-indicator';
import History from './history';
import LevelOfEvidence from './level-of-evidence';
import NciThesaurus from './nci-thesaurus';
import Synonym from './synonym';
import Treatment from './treatment';
import TreatmentPriority from './treatment-priority';
import Association from './association';
import AssociationCancerType from './association-cancer-type';
import PageNotFound from 'app/shared/error/page-not-found';
/* jhipster-needle-add-route-import - JHipster will add routes here */

const Routes = ({ match }) => (
  <div>
    <OncoKBBreadcrumb />
    <Switch>
      {/* prettier-ignore */}
      <ErrorBoundaryRoute path={`${match.url}sequence`} component={Sequence} />
      <ErrorBoundaryRoute path={`${match.url}transcript`} component={Transcript} />
      <ErrorBoundaryRoute path={`${match.url}info`} component={Info} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.GENE.substring(1)}`} component={Gene} />
      <ErrorBoundaryRoute path={`${match.url}genome-fragment`} component={GenomeFragment} />
      <ErrorBoundaryRoute path={`${match.url}ensembl-gene`} component={EnsemblGene} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.DRUG.substring(1)}`} component={Drug} />
      <ErrorBoundaryRoute path={`${match.url}specimen-type`} component={SpecimenType} />
      <ErrorBoundaryRoute
        path={`${match.url}${PAGE_ROUTE.COMPANION_DIAGNOSTIC_DEVICE.substring(1)}`}
        component={CompanionDiagnosticDevice}
      />
      <ErrorBoundaryRoute path={`${match.url}fda-submission-type`} component={FdaSubmissionType} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.FDA_SUBMISSION.substring(1)}`} component={FdaSubmission} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.ALTERATION.substring(1)}`} component={Alteration} />
      <ErrorBoundaryRoute path={`${match.url}cancer-type`} component={CancerType} />
      <ErrorBoundaryRoute path={`${match.url}${PAGE_ROUTE.ARTICLE.substring(1)}`} component={Article} />
      <ErrorBoundaryRoute path={`${match.url}drug-brand`} component={DrugBrand} />
      <ErrorBoundaryRoute path={`${match.url}categorical-alteration`} component={CategoricalAlteration} />
      <ErrorBoundaryRoute path={`${match.url}consequence`} component={Consequence} />
      <ErrorBoundaryRoute path={`${match.url}drug`} component={Drug} />
      <ErrorBoundaryRoute path={`${match.url}companion-diagnostic-device`} component={CompanionDiagnosticDevice} />
      <ErrorBoundaryRoute path={`${match.url}fda-submission`} component={FdaSubmission} />
      <ErrorBoundaryRoute path={`${match.url}fda-drug`} component={FdaDrug} />
      <ErrorBoundaryRoute path={`${match.url}seq-region`} component={SeqRegion} />
      <ErrorBoundaryRoute path={`${match.url}flag`} component={Flag} />
      <ErrorBoundaryRoute path={`${match.url}gene`} component={Gene} />
      <ErrorBoundaryRoute path={`${match.url}alteration`} component={Alteration} />
      <ErrorBoundaryRoute path={`${match.url}article`} component={Article} />
      <ErrorBoundaryRoute path={`${match.url}association`} component={Association} />
      <ErrorBoundaryRoute path={`${match.url}association-cancer-type`} component={AssociationCancerType} />
      <ErrorBoundaryRoute path={`${match.url}clinical-trial`} component={ClinicalTrial} />
      <ErrorBoundaryRoute path={`${match.url}clinical-trial-arm`} component={ClinicalTrialArm} />
      <ErrorBoundaryRoute path={`${match.url}drug-priority`} component={DrugPriority} />
      <ErrorBoundaryRoute path={`${match.url}eligibility-criteria`} component={EligibilityCriteria} />
      <ErrorBoundaryRoute path={`${match.url}evidence`} component={Evidence} />
      <ErrorBoundaryRoute path={`${match.url}genomic-indicator`} component={GenomicIndicator} />
      <ErrorBoundaryRoute path={`${match.url}history`} component={History} />
      <ErrorBoundaryRoute path={`${match.url}level-of-evidence`} component={LevelOfEvidence} />
      <ErrorBoundaryRoute path={`${match.url}nci-thesaurus`} component={NciThesaurus} />
      <ErrorBoundaryRoute path={`${match.url}synonym`} component={Synonym} />
      <ErrorBoundaryRoute path={`${match.url}treatment`} component={Treatment} />
      <ErrorBoundaryRoute path={`${match.url}treatment-priority`} component={TreatmentPriority} />
      <ErrorBoundaryRoute exact component={PageNotFound} />
      {/* jhipster-needle-add-route-path - JHipster will add routes here */}
    </Switch>
  </div>
);

export default Routes;
