package org.mskcc.oncokb.curation.service;

import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.service.criteria.AlterationCriteria;
import org.mskcc.oncokb.curation.service.criteria.ArticleCriteria;
import org.mskcc.oncokb.curation.service.criteria.CompanionDiagnosticDeviceCriteria;
import org.mskcc.oncokb.curation.service.criteria.DrugCriteria;
import org.mskcc.oncokb.curation.service.criteria.FdaSubmissionCriteria;
import org.mskcc.oncokb.curation.service.criteria.GeneCriteria;
import org.mskcc.oncokb.curation.service.dto.SearchResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.StringFilter;

@Service
@Transactional
public class SearchService {

    private final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final AlterationQueryService alterationQueryService;
    private final ArticleQueryService articleQueryService;
    private final CompanionDiagnosticDeviceQueryService companionDiagnosticDeviceQueryService;
    private final DrugQueryService drugQueryService;
    private final FdaSubmissionQueryService fdaSubmissionQueryService;
    private final GeneQueryService geneQueryService;

    public SearchService(
        AlterationQueryService alterationQueryService,
        ArticleQueryService articleQueryService,
        CompanionDiagnosticDeviceQueryService companionDiagnosticDeviceQueryService,
        DrugQueryService drugQueryService,
        FdaSubmissionQueryService fdaSubmissionQueryService,
        GeneQueryService geneQueryService
    ) {
        this.alterationQueryService = alterationQueryService;
        this.articleQueryService = articleQueryService;
        this.companionDiagnosticDeviceQueryService = companionDiagnosticDeviceQueryService;
        this.drugQueryService = drugQueryService;
        this.fdaSubmissionQueryService = fdaSubmissionQueryService;
        this.geneQueryService = geneQueryService;
    }

    public SearchResultDTO search(String query) {
        log.debug("Request to search for query {}", query);
        Pageable defaultPageable = Pageable.ofSize(5);

        List<FdaSubmission> fdaSubmissions = new ArrayList<>();
        List<CompanionDiagnosticDevice> cdxs = new ArrayList<>();
        List<Article> articles = new ArrayList<>();
        List<Drug> drugs = new ArrayList<>();
        List<Gene> genes = new ArrayList<>();
        List<Alteration> alterations = new ArrayList<>();

        StringFilter stringContainsFilter = new StringFilter();
        stringContainsFilter.setContains(query);

        FdaSubmissionCriteria fdaSubmissionCriteria = new FdaSubmissionCriteria();
        fdaSubmissionCriteria.setDeviceName(stringContainsFilter);
        fdaSubmissionCriteria.setNumber(stringContainsFilter);
        fdaSubmissionCriteria.setSupplementNumber(stringContainsFilter);
        fdaSubmissions = this.fdaSubmissionQueryService.findByCriteria(fdaSubmissionCriteria, defaultPageable).getContent();

        CompanionDiagnosticDeviceCriteria cdxCriteria = new CompanionDiagnosticDeviceCriteria();
        cdxCriteria.setName(stringContainsFilter);
        cdxCriteria.setManufacturer(stringContainsFilter);
        cdxs = this.companionDiagnosticDeviceQueryService.findByCriteria(cdxCriteria, defaultPageable).getContent();

        ArticleCriteria articleCriteria = new ArticleCriteria();
        articleCriteria.setPmid(stringContainsFilter);
        articles = this.articleQueryService.findByCriteria(articleCriteria, defaultPageable).getContent();

        DrugCriteria drugCriteria = new DrugCriteria();
        drugCriteria.setName(stringContainsFilter);
        drugCriteria.setBrandsName(stringContainsFilter);
        drugs = this.drugQueryService.findByCriteria(drugCriteria, defaultPageable).getContent();

        IntegerFilter entrezGeneIdFilter = new IntegerFilter();
        try {
            Integer entrezGeneId = Integer.parseInt(query);
            entrezGeneIdFilter.setEquals(entrezGeneId);
        } catch (NumberFormatException e) {}
        GeneCriteria geneCriteria = new GeneCriteria();
        geneCriteria.setHugoSymbol(stringContainsFilter);
        geneCriteria.setEntrezGeneId(entrezGeneIdFilter);
        genes = this.geneQueryService.findByCriteria(geneCriteria, defaultPageable).getContent();

        AlterationCriteria alterationCriteria = new AlterationCriteria();
        alterationCriteria.setName(stringContainsFilter);
        alterations = this.alterationQueryService.findByCriteria(alterationCriteria, defaultPageable).getContent();

        SearchResultDTO searchResultDTO = new SearchResultDTO(fdaSubmissions, cdxs, articles, drugs, genes, alterations);
        return searchResultDTO;
    }
}
