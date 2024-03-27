package org.mskcc.oncokb.curation.domain;

import java.util.List;

public class RelevantCancerTypeBody {

    List<RelevantCancerTypeQuery> relevantCancerTypeQueries;
    List<RelevantCancerTypeQuery> excludedRelevantCancerTypeQueries;

    public List<RelevantCancerTypeQuery> getRelevantCancerTypeQueries() {
        return relevantCancerTypeQueries;
    }

    public void setRelevantCancerTypeQueries(List<RelevantCancerTypeQuery> relevantCancerTypeQueries) {
        this.relevantCancerTypeQueries = relevantCancerTypeQueries;
    }

    public List<RelevantCancerTypeQuery> getExcludedRelevantCancerTypeQueries() {
        return excludedRelevantCancerTypeQueries;
    }

    public void setExcludedRelevantCancerTypeQueries(List<RelevantCancerTypeQuery> excludedRelevantCancerTypeQueries) {
        this.excludedRelevantCancerTypeQueries = excludedRelevantCancerTypeQueries;
    }
}
