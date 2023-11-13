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
import FirebaseStore from './firebase/firebase.store';
import { FirebaseGeneStore } from './firebase/firebase.gene.store';
import { FirebaseMetaStore } from './firebase/firebase.meta.store';
import { FirebaseDrugsStore } from 'app/stores/firebase/firebase.drugs.store';
// prettier-ignore
import article, {
  ArticleStore
} from 'app/entities/article/article.store';
// prettier-ignore
import drugBrand, {
  DrugBrandStore
} from 'app/entities/drug-brand/drug-brand.store';
// prettier-ignore
import categoricalAlteration, {
  CategoricalAlterationStore
} from 'app/entities/categorical-alteration/categorical-alteration.store';
// prettier-ignore
import consequence, {
  ConsequenceStore
} from 'app/entities/consequence/consequence.store';
// prettier-ignore
import fdaDrug, {
  FdaDrugStore
} from 'app/entities/fda-drug/fda-drug.store';
// prettier-ignore
import seqRegion, {
  SeqRegionStore
} from 'app/entities/seq-region/seq-region.store';
// prettier-ignore
import flag, {
  FlagStore
} from 'app/entities/flag/flag.store';
import AssociationStore from 'app/entities/association/association.store';
import AssociationCancerTypeStore from 'app/entities/association-cancer-type/association-cancer-type.store';
import ClinicalTrialStore from 'app/entities/clinical-trial/clinical-trial.store';
import ClinicalTrialArmStore from 'app/entities/clinical-trial-arm/clinical-trial-arm.store';
import DrugPriorityStore from 'app/entities/drug-priority/drug-priority.store';
import EligibilityCriteriaStore from 'app/entities/eligibility-criteria/eligibility-criteria.store';
import EvidenceStore from 'app/entities/evidence/evidence.store';
import GenomicIndicatorStore from 'app/entities/genomic-indicator/genomic-indicator.store';
import HistoryStore from 'app/entities/history/history.store';
import LevelOfEvidenceStore from 'app/entities/level-of-evidence/level-of-evidence.store';
import NciThesaurusStore from 'app/entities/nci-thesaurus/nci-thesaurus.store';
import SynonymStore from 'app/entities/synonym/synonym.store';
import TreatmentStore from 'app/entities/treatment/treatment.store';
import TreatmentPriorityStore from 'app/entities/treatment-priority/treatment-priority.store';
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
  readonly genomeFragmentStore: GenomeFragmentStore;
  readonly ensemblGeneStore: EnsemblGeneStore;
  readonly drugStore: DrugStore;
  readonly fdaDrugStore: FdaDrugStore;
  readonly specimenTypeStore: SpecimenTypeStore;
  readonly companionDiagnosticDeviceStore: CompanionDiagnosticDeviceStore;
  readonly fdaSubmissionTypeStore: FdaSubmissionTypeStore;
  readonly fdaSubmissionStore: FdaSubmissionStore;
  readonly consequenceStore: ConsequenceStore;
  readonly alterationStore: AlterationStore;
  readonly cancerTypeStore: CancerTypeStore;
  readonly articleStore: ArticleStore;
  readonly drugBrandStore: DrugBrandStore;
  readonly categoricalAlterationStore: CategoricalAlterationStore;
  readonly seqRegionStore: SeqRegionStore;
  readonly flagStore: FlagStore;
  readonly associationStore: AssociationStore;
  readonly associationCancerTypeStore: AssociationCancerTypeStore;
  readonly clinicalTrialStore: ClinicalTrialStore;
  readonly clinicalTrialArmStore: ClinicalTrialArmStore;
  readonly drugPriorityStore: DrugPriorityStore;
  readonly eligibilityCriteriaStore: EligibilityCriteriaStore;
  readonly evidenceStore: EvidenceStore;
  readonly genomicIndicatorStore: GenomicIndicatorStore;
  readonly historyStore: HistoryStore;
  readonly levelOfEvidenceStore: LevelOfEvidenceStore;
  readonly nciThesaurusStore: NciThesaurusStore;
  readonly synonymStore: SynonymStore;
  readonly treatmentStore: TreatmentStore;
  readonly treatmentPriorityStore: TreatmentPriorityStore;
  /* Firebase stores */
  readonly firebaseStore: FirebaseStore;
  readonly firebaseGeneStore: FirebaseGeneStore;
  readonly firebaseMetaStore: FirebaseMetaStore;
  readonly firebaseDrugsStore: FirebaseDrugsStore;
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
  rootStore.genomeFragmentStore = new GenomeFragmentStore(rootStore);
  rootStore.ensemblGeneStore = new EnsemblGeneStore(rootStore);
  rootStore.drugStore = new DrugStore(rootStore);
  rootStore.fdaDrugStore = new FdaDrugStore(rootStore);
  rootStore.specimenTypeStore = new SpecimenTypeStore(rootStore);
  rootStore.companionDiagnosticDeviceStore = new CompanionDiagnosticDeviceStore(rootStore);
  rootStore.fdaSubmissionTypeStore = new FdaSubmissionTypeStore(rootStore);
  rootStore.fdaSubmissionStore = new FdaSubmissionStore(rootStore);
  rootStore.consequenceStore = new ConsequenceStore(rootStore);
  rootStore.alterationStore = new AlterationStore(rootStore);
  rootStore.cancerTypeStore = new CancerTypeStore(rootStore);
  rootStore.articleStore = new ArticleStore(rootStore);
  rootStore.drugBrandStore = new DrugBrandStore(rootStore);
  rootStore.categoricalAlterationStore = new CategoricalAlterationStore(rootStore);
  rootStore.seqRegionStore = new SeqRegionStore(rootStore);
  rootStore.flagStore = new FlagStore(rootStore);
  rootStore.associationStore = new AssociationStore(rootStore);
  rootStore.associationCancerTypeStore = new AssociationCancerTypeStore(rootStore);
  rootStore.clinicalTrialStore = new ClinicalTrialStore(rootStore);
  rootStore.clinicalTrialArmStore = new ClinicalTrialArmStore(rootStore);
  rootStore.drugPriorityStore = new DrugPriorityStore(rootStore);
  rootStore.eligibilityCriteriaStore = new EligibilityCriteriaStore(rootStore);
  rootStore.evidenceStore = new EvidenceStore(rootStore);
  rootStore.genomicIndicatorStore = new GenomicIndicatorStore(rootStore);
  rootStore.historyStore = new HistoryStore(rootStore);
  rootStore.levelOfEvidenceStore = new LevelOfEvidenceStore(rootStore);
  rootStore.nciThesaurusStore = new NciThesaurusStore(rootStore);
  rootStore.synonymStore = new SynonymStore(rootStore);
  rootStore.treatmentStore = new TreatmentStore(rootStore);
  rootStore.treatmentPriorityStore = new TreatmentPriorityStore(rootStore);
  /* Firebase stores */
  rootStore.firebaseStore = new FirebaseStore(rootStore);
  rootStore.firebaseGeneStore = new FirebaseGeneStore(rootStore);
  rootStore.firebaseMetaStore = new FirebaseMetaStore(rootStore);
  rootStore.firebaseDrugsStore = new FirebaseDrugsStore(rootStore);
  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
