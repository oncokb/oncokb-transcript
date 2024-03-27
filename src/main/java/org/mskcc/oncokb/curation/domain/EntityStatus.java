package org.mskcc.oncokb.curation.domain;

import org.mskcc.oncokb.curation.domain.enumeration.EntityStatusType;

public class EntityStatus<T> {

    T entity;
    String message;
    EntityStatusType type;

    public T getEntity() {
        return entity;
    }

    public void setEntity(T entity) {
        this.entity = entity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public EntityStatusType getType() {
        return type;
    }

    public void setType(EntityStatusType type) {
        this.type = type;
    }

    public boolean isOk() {
        return type.equals(EntityStatusType.OK);
    }

    public boolean isWarning() {
        return type.equals(EntityStatusType.WARNING);
    }

    public boolean isError() {
        return type.equals(EntityStatusType.ERROR);
    }
}
