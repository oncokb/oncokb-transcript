package org.mskcc.oncokb.curation.service;

import java.io.Serializable;
import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.elasticsearch.ResourceAlreadyExistsException;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.repository.*;
import org.mskcc.oncokb.curation.repository.search.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.index.Settings;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ElasticsearchIndexService {

    private static final Lock reindexLock = new ReentrantLock();

    private final Logger log = LoggerFactory.getLogger(ElasticsearchIndexService.class);

    private final ArticleRepository articleRepository;
    private final ArticleSearchRepository articleSearchRepository;
    private final CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository;
    private final CompanionDiagnosticDeviceSearchRepository companionDiagnosticDeviceSearchRepository;
    private final FdaSubmissionRepository fdaSubmissionRepository;
    private final FdaSubmissionSearchRepository fdaSubmissionSearchRepository;
    private final CancerTypeRepository cancerTypeRepository;
    private final CancerTypeSearchRepository cancerTypeSearchRepository;
    private final DrugRepository drugRepository;
    private final DrugSearchRepository drugSearchRepository;
    private final GeneRepository geneRepository;
    private final GeneSearchRepository geneSearchRepository;
    private final AlterationRepository alterationRepository;
    private final AlterationSearchRepository alterationSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    public ElasticsearchIndexService(
        ArticleRepository articleRepository,
        ArticleSearchRepository articleSearchRepository,
        CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository,
        CompanionDiagnosticDeviceSearchRepository companionDiagnosticDeviceSearchRepository,
        FdaSubmissionRepository fdaSubmissionRepository,
        FdaSubmissionSearchRepository fdaSubmissionSearchRepository,
        CancerTypeRepository cancerTypeRepository,
        CancerTypeSearchRepository cancerTypeSearchRepository,
        DrugRepository drugRepository,
        DrugSearchRepository drugSearchRepository,
        GeneRepository geneRepository,
        GeneSearchRepository geneSearchRepository,
        AlterationRepository alterationRepository,
        AlterationSearchRepository alterationSearchRepository,
        ElasticsearchOperations elasticsearchOperations
    ) {
        this.articleRepository = articleRepository;
        this.articleSearchRepository = articleSearchRepository;
        this.companionDiagnosticDeviceRepository = companionDiagnosticDeviceRepository;
        this.companionDiagnosticDeviceSearchRepository = companionDiagnosticDeviceSearchRepository;
        this.fdaSubmissionRepository = fdaSubmissionRepository;
        this.fdaSubmissionSearchRepository = fdaSubmissionSearchRepository;
        this.cancerTypeRepository = cancerTypeRepository;
        this.cancerTypeSearchRepository = cancerTypeSearchRepository;
        this.drugRepository = drugRepository;
        this.drugSearchRepository = drugSearchRepository;
        this.geneRepository = geneRepository;
        this.geneSearchRepository = geneSearchRepository;
        this.alterationRepository = alterationRepository;
        this.alterationSearchRepository = alterationSearchRepository;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public void reindexAll() {
        reindexIndices(Stream.of(ElasticsearchIndexName.values()).map(indexName -> indexName.getName()).collect(Collectors.toList()));
    }

    public void reindexIndices(List<String> indexNames) {
        if (reindexLock.tryLock()) {
            try {
                if (indexNames.contains(ElasticsearchIndexName.ARTICLE.getName())) {
                    reindexForClass(Article.class, articleRepository, articleSearchRepository);
                }
                if (indexNames.contains(ElasticsearchIndexName.COMPANION_DIAGNOSTIC_DEVICE.getName())) {
                    reindexForClass(
                        CompanionDiagnosticDevice.class,
                        companionDiagnosticDeviceRepository,
                        companionDiagnosticDeviceSearchRepository
                    );
                }
                if (indexNames.contains(ElasticsearchIndexName.FDA_SUBMISSION.getName())) {
                    reindexForClass(FdaSubmission.class, fdaSubmissionRepository, fdaSubmissionSearchRepository);
                }
                if (indexNames.contains(ElasticsearchIndexName.CANCER_TYPE.getName())) {
                    reindexForClass(CancerType.class, cancerTypeRepository, cancerTypeSearchRepository);
                }
                if (indexNames.contains(ElasticsearchIndexName.DRUG.getName())) {
                    reindexForClass(Drug.class, drugRepository, drugSearchRepository);
                }
                if (indexNames.contains(ElasticsearchIndexName.GENE.getName())) {
                    reindexForClass(Gene.class, geneRepository, geneSearchRepository);
                }
                if (indexNames.contains(ElasticsearchIndexName.ALTERATION.getName())) {
                    reindexForClass(Alteration.class, alterationRepository, alterationSearchRepository);
                }
                log.info("Elasticsearch: Successfully performed reindexing");
            } finally {
                reindexLock.unlock();
            }
        } else {
            log.info("Elasticsearch: concurrent reindexing attempt");
        }
    }

    private <T, ID extends Serializable> void reindexForClass(
        Class<T> entityClass,
        JpaRepository<T, ID> jpaRepository,
        ElasticsearchRepository<T, ID> elasticsearchRepository
    ) {
        IndexOperations indexOperations = elasticsearchOperations.indexOps(IndexCoordinates.of(entityClass.getSimpleName().toLowerCase()));
        indexOperations.delete();
        try {
            Settings setting = indexOperations.createSettings(entityClass);
            Document document = indexOperations.createMapping(entityClass);
            indexOperations.create(setting, document);
        } catch (ResourceAlreadyExistsException e) {
            // Do nothing. Index was already concurrently recreated by some other service.
        }
        indexOperations.putMapping(entityClass);
        if (jpaRepository.count() > 0) {
            int size = 1000;
            for (int i = 0; i <= jpaRepository.count() / size; i++) {
                Pageable page = PageRequest.of(i, size);
                log.info("Indexing page {} of {}, size {}", i, jpaRepository.count() / size, size);
                Page<T> results = jpaRepository.findAll(page);
                elasticsearchRepository.saveAll(results.getContent());
            }
        }
        log.info("Elasticsearch: Indexed all rows for {}", entityClass.getSimpleName());
    }
}
