import { UserStore } from 'app/modules/administration/user-management/user.store';
import { SettingsStore } from 'app/pages/account/settings.store';
import { AuthStore } from 'app/stores/authentication.store';
import { LoadingBarStore } from 'app/stores/loading-bar.store';
import { History } from 'history';
import LayoutStore from './layout.store';
import { RouterStore } from './router.store';
// prettier-ignore
import {
  SequenceStore
} from 'app/entities/sequence/sequence.store';
// prettier-ignore
import {
  TranscriptStore
} from 'app/entities/transcript/transcript.store';
// prettier-ignore
import {
  InfoStore
} from 'app/entities/info/info.store';
// prettier-ignore
import {
  GeneStore
} from 'app/entities/gene/gene.store';
// prettier-ignore
import {
  GenomeFragmentStore
} from 'app/entities/genome-fragment/genome-fragment.store';
// prettier-ignore
import {
  EnsemblGeneStore
} from 'app/entities/ensembl-gene/ensembl-gene.store';
// prettier-ignore
import {
  DrugStore
} from 'app/entities/drug/drug.store';
// prettier-ignore
import {
  SpecimenTypeStore
} from 'app/entities/specimen-type/specimen-type.store';
// prettier-ignore
import {
  CompanionDiagnosticDeviceStore
} from 'app/entities/companion-diagnostic-device/companion-diagnostic-device.store';
// prettier-ignore
import {
  FdaSubmissionTypeStore
} from 'app/entities/fda-submission-type/fda-submission-type.store';
// prettier-ignore
import {
  FdaSubmissionStore
} from 'app/entities/fda-submission/fda-submission.store';
// prettier-ignore
import {
  AlterationStore
} from 'app/entities/alteration/alteration.store';
// prettier-ignore
import {
  CancerTypeStore
} from 'app/entities/cancer-type/cancer-type.store';
import { FirebaseGeneService } from '../service/firebase/firebase-gene-service';
import { FirebaseMetaService } from '../service/firebase/firebase-meta-service';
import FirebaseAppStore from './firebase/firebase-app.store';
// prettier-ignore
import {
  ArticleStore
} from 'app/entities/article/article.store';
// prettier-ignore
import {
  ConsequenceStore
} from 'app/entities/consequence/consequence.store';
// prettier-ignore
import {
  FdaDrugStore
} from 'app/entities/fda-drug/fda-drug.store';
// prettier-ignore
import {
  SeqRegionStore
} from 'app/entities/seq-region/seq-region.store';
// prettier-ignore
import AssociationStore from 'app/entities/association/association.store';
import ClinicalTrialArmStore from 'app/entities/clinical-trial-arm/clinical-trial-arm.store';
import ClinicalTrialStore from 'app/entities/clinical-trial/clinical-trial.store';
import { FlagStore } from 'app/entities/flag/flag.store';
import EligibilityCriteriaStore from 'app/entities/eligibility-criteria/eligibility-criteria.store';
import EvidenceStore from 'app/entities/evidence/evidence.store';
import GenomicIndicatorStore from 'app/entities/genomic-indicator/genomic-indicator.store';
import LevelOfEvidenceStore from 'app/entities/level-of-evidence/level-of-evidence.store';
import NciThesaurusStore from 'app/entities/nci-thesaurus/nci-thesaurus.store';
import SynonymStore from 'app/entities/synonym/synonym.store';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import { FirebaseVusService } from 'app/service/firebase/firebase-vus-service';
import { ModifyCancerTypeModalStore } from 'app/shared/modal/modify-cancer-type-modal.store';
import { ModifyTherapyModalStore } from 'app/shared/modal/modify-therapy-modal.store';
import { RelevantCancerTypesModalStore } from 'app/shared/modal/relevant-cancer-types-modal-store';
import { GenomicIndicator, HistoryList, MetaCollection, Mutation, VusObjList } from 'app/shared/model/firebase/firebase.model';
import { HistoryTabStore } from '../components/tabs/history-tab.store';
import { FirebaseHistoryService } from '../service/firebase/firebase-history-service';
import { CommentStore } from './comment.store';
import { FirebaseDataStore } from './firebase/firebase-data.store';
import { FirebaseRepository } from './firebase/firebase-repository';
import { OpenMutationCollapsibleStore } from './open-mutation-collapsible.store';
import { CurationPageStore } from 'app/stores/curation-page.store';
import CategoricalAlterationStore from 'app/entities/categorical-alteration/categorical-alteration.store';
import { driveAnnotationClient, evidenceClient, geneTypeClient } from 'app/shared/api/clients';
import { WindowStore } from './window-store';
/* jhipster-needle-add-store-import - JHipster will add store here */

