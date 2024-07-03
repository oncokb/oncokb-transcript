package org.mskcc.oncokb.curation.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import org.javers.core.metamodel.object.CdoSnapshot;

public class EntityAuditEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String entityId;

    private String entityType;

    private String action;

    private String entityValue;

    private Integer commitVersion;

    private String modifiedBy;

    private Instant modifiedDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityValue() {
        return entityValue;
    }

    public void setEntityValue(String entityValue) {
        this.entityValue = entityValue;
    }

    public Integer getCommitVersion() {
        return commitVersion;
    }

    public void setCommitVersion(Integer commitVersion) {
        this.commitVersion = commitVersion;
    }

    public String getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Instant getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(Instant modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        EntityAuditEvent entityAuditEvent = (EntityAuditEvent) o;
        return Objects.equals(id, entityAuditEvent.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return (
            "EntityAuditEvent{" +
            "id=" +
            id +
            ", entityId='" +
            entityId +
            "'" +
            ", entityType='" +
            entityType +
            "'" +
            ", action='" +
            action +
            "'" +
            ", entityValue='" +
            entityValue +
            "'" +
            ", commitVersion='" +
            commitVersion +
            "'" +
            ", modifiedBy='" +
            modifiedBy +
            "'" +
            ", modifiedDate='" +
            modifiedDate +
            "'" +
            '}'
        );
    }

    public static EntityAuditEvent fromJaversSnapshot(CdoSnapshot snapshot) {
        EntityAuditEvent entityAuditEvent = new EntityAuditEvent();

        switch (snapshot.getType()) {
            case INITIAL:
                entityAuditEvent.setAction("CREATE");
                break;
            case UPDATE:
                entityAuditEvent.setAction("UPDATE");
                break;
            case TERMINAL:
                entityAuditEvent.setAction("DELETE");
                break;
        }

        entityAuditEvent.setId(snapshot.getCommitId().getMajorId());
        entityAuditEvent.setCommitVersion(Math.round(snapshot.getVersion()));
        entityAuditEvent.setEntityType(snapshot.getManagedType().getName());
        entityAuditEvent.setEntityId(snapshot.getGlobalId().value().split("/")[1]);
        entityAuditEvent.setModifiedBy(snapshot.getCommitMetadata().getAuthor());

        if (snapshot.getState().getPropertyNames().size() > 0) {
            int count = 0;
            StringBuilder sb = new StringBuilder("{");

            for (String s : snapshot.getState().getPropertyNames()) {
                count++;
                Object propertyValue = snapshot.getPropertyValue(s);
                sb.append("\"" + s + "\": \"" + propertyValue + "\"");
                if (count < snapshot.getState().getPropertyNames().size()) {
                    sb.append(",");
                }
            }

            sb.append("}");
            entityAuditEvent.setEntityValue(sb.toString());
        }
        LocalDateTime localTime = snapshot.getCommitMetadata().getCommitDate();

        Instant modifyDate = localTime.toInstant(ZoneOffset.UTC);

        entityAuditEvent.setModifiedDate(modifyDate);

        return entityAuditEvent;
    }
}
