package org.mskcc.oncokb.curation.util.enumeration;

import java.util.HashMap;
import java.util.Map;

public enum SpecialCancerType {
    ALL_TUMORS("All Tumors"),
    ALL_LIQUID_TUMORS("All Liquid Tumors"),
    ALL_SOLID_TUMORS("All Solid Tumors"),
    GERMLINE_DISPOSITION("Germline Disposition"),
    OTHER_TUMOR_TYPES("Other Tumor Types"),
    OTHER_SOLID_TUMOR_TYPES("Other Solid Tumor Types"),
    OTHER_LIQUID_TUMOR_TYPES("Other Liquid Tumor Types");

    private SpecialCancerType(String tumorType) {
        this.tumorType = tumorType;
    }

    private final String tumorType;

    public String getTumorType() {
        return tumorType;
    }

    private static final Map<String, SpecialCancerType> map = new HashMap<>();

    static {
        for (SpecialCancerType specialTumorType : SpecialCancerType.values()) {
            map.put(specialTumorType.name().toLowerCase(), specialTumorType);
            map.put(specialTumorType.getTumorType().toLowerCase(), specialTumorType);
        }
    }

    public static SpecialCancerType getByTumorType(String tumorType) {
        if (tumorType == null) return null;
        return map.get(tumorType.toLowerCase());
    }
}
