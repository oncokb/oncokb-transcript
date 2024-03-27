package org.mskcc.oncokb.curation.domain.enumeration;

/**
 * The FdaSubmissionTypeKey enumeration.
 */
public enum FdaSubmissionTypeKey {
    DEVICE_PMA("P"),
    DEVICE_DENOVO("DEN"),
    DEVICE_HDE("H"),
    DEVICE_PMN("K"),
    DRUG_NDA("NDA"),
    DRUG_BLA("BLA");

    String prefix;

    FdaSubmissionTypeKey(String prefix) {
        this.prefix = prefix;
    }

    public String getPrefix() {
        return this.prefix;
    }

    public static FdaSubmissionTypeKey getTypeByPrefix(String prefix) {
        for (FdaSubmissionTypeKey type : FdaSubmissionTypeKey.values()) {
            if (type.prefix.equalsIgnoreCase(prefix)) {
                return type;
            }
        }
        return null;
    }
}
