package org.mskcc.oncokb.curation.domain;

import org.mskcc.oncokb.curation.domain.dto.AnnotationDTO;

public class AlterationAnnotationStatus extends EntityStatus<Alteration> {

    String queryId;

    public String getQueryId() {
        return queryId;
    }

    public void setQueryId(String queryId) {
        this.queryId = queryId;
    }

    AnnotationDTO annotation = new AnnotationDTO();

    public AnnotationDTO getAnnotation() {
        return annotation;
    }

    public void setAnnotation(AnnotationDTO annotation) {
        this.annotation = annotation;
    }
}
