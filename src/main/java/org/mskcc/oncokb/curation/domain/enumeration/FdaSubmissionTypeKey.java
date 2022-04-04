package org.mskcc.oncokb.curation.domain.enumeration;

/**
 * The FdaSubmissionTypeKey enumeration.
 */
public enum FdaSubmissionTypeKey {
    PMA("P"),
    DE_NOVO("DEN"),
    HDE("H"),
    PMN("K");

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
