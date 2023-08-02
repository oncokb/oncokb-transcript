package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A FdaSubmission.
 */
@Entity
@Table(
    name = "fda_submission",
    uniqueConstraints = { @UniqueConstraint(columnNames = { "number", "supplement_number", "companion_diagnostic_device_id" }) }
)
public class FdaSubmission implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotEmpty
    @Column(name = "number", nullable = false)
    private String number;

    @Column(name = "supplement_number")
    private String supplementNumber = "";

    @NotEmpty
    @Column(name = "device_name", nullable = false)
    private String deviceName;

    @Column(name = "generic_name")
    private String genericName;

    @Column(name = "date_received")
    private Instant dateReceived;

    @Column(name = "decision_date")
    private Instant decisionDate;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "platform")
    private String platform;

    @NotNull
    @Column(name = "curated", nullable = false)
    private Boolean curated = false;

    @NotNull
    @Column(name = "genetic", nullable = false)
    private Boolean genetic = false;

    @Lob
    @Column(name = "additional_info")
    private String additionalInfo;

    @ManyToOne
    @JsonIgnoreProperties(value = { "fdaSubmissions", "specimenTypes" }, allowSetters = true)
    private CompanionDiagnosticDevice companionDiagnosticDevice;

    @ManyToOne
    @JsonIgnoreProperties(value = { "fdaSubmissions" }, allowSetters = true)
    private FdaSubmissionType type;

    @ManyToMany(mappedBy = "fdaSubmissions", fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "alterations", "drugs", "fdaSubmissions", "cancerType", "gene" }, allowSetters = true)
    private Set<BiomarkerAssociation> biomarkerAssociations = new HashSet<>();

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

    public String getAdditionalInfo() {
        return this.additionalInfo;
    }

    public FdaSubmission additionalInfo(String additionalInfo) {
        this.setAdditionalInfo(additionalInfo);
        return this;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
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

    public Set<BiomarkerAssociation> getBiomarkerAssociations() {
        return this.biomarkerAssociations;
    }

    public void setBiomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        if (this.biomarkerAssociations != null) {
            this.biomarkerAssociations.forEach(i -> i.removeFdaSubmission(this));
        }
        if (biomarkerAssociations != null) {
            biomarkerAssociations.forEach(i -> i.addFdaSubmission(this));
        }
        this.biomarkerAssociations = biomarkerAssociations;
    }

    public FdaSubmission biomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        this.setBiomarkerAssociations(biomarkerAssociations);
        return this;
    }

    public FdaSubmission addBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.add(biomarkerAssociation);
        biomarkerAssociation.getFdaSubmissions().add(this);
        return this;
    }

    public FdaSubmission removeBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.remove(biomarkerAssociation);
        biomarkerAssociation.getFdaSubmissions().remove(this);
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
            ", additionalInfo='" + getAdditionalInfo() + "'" +
            "}";
    }
}
