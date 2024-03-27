package org.mskcc.oncokb.curation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.RelevantCancerTypeBody;
import org.mskcc.oncokb.curation.domain.RelevantCancerTypeQuery;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.util.enumeration.RelevantCancerTypeDirection;
import org.springframework.beans.factory.annotation.Autowired;

@IntegrationTest
public class CancerTypeServiceIT {

    @Autowired
    private CancerTypeService cancerTypeService;

    @Autowired
    private CancerTypeRepository cancerTypeRepository;

    @Test
    public void testGetRelevantCancerTypesWithoutExcluded() throws Exception {
        RelevantCancerTypeQuery included = new RelevantCancerTypeQuery();
        included.setCode("MCD");
        included.setMainType("Mastocytosis");

        RelevantCancerTypeBody relevantCancerTypeBody = new RelevantCancerTypeBody();
        relevantCancerTypeBody.setRelevantCancerTypeQueries(Arrays.asList(included));

        List<CancerType> cancerTypes = cancerTypeService.getRelevantCancerTypes("Level_1", relevantCancerTypeBody);
        String expectedResult =
            "Mastocytosis, Cutaneous Mastocytosis, Mast Cell Sarcoma, Systemic Mastocytosis, Aggressive Systemic Mastocytosis, Indolent Systemic Mastocytosis, Mast Cell Leukemia, Smoldering Systemic Mastocytosis, Systemic Mastocytosis with an Associated Hematological Neoplasm";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));
    }

    @Test
    public void testGetRelevantCancerTypesWithExcluded() {
        RelevantCancerTypeQuery included = new RelevantCancerTypeQuery();
        included.setCode("MCD");
        included.setMainType("Mastocytosis");
        RelevantCancerTypeQuery excluded = new RelevantCancerTypeQuery();
        excluded.setCode("SM");
        excluded.setMainType("Mastocytosis");

        RelevantCancerTypeBody relevantCancerTypeBody = new RelevantCancerTypeBody();
        relevantCancerTypeBody.setRelevantCancerTypeQueries(Arrays.asList(included));
        relevantCancerTypeBody.setExcludedRelevantCancerTypeQueries(Arrays.asList(excluded));

        List<CancerType> cancerTypes = cancerTypeService.getRelevantCancerTypes("Level_1", relevantCancerTypeBody);
        String expectedResult = "Mastocytosis, Cutaneous Mastocytosis, Mast Cell Sarcoma"; // excluding also excludes main type if the same. Do we want this?
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));
    }

    @Test
    public void testFindCancerTypesWithDirection() throws Exception {
        List<CancerType> cancerTypes = cancerTypeService.findRelevantCancerTypes("CML", false, RelevantCancerTypeDirection.DOWNWARD);
        String expectedResult = "M:All Liquid Tumors, M:All Tumors, Chronic Myelogenous Leukemia, Chronic Myeloid Leukemia, BCR-ABL1+";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        cancerTypes = cancerTypeService.findRelevantCancerTypes("CML", false, RelevantCancerTypeDirection.UPWARD);
        expectedResult =
            "M:All Liquid Tumors, M:All Tumors, M:Myeloproliferative Neoplasms, Myeloproliferative Neoplasms, Chronic Myelogenous Leukemia";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        cancerTypes = cancerTypeService.findRelevantCancerTypes("MEL", false, RelevantCancerTypeDirection.UPWARD);
        expectedResult = "M:All Solid Tumors, M:All Tumors, M:Melanoma, Melanoma";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        cancerTypes = cancerTypeService.findRelevantCancerTypes("MEL", false, RelevantCancerTypeDirection.DOWNWARD);
        expectedResult =
            "M:All Solid Tumors, M:All Tumors, Melanoma, Acral Melanoma, Congenital Nevus, Cutaneous Melanoma, Desmoplastic Melanoma, Lentigo Maligna Melanoma, Melanoma of Unknown Primary, Spitzoid Melanoma";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        cancerTypes = cancerTypeService.findRelevantCancerTypes("Melanoma", true, RelevantCancerTypeDirection.UPWARD);
        expectedResult = "M:All Solid Tumors, M:All Tumors, M:Melanoma";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        cancerTypes = cancerTypeService.findRelevantCancerTypes("Melanoma", true, RelevantCancerTypeDirection.DOWNWARD);
        expectedResult =
            "M:All Solid Tumors, M:All Tumors, M:Melanoma, Anorectal Mucosal Melanoma, Head and Neck Mucosal Melanoma, Melanoma, Mucosal Melanoma of the Esophagus, Mucosal Melanoma of the Urethra, Mucosal Melanoma of the Vulva/Vagina, Ocular Melanoma, Acral Melanoma, Congenital Nevus, Conjunctival Melanoma, Cutaneous Melanoma, Desmoplastic Melanoma, Lentigo Maligna Melanoma, Melanoma of Unknown Primary, Primary CNS Melanoma, Spitzoid Melanoma, Uveal Melanoma";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        // Soft Tissue Sarcoma is a mixed main type
        cancerTypes = cancerTypeService.findRelevantCancerTypes("Soft Tissue Sarcoma", true, RelevantCancerTypeDirection.UPWARD);
        expectedResult = "M:All Tumors, M:Soft Tissue Sarcoma";
        assertEquals(expectedResult, cancerTypesToString(cancerTypes));

        // 863 subtypes, 117 main types, 7 special tumor types
        assertEquals(989, cancerTypeRepository.findAll().size());
    }

    private String cancerTypesToString(List<CancerType> cancerTypes) {
        return cancerTypesToString(cancerTypes, false);
    }

    private String cancerTypesToString(List<CancerType> cancerTypes, Boolean sortAsc) {
        List<String> name = new ArrayList<>();
        for (CancerType cancerType : cancerTypes) {
            name.add(StringUtils.isEmpty(cancerType.getSubtype()) ? ("M:" + cancerType.getMainType()) : cancerType.getSubtype());
        }
        if (sortAsc) {
            Collections.sort(name);
        }
        return org.apache.commons.lang3.StringUtils.join(name, ", ");
    }
}