export interface IRootStore {
  readonly loadingStore: LoadingBarStore;
  readonly authStore: AuthStore;
  readonly settingsStore: SettingsStore;
  readonly userStore: UserStore;
  readonly routerStore: RouterStore;
  readonly layoutStore: LayoutStore;
  readonly curationPageStore: CurationPageStore;
  readonly windowStore: WindowStore;

  readonly categoricalAlterationStore: CategoricalAlterationStore;
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
  readonly historyTabStore: HistoryTabStore;
  readonly associationStore: AssociationStore;
  readonly clinicalTrialStore: ClinicalTrialStore;
  readonly clinicalTrialArmStore: ClinicalTrialArmStore;
  readonly eligibilityCriteriaStore: EligibilityCriteriaStore;
  readonly evidenceStore: EvidenceStore;
  readonly genomicIndicatorStore: GenomicIndicatorStore;
  readonly levelOfEvidenceStore: LevelOfEvidenceStore;
  readonly nciThesaurusStore: NciThesaurusStore;
  readonly synonymStore: SynonymStore;
  readonly seqRegionStore: SeqRegionStore;
  readonly modifyCancerTypeModalStore: ModifyCancerTypeModalStore;
  readonly modifyTherapyModalStore: ModifyTherapyModalStore;
  readonly relevantCancerTypesModalStore: RelevantCancerTypesModalStore;
  readonly openMutationCollapsibleStore: OpenMutationCollapsibleStore;
  readonly flagStore: FlagStore;
  readonly commentStore: CommentStore;
  /* Firebase stores */
  readonly firebaseAppStore: FirebaseAppStore;
  readonly firebaseHistoryStore: FirebaseDataStore<HistoryList>;
  readonly firebaseVusStore: FirebaseDataStore<VusObjList>;
  readonly firebaseMetaStore: FirebaseDataStore<MetaCollection>;
  readonly firebaseMutationListStore: FirebaseDataStore<Mutation[]>;
  readonly firebaseMutationConvertIconStore: FirebaseDataStore<Mutation[]>;
  readonly firebaseGenomicIndicatorsStore: FirebaseDataStore<GenomicIndicator[]>;

  /* Firebase services */
  readonly firebaseGeneReviewService: FirebaseGeneReviewService;
  readonly firebaseGeneService: FirebaseGeneService;
  readonly firebaseMetaService: FirebaseMetaService;
  readonly firebaseHistoryService: FirebaseHistoryService;
  readonly firebaseVusService: FirebaseVusService;
  /* jhipster-needle-add-store-field - JHipster will add store here */
}

