package org.mskcc.oncokb.curation.service.dto;

import java.util.List;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;

public class SearchResultDTO {

    private final List<FdaSubmission> fdaSubmissions;
    private final List<CompanionDiagnosticDevice> companionDiagnosticDevices;
    private final List<Article> articles;
    private final List<Drug> drugs;
    private final List<Gene> genes;
    private final List<Alteration> alterations;

    public SearchResultDTO(
        List<FdaSubmission> fdaSubmissions,
        List<CompanionDiagnosticDevice> companionDiagnosticDevices,
        List<Article> articles,
        List<Drug> drugs,
        List<Gene> genes,
        List<Alteration> alterations
    ) {
        this.fdaSubmissions = fdaSubmissions;
        this.companionDiagnosticDevices = companionDiagnosticDevices;
        this.articles = articles;
        this.drugs = drugs;
        this.genes = genes;
        this.alterations = alterations;
    }

    public List<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public List<CompanionDiagnosticDevice> getCompanionDiagnosticDevices() {
        return this.companionDiagnosticDevices;
    }

    public List<Article> getArticles() {
        return this.articles;
    }

    public List<Drug> getDrugs() {
        return this.drugs;
    }

    public List<Gene> getGenes() {
        return this.genes;
    }

    public List<Alteration> getAlterations() {
        return this.alterations;
    }
}
