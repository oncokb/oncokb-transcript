package org.mskcc.oncokb.curation.domain;

import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.curation.domain.enumeration.EntityStatusType;

public class EntityStatus<T> {

    T entity;
    EntityStatusType type;
    List<String> messages = new ArrayList<>();

    public T getEntity() {
        return entity;
    }

    public void setEntity(T entity) {
        this.entity = entity;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void addMessage(String message) {
        if (message != null && !message.isEmpty()) {
            this.messages.add(message);
        }
    }

    public void setMessage(String message) {
        addMessage(message);
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
