import { LoadingBarStore } from 'app/stores/loading-bar.store';
import { AuthStore } from 'app/stores/authentication.store';
import { SettingsStore } from 'app/pages/account/settings.store';
import { UserStore } from 'app/modules/administration/user-management/user.store';
import { History } from 'history';
import { RouterStore } from './router.store';
import LayoutStore from './layout.store';
// prettier-ignore
import sequence, {
  SequenceStore
} from 'app/entities/sequence/sequence.store';
// prettier-ignore
import transcript, {
  TranscriptStore
} from 'app/entities/transcript/transcript.store';
// prettier-ignore
import info, {
  InfoStore
} from 'app/entities/info/info.store';
// prettier-ignore
import gene, {
  GeneStore
} from 'app/entities/gene/gene.store';
// prettier-ignore
import geneAlias, {
  GeneAliasStore
} from 'app/entities/gene-alias/gene-alias.store';
// prettier-ignore
import genomeFragment, {
  GenomeFragmentStore
} from 'app/entities/genome-fragment/genome-fragment.store';
// prettier-ignore
import ensemblGene, {
  EnsemblGeneStore
} from 'app/entities/ensembl-gene/ensembl-gene.store';
// prettier-ignore
import drug, {
  DrugStore
} from 'app/entities/drug/drug.store';
// prettier-ignore
import drugSynonym, {
  DrugSynonymStore
} from 'app/entities/drug-synonym/drug-synonym.store';
// prettier-ignore
import specimenType, {
  SpecimenTypeStore
} from 'app/entities/specimen-type/specimen-type.store';
// prettier-ignore
import companionDiagnosticDevice, {
  CompanionDiagnosticDeviceStore
} from 'app/entities/companion-diagnostic-device/companion-diagnostic-device.store';
// prettier-ignore
import fdaSubmissionType, {
  FdaSubmissionTypeStore
} from 'app/entities/fda-submission-type/fda-submission-type.store';
// prettier-ignore
import fdaSubmission, {
  FdaSubmissionStore
} from 'app/entities/fda-submission/fda-submission.store';
// prettier-ignore
import alteration, {
  AlterationStore
} from 'app/entities/alteration/alteration.store';
// prettier-ignore
import cancerType, {
  CancerTypeStore
} from 'app/entities/cancer-type/cancer-type.store';
// prettier-ignore
import deviceUsageIndication, {
  DeviceUsageIndicationStore
} from 'app/entities/device-usage-indication/device-usage-indication.store';
import article, { ArticleStore } from 'app/entities/article/article.store';
import DrugBrandStore from 'app/entities/drug-brand/drug-brand.store';
import CategoricalAlterationStore from 'app/entities/categorical-alteration/categorical-alteration.store';
import ConsequenceStore from 'app/entities/consequence/consequence.store';
// prettier-ignore
import clinicalTrialsGovCondition, {
  ClinicalTrialsGovConditionStore
} from 'app/entities/clinical-trials-gov-condition/clinical-trials-gov-condition.store';
/* jhipster-needle-add-store-import - JHipster will add store here */

export interface IRootStore {
  readonly loadingStore: LoadingBarStore;
  readonly authStore: AuthStore;
  readonly settingsStore: SettingsStore;
  readonly userStore: UserStore;
  readonly routerStore: RouterStore;
  readonly layoutStore: LayoutStore;
  readonly sequenceStore: SequenceStore;
  readonly transcriptStore: TranscriptStore;
  readonly infoStore: InfoStore;
  readonly geneStore: GeneStore;
  readonly geneAliasStore: GeneAliasStore;
  readonly genomeFragmentStore: GenomeFragmentStore;
  readonly ensemblGeneStore: EnsemblGeneStore;
  readonly drugStore: DrugStore;
  readonly drugSynonymStore: DrugSynonymStore;
  readonly specimenTypeStore: SpecimenTypeStore;
  readonly companionDiagnosticDeviceStore: CompanionDiagnosticDeviceStore;
  readonly fdaSubmissionTypeStore: FdaSubmissionTypeStore;
  readonly fdaSubmissionStore: FdaSubmissionStore;
  readonly consequenceStore: ConsequenceStore;
  readonly alterationStore: AlterationStore;
  readonly cancerTypeStore: CancerTypeStore;
  readonly deviceUsageIndicationStore: DeviceUsageIndicationStore;
  readonly articleStore: ArticleStore;
  readonly drugBrandStore: DrugBrandStore;
  readonly categoricalAlterationStore: CategoricalAlterationStore;
  readonly clinicalTrialsGovConditionStore: ClinicalTrialsGovConditionStore;
  /* jhipster-needle-add-store-field - JHipster will add store here */
}

export function createStores(history: History): IRootStore {
  const rootStore = {} as any;

  rootStore.loadingStore = new LoadingBarStore();
  rootStore.authStore = new AuthStore(rootStore);
  rootStore.settingsStore = new SettingsStore(rootStore);
  rootStore.userStore = new UserStore(rootStore);
  rootStore.routerStore = new RouterStore(history);
  rootStore.layoutStore = new LayoutStore();
  rootStore.sequenceStore = new SequenceStore(rootStore);
  rootStore.transcriptStore = new TranscriptStore(rootStore);
  rootStore.infoStore = new InfoStore(rootStore);
  rootStore.geneStore = new GeneStore(rootStore);
  rootStore.geneAliasStore = new GeneAliasStore(rootStore);
  rootStore.genomeFragmentStore = new GenomeFragmentStore(rootStore);
  rootStore.ensemblGeneStore = new EnsemblGeneStore(rootStore);
  rootStore.drugStore = new DrugStore(rootStore);
  rootStore.drugSynonymStore = new DrugSynonymStore(rootStore);
  rootStore.specimenTypeStore = new SpecimenTypeStore(rootStore);
  rootStore.companionDiagnosticDeviceStore = new CompanionDiagnosticDeviceStore(rootStore);
  rootStore.fdaSubmissionTypeStore = new FdaSubmissionTypeStore(rootStore);
  rootStore.fdaSubmissionStore = new FdaSubmissionStore(rootStore);
  rootStore.consequenceStore = new ConsequenceStore(rootStore);
  rootStore.alterationStore = new AlterationStore(rootStore);
  rootStore.cancerTypeStore = new CancerTypeStore(rootStore);
  rootStore.deviceUsageIndicationStore = new DeviceUsageIndicationStore(rootStore);
  rootStore.articleStore = new ArticleStore(rootStore);
  rootStore.drugBrandStore = new DrugBrandStore(rootStore);
  rootStore.categoricalAlterationStore = new CategoricalAlterationStore(rootStore);
  rootStore.clinicalTrialsGovConditionStore = new ClinicalTrialsGovConditionStore(rootStore);
  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
