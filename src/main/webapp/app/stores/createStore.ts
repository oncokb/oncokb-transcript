import { LoadingBarStore } from 'app/stores/loading-bar.store';
import { AuthStore } from 'app/stores/authentication.store';
import { SettingsStore } from 'app/pages/account/settings.store';
import { History } from 'history';
import { RouterStore } from './router.store';
import NavigationControlStore from './navigation-control.store';
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
import variantConsequence, {
  VariantConsequenceStore
} from 'app/entities/variant-consequence/variant-consequence.store';
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
/* jhipster-needle-add-store-import - JHipster will add store here */

export interface IRootStore {
  readonly loadingStore: LoadingBarStore;
  readonly authStore: AuthStore;
  readonly settingsStore: SettingsStore;
  readonly routerStore: RouterStore;
  readonly navigationControlStore: NavigationControlStore;
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
  readonly variantConsequenceStore: VariantConsequenceStore;
  readonly alterationStore: AlterationStore;
  readonly cancerTypeStore: CancerTypeStore;
  readonly deviceUsageIndicationStore: DeviceUsageIndicationStore;
  /* jhipster-needle-add-store-field - JHipster will add store here */
}

export function createStores(history: History): IRootStore {
  const rootStore = {} as any;

  rootStore.loadingStore = new LoadingBarStore();
  rootStore.authStore = new AuthStore(rootStore);
  rootStore.settingsStore = new SettingsStore(rootStore);
  rootStore.routerStore = new RouterStore(history);
  rootStore.navigationControlStore = new NavigationControlStore();
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
  rootStore.variantConsequenceStore = new VariantConsequenceStore(rootStore);
  rootStore.alterationStore = new AlterationStore(rootStore);
  rootStore.cancerTypeStore = new CancerTypeStore(rootStore);
  rootStore.deviceUsageIndicationStore = new DeviceUsageIndicationStore(rootStore);
  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
