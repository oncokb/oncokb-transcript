package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A FdaSubmission.
 */
@Entity
@Table(name = "fda_submission")
public class FdaSubmission implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "number", nullable = false)
    private String number;

    @Column(name = "supplement_number")
    private String supplementNumber;

    @NotNull
    @Column(name = "device_name", nullable = false)
    private String deviceName;

    @Column(name = "generic_name")
    private String genericName;

    @Column(name = "date_received")
    private Instant dateReceived;

    @Column(name = "decision_date")
    private Instant decisionDate;

    @DiffIgnore
    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "platform")
    private String platform;

    @NotNull
    @Column(name = "curated", nullable = false)
    private Boolean curated;

    @NotNull
    @Column(name = "genetic", nullable = false)
    private Boolean genetic;

    @DiffIgnore
    @Lob
    @Column(name = "note")
    private String note;

    @ShallowReference
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "rel_fda_submission__association",
        joinColumns = @JoinColumn(name = "fda_submission_id"),
        inverseJoinColumns = @JoinColumn(name = "association_id")
    )
    @JsonIgnoreProperties(
        value = { "evidence", "clinicalTrials", "clinicalTrialArms", "eligibilityCriteria", "fdaSubmissions", "genomicIndicators" },
        allowSetters = true
    )
    private Set<Association> associations = new HashSet<>();

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "fdaSubmissions", "specimenTypes" }, allowSetters = true)
    private CompanionDiagnosticDevice companionDiagnosticDevice;

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "fdaSubmissions" }, allowSetters = true)
    private FdaSubmissionType type;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FdaSubmission id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumber() {
        return this.number;
    }

    public FdaSubmission number(String number) {
        this.setNumber(number);
        return this;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getSupplementNumber() {
        return this.supplementNumber;
    }

    public FdaSubmission supplementNumber(String supplementNumber) {
        this.setSupplementNumber(supplementNumber);
        return this;
    }

    public void setSupplementNumber(String supplementNumber) {
        this.supplementNumber = supplementNumber;
    }

    public String getDeviceName() {
        return this.deviceName;
    }

    public FdaSubmission deviceName(String deviceName) {
        this.setDeviceName(deviceName);
        return this;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getGenericName() {
        return this.genericName;
    }

    public FdaSubmission genericName(String genericName) {
        this.setGenericName(genericName);
        return this;
    }

    public void setGenericName(String genericName) {
        this.genericName = genericName;
    }

    public Instant getDateReceived() {
        return this.dateReceived;
    }

    public FdaSubmission dateReceived(Instant dateReceived) {
        this.setDateReceived(dateReceived);
        return this;
    }

    public void setDateReceived(Instant dateReceived) {
        this.dateReceived = dateReceived;
    }

    public Instant getDecisionDate() {
        return this.decisionDate;
    }

    public FdaSubmission decisionDate(Instant decisionDate) {
        this.setDecisionDate(decisionDate);
        return this;
    }

    public void setDecisionDate(Instant decisionDate) {
        this.decisionDate = decisionDate;
    }

    public String getDescription() {
        return this.description;
    }

    public FdaSubmission description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPlatform() {
        return this.platform;
    }

    public FdaSubmission platform(String platform) {
        this.setPlatform(platform);
        return this;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public Boolean getCurated() {
        return this.curated;
    }

    public FdaSubmission curated(Boolean curated) {
        this.setCurated(curated);
        return this;
    }

    public void setCurated(Boolean curated) {
        this.curated = curated;
    }

    public Boolean getGenetic() {
        return this.genetic;
    }

    public FdaSubmission genetic(Boolean genetic) {
        this.setGenetic(genetic);
        return this;
    }

    public void setGenetic(Boolean genetic) {
        this.genetic = genetic;
    }

    public String getNote() {
        return this.note;
    }

    public FdaSubmission note(String note) {
        this.setNote(note);
        return this;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        this.associations = associations;
    }

    public FdaSubmission associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public FdaSubmission addAssociation(Association association) {
        this.associations.add(association);
        association.getFdaSubmissions().add(this);
        return this;
    }

    public FdaSubmission removeAssociation(Association association) {
        this.associations.remove(association);
        association.getFdaSubmissions().remove(this);
        return this;
    }

    public CompanionDiagnosticDevice getCompanionDiagnosticDevice() {
        return this.companionDiagnosticDevice;
    }

    public void setCompanionDiagnosticDevice(CompanionDiagnosticDevice companionDiagnosticDevice) {
        this.companionDiagnosticDevice = companionDiagnosticDevice;
    }

    public FdaSubmission companionDiagnosticDevice(CompanionDiagnosticDevice companionDiagnosticDevice) {
        this.setCompanionDiagnosticDevice(companionDiagnosticDevice);
        return this;
    }

    public FdaSubmissionType getType() {
        return this.type;
    }

    public void setType(FdaSubmissionType fdaSubmissionType) {
        this.type = fdaSubmissionType;
    }

    public FdaSubmission type(FdaSubmissionType fdaSubmissionType) {
        this.setType(fdaSubmissionType);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FdaSubmission)) {
            return false;
        }
        return id != null && id.equals(((FdaSubmission) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FdaSubmission{" +
            "id=" + getId() +
            ", number='" + getNumber() + "'" +
            ", supplementNumber='" + getSupplementNumber() + "'" +
            ", deviceName='" + getDeviceName() + "'" +
            ", genericName='" + getGenericName() + "'" +
            ", dateReceived='" + getDateReceived() + "'" +
            ", decisionDate='" + getDecisionDate() + "'" +
            ", description='" + getDescription() + "'" +
            ", platform='" + getPlatform() + "'" +
            ", curated='" + getCurated() + "'" +
            ", genetic='" + getGenetic() + "'" +
            ", note='" + getNote() + "'" +
            "}";
    }
}
