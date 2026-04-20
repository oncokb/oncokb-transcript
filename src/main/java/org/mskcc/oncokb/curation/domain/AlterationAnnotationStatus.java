package org.mskcc.oncokb.curation.domain;

import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.curation.domain.dto.AnnotationDTO;

public class AlterationAnnotationStatus extends EntityStatus<Alteration> {

    String queryId;

    AnnotationDTO annotation = new AnnotationDTO();

    List<String> messages = new ArrayList<>();

    public String getQueryId() {
        return queryId;
    }

    public void setQueryId(String queryId) {
        this.queryId = queryId;
    }

    public AnnotationDTO getAnnotation() {
        return annotation;
    }

    public void setAnnotation(AnnotationDTO annotation) {
        this.annotation = annotation;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void addMessage(String message) {
        if (message != null && !message.isEmpty()) {
            this.messages.add(message);
        }
    }

    @Override
    public void setMessage(String message) {
        super.setMessage(message);
        addMessage(message);
    }
}
