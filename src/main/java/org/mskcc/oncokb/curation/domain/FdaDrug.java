package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A FdaDrug.
 */
@Entity
@Table(name = "fda_drug")
public class FdaDrug implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "application_number", nullable = false, unique = true)
    private String applicationNumber;

    @Column(name = "sponsor_name")
    private String sponsorName;

    @Column(name = "overall_marketing_status")
    private String overallMarketingStatus;

    @ShallowReference
    @OneToMany(mappedBy = "fdaDrug")
    @JsonIgnoreProperties(value = { "articles", "associations", "companionDiagnosticDevice", "fdaDrug", "type" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "nciThesaurus", "fdaDrugs", "flags", "associations" }, allowSetters = true)
    private Drug drug;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FdaDrug id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return this.applicationNumber;
    }

    public FdaDrug applicationNumber(String applicationNumber) {
        this.setApplicationNumber(applicationNumber);
        return this;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public String getSponsorName() {
        return this.sponsorName;
    }

    public FdaDrug sponsorName(String sponsorName) {
        this.setSponsorName(sponsorName);
        return this;
    }

    public void setSponsorName(String sponsorName) {
        this.sponsorName = sponsorName;
    }

    public String getOverallMarketingStatus() {
        return this.overallMarketingStatus;
    }

    public FdaDrug overallMarketingStatus(String overallMarketingStatus) {
        this.setOverallMarketingStatus(overallMarketingStatus);
        return this;
    }

    public void setOverallMarketingStatus(String overallMarketingStatus) {
        this.overallMarketingStatus = overallMarketingStatus;
    }

    public Set<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        if (this.fdaSubmissions != null) {
            this.fdaSubmissions.forEach(i -> i.setFdaDrug(null));
        }
        if (fdaSubmissions != null) {
            fdaSubmissions.forEach(i -> i.setFdaDrug(this));
        }
        this.fdaSubmissions = fdaSubmissions;
    }

    public FdaDrug fdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.setFdaSubmissions(fdaSubmissions);
        return this;
    }

    public FdaDrug addFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.add(fdaSubmission);
        fdaSubmission.setFdaDrug(this);
        return this;
    }

    public FdaDrug removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        fdaSubmission.setFdaDrug(null);
        return this;
    }

    public Drug getDrug() {
        return this.drug;
    }

    public void setDrug(Drug drug) {
        this.drug = drug;
    }

    public FdaDrug drug(Drug drug) {
        this.setDrug(drug);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FdaDrug)) {
            return false;
        }
        return id != null && id.equals(((FdaDrug) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FdaDrug{" +
            "id=" + getId() +
            ", applicationNumber='" + getApplicationNumber() + "'" +
            ", sponsorName='" + getSponsorName() + "'" +
            ", overallMarketingStatus='" + getOverallMarketingStatus() + "'" +
            "}";
    }
}
