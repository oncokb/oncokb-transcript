package org.mskcc.oncokb.curation.domain.enumeration;

public enum AuditEntity {
    ALTERATION("Alteration"),
    ARTICLE("Article"),
    ASSOCIATION("Association"),
    ASSOCIATION_CANCER_TYPE("AssociationCancerType"),
    AUTHORITY("Authority"),
    CANCER_TYPE("CancerType"),
    CATEGORICAL_ALTERATION("CategoricalAlteration"),
    CLINICAL_TRIAL("ClinicalTrial"),
    CLINICAL_TRIAL_ARM("ClinicalTrialArm"),
    COMPANION_DIAGNOSTIC_DEVICE("CompanionDiagnosticDevice"),
    CONSEQUENCE("Consequence"),
    DRUG("Drug"),
    DRUG_BRAND("DrugBrand"),
    DRUG_PRIORITY("DrugPriority"),
    ELIGIBILITY_CRITERIA("EligibilityCriteria"),
    ENSEMBL_GENE("EnsemblGene"),
    EVIDENCE("Evidence"),
    FDA_DRUG("FdaDrug"),
    FDA_SUBMISSION("FdaSubmission"),
    FDA_SUBMISSION_TYPE("FdaSubmissionType"),
    FLAG("Flag"),
    GENE("Gene"),
    GENOME_FRAGMENT("GenomeFragment"),
    GENOMIC_INDICATOR("GenomicIndicator"),
    INFO("Info"),
    LEVEL_OF_EVIDENCE("LevelOfEvidence"),
    NCI_THESAURUS("NciThesaurus"),
    SEQ_REGION("SeqRegion"),
    SEQUENCE("Sequence"),
    SPECIMEN_TYPE("SpecimenType"),
    SYNONYM("Synonym"),
    TRANSCRIPT("Transcript"),
    TREATMENT("Treatment"),
    TREATMENT_PRIORITY("TreatmentPriority"),
    USER("User");

    private String className;

    AuditEntity(String className) {
        this.className = className;
    }

    public String getClassName() {
        return className;
    }
}
