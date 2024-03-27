package org.mskcc.oncokb.curation.web.rest.model;

import java.io.Serializable;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;

public class AnnotateAlterationBody implements Serializable {

    String queryId;

    ReferenceGenome referenceGenome;
    Alteration alteration;

    public String getQueryId() {
        return queryId;
    }

    public void setQueryId(String queryId) {
        this.queryId = queryId;
    }

    public ReferenceGenome getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public Alteration getAlteration() {
        return alteration;
    }

    public void setAlteration(Alteration alteration) {
        this.alteration = alteration;
    }
}
