package org.mskcc.oncokb.transcript.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A ClinicalTrial.
 */
@Entity
@Table(name = "clinical_trial")
public class ClinicalTrial implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nct_id")
    private String nctId;

    @Column(name = "phase")
    private String phase;

    @Column(name = "principal_investigator")
    private String principalInvestigator;

    @Column(name = "status")
    private String status;

    @Column(name = "status_last_updated")
    private Instant statusLastUpdated;

    @Column(name = "brief_title")
    private String briefTitle;

    @ManyToMany
    @JoinTable(
        name = "rel_clinical_trial__site",
        joinColumns = @JoinColumn(name = "clinical_trial_id"),
        inverseJoinColumns = @JoinColumn(name = "site_id")
    )
    @JsonIgnoreProperties(value = { "clinicalTrials" }, allowSetters = true)
    private Set<Site> sites = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_clinical_trial__arm",
        joinColumns = @JoinColumn(name = "clinical_trial_id"),
        inverseJoinColumns = @JoinColumn(name = "arm_id")
    )
    @JsonIgnoreProperties(value = { "clinicalTrials", "drugs" }, allowSetters = true)
    private Set<Arm> arms = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ClinicalTrial id(Long id) {
        this.id = id;
        return this;
    }

    public String getNctId() {
        return this.nctId;
    }

    public ClinicalTrial nctId(String nctId) {
        this.nctId = nctId;
        return this;
    }

    public void setNctId(String nctId) {
        this.nctId = nctId;
    }

    public String getPhase() {
        return this.phase;
    }

    public ClinicalTrial phase(String phase) {
        this.phase = phase;
        return this;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getPrincipalInvestigator() {
        return this.principalInvestigator;
    }

    public ClinicalTrial principalInvestigator(String principalInvestigator) {
        this.principalInvestigator = principalInvestigator;
        return this;
    }

    public void setPrincipalInvestigator(String principalInvestigator) {
        this.principalInvestigator = principalInvestigator;
    }

    public String getStatus() {
        return this.status;
    }

    public ClinicalTrial status(String status) {
        this.status = status;
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getStatusLastUpdated() {
        return this.statusLastUpdated;
    }

    public ClinicalTrial statusLastUpdated(Instant statusLastUpdated) {
        this.statusLastUpdated = statusLastUpdated;
        return this;
    }

    public void setStatusLastUpdated(Instant statusLastUpdated) {
        this.statusLastUpdated = statusLastUpdated;
    }

    public String getBriefTitle() {
        return this.briefTitle;
    }

    public ClinicalTrial briefTitle(String briefTitle) {
        this.briefTitle = briefTitle;
        return this;
    }

    public void setBriefTitle(String briefTitle) {
        this.briefTitle = briefTitle;
    }

    public Set<Site> getSites() {
        return this.sites;
    }

    public ClinicalTrial sites(Set<Site> sites) {
        this.setSites(sites);
        return this;
    }

    public ClinicalTrial addSite(Site site) {
        this.sites.add(site);
        site.getClinicalTrials().add(this);
        return this;
    }

    public ClinicalTrial removeSite(Site site) {
        this.sites.remove(site);
        site.getClinicalTrials().remove(this);
        return this;
    }

    public void setSites(Set<Site> sites) {
        this.sites = sites;
    }

    public Set<Arm> getArms() {
        return this.arms;
    }

    public ClinicalTrial arms(Set<Arm> arms) {
        this.setArms(arms);
        return this;
    }

    public ClinicalTrial addArm(Arm arm) {
        this.arms.add(arm);
        arm.getClinicalTrials().add(this);
        return this;
    }

    public ClinicalTrial removeArm(Arm arm) {
        this.arms.remove(arm);
        arm.getClinicalTrials().remove(this);
        return this;
    }

    public void setArms(Set<Arm> arms) {
        this.arms = arms;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClinicalTrial)) {
            return false;
        }
        return id != null && id.equals(((ClinicalTrial) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClinicalTrial{" +
            "id=" + getId() +
            ", nctId='" + getNctId() + "'" +
            ", phase='" + getPhase() + "'" +
            ", principalInvestigator='" + getPrincipalInvestigator() + "'" +
            ", status='" + getStatus() + "'" +
            ", statusLastUpdated='" + getStatusLastUpdated() + "'" +
            ", briefTitle='" + getBriefTitle() + "'" +
            "}";
    }
}