export function createStores(history: History): IRootStore {
  const rootStore = {} as any;

  rootStore.loadingStore = new LoadingBarStore();
  rootStore.authStore = new AuthStore(rootStore);
  rootStore.settingsStore = new SettingsStore(rootStore);
  rootStore.userStore = new UserStore(rootStore);
  rootStore.routerStore = new RouterStore(history);
  rootStore.layoutStore = new LayoutStore(rootStore);
  rootStore.curationPageStore = new CurationPageStore(rootStore);
  rootStore.windowStore = new WindowStore();

  /* Entity stores */
  rootStore.categoricalAlterationStore = new CategoricalAlterationStore(rootStore);
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
  rootStore.historyTabStore = new HistoryTabStore();
  rootStore.associationStore = new AssociationStore(rootStore);
  rootStore.clinicalTrialStore = new ClinicalTrialStore(rootStore);
  rootStore.clinicalTrialArmStore = new ClinicalTrialArmStore(rootStore);
  rootStore.eligibilityCriteriaStore = new EligibilityCriteriaStore(rootStore);
  rootStore.evidenceStore = new EvidenceStore(rootStore);
  rootStore.genomicIndicatorStore = new GenomicIndicatorStore(rootStore);
  rootStore.levelOfEvidenceStore = new LevelOfEvidenceStore(rootStore);
  rootStore.nciThesaurusStore = new NciThesaurusStore(rootStore);
  rootStore.synonymStore = new SynonymStore(rootStore);
  rootStore.seqRegionStore = new SeqRegionStore(rootStore);
  rootStore.flagStore = new FlagStore(rootStore);
  rootStore.modifyCancerTypeModalStore = new ModifyCancerTypeModalStore();
  rootStore.modifyTherapyModalStore = new ModifyTherapyModalStore();
  rootStore.relevantCancerTypesModalStore = new RelevantCancerTypesModalStore();
  rootStore.openMutationCollapsibleStore = new OpenMutationCollapsibleStore();
  rootStore.commentStore = new CommentStore();

  /* Firebase Stores */
  const firebaseAppStore = new FirebaseAppStore(rootStore);
  const firebaseHistoryStore = new FirebaseDataStore<HistoryList>(firebaseAppStore);
  const firebaseVusStore = new FirebaseDataStore<VusObjList>(firebaseAppStore);
  const firebaseMetaStore = new FirebaseDataStore<MetaCollection>(firebaseAppStore);
  const firebaseMutationListStore = new FirebaseDataStore<Mutation[]>(firebaseAppStore);
  const firebaseMutationConvertIconStore = new FirebaseDataStore<Mutation[]>(firebaseAppStore);
  const firebaseGenomicIndicatorsStore = new FirebaseDataStore<GenomicIndicator[]>(firebaseAppStore);

  rootStore.firebaseAppStore = firebaseAppStore;
  rootStore.firebaseHistoryStore = firebaseHistoryStore;
  rootStore.firebaseVusStore = firebaseVusStore;
  rootStore.firebaseMetaStore = firebaseMetaStore;
  rootStore.firebaseMutationListStore = firebaseMutationListStore;
  rootStore.firebaseMutationConvertIconStore = firebaseMutationConvertIconStore;
  rootStore.firebaseGenomicIndicatorsStore = firebaseGenomicIndicatorsStore;

  /* Firebase Repository */
  const firebaseRepository = new FirebaseRepository(firebaseAppStore);

  /* Firebase Services */
  const firebaseMetaService = new FirebaseMetaService(firebaseRepository, rootStore.authStore);
  const firebaseHistoryService = new FirebaseHistoryService(firebaseRepository);
  const firebaseVusService = new FirebaseVusService(firebaseRepository, rootStore.authStore);
  const firebaseGeneReviewService = new FirebaseGeneReviewService(
    firebaseRepository,
    rootStore.authStore,
    firebaseMetaService,
    firebaseHistoryService,
    firebaseVusService,
    evidenceClient,
    geneTypeClient,
  );
  const firebaseGeneService = new FirebaseGeneService(
    firebaseRepository,
    rootStore.authStore,
    firebaseMutationListStore,
    firebaseMutationConvertIconStore,
    firebaseMetaService,
    firebaseGeneReviewService,
    driveAnnotationClient,
  );

  rootStore.firebaseMetaService = firebaseMetaService;
  rootStore.firebaseHistoryService = firebaseHistoryService;
  rootStore.firebaseGeneReviewService = firebaseGeneReviewService;
  rootStore.firebaseGeneService = firebaseGeneService;
  rootStore.firebaseVusService = firebaseVusService;

  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
