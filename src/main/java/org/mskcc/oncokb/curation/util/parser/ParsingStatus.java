package org.mskcc.oncokb.curation.util.parser;

import org.mskcc.oncokb.curation.domain.enumeration.EntityStatusType;

public class ParsingStatus<T> {

    EntityStatusType status;
    String message;
    T entity;

    public Boolean isParsed() {
        return this.status != null;
    }

    public EntityStatusType getStatus() {
        return status;
    }

    public void setStatus(EntityStatusType status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getEntity() {
        return entity;
    }

    public void setEntity(T entity) {
        this.entity = entity;
    }
}
