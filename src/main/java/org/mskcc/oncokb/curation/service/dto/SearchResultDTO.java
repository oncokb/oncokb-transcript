package org.mskcc.oncokb.curation.service.dto;

import java.util.List;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;
import org.springframework.data.elasticsearch.core.SearchHit;

public class SearchResultDTO {

    private final List<SearchHit<FdaSubmission>> fdaSubmissions;
    private final List<SearchHit<CompanionDiagnosticDevice>> companionDiagnosticDevices;
    private final List<SearchHit<Article>> articles;
    private final List<SearchHit<Drug>> drugs;
    private final List<SearchHit<Gene>> genes;
    private final List<SearchHit<Alteration>> alterations;

    public SearchResultDTO(
        List<SearchHit<FdaSubmission>> fdaSubmissions,
        List<SearchHit<CompanionDiagnosticDevice>> companionDiagnosticDevices,
        List<SearchHit<Article>> articles,
        List<SearchHit<Drug>> drugs,
        List<SearchHit<Gene>> genes,
        List<SearchHit<Alteration>> alterations
    ) {
        this.fdaSubmissions = fdaSubmissions;
        this.companionDiagnosticDevices = companionDiagnosticDevices;
        this.articles = articles;
        this.drugs = drugs;
        this.genes = genes;
        this.alterations = alterations;
    }

    public List<SearchHit<FdaSubmission>> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public List<SearchHit<CompanionDiagnosticDevice>> getCompanionDiagnosticDevices() {
        return this.companionDiagnosticDevices;
    }

    public List<SearchHit<Article>> getArticles() {
        return this.articles;
    }

    public List<SearchHit<Drug>> getDrugs() {
        return this.drugs;
    }

    public List<SearchHit<Gene>> getGenes() {
        return this.genes;
    }

    public List<SearchHit<Alteration>> getAlterations() {
        return this.alterations;
    }
}
