package org.mskcc.oncokb.curation.service.dto.pubmed;

import java.io.Serializable;
import java.time.Instant;

public class JournalDTO implements Serializable {

    String issn;
    String volume;
    String issue;
    String pages;
    String title;
    String isoAbbreviation;

    public String getIssn() {
        return issn;
    }

    public void setIssn(String issn) {
        this.issn = issn;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getPages() {
        return pages;
    }

    public void setPages(String pages) {
        this.pages = pages;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsoAbbreviation() {
        return isoAbbreviation;
    }

    public void setIsoAbbreviation(String isoAbbreviation) {
        this.isoAbbreviation = isoAbbreviation;
    }
}
