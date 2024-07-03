package org.mskcc.oncokb.curation.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.Test;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.util.CancerTypeUtils;

public class CancerTypeUtilsTest {

    @Test
    public void testIsSolidTumor() throws Exception {
        CancerType cancerType = new CancerType();

        // null
        assertFalse("Null tissue is solid tumor, but it should not be.", CancerTypeUtils.isSolidTumor(cancerType));

        // Empty
        cancerType.setTissue("");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertFalse("Empty tissue is solid tumor, but it should not be.", CancerTypeUtils.isSolidTumor(cancerType));

        cancerType.setTissue("Blood");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertFalse("Blood tissue is solid tumor, but it should not be.", CancerTypeUtils.isSolidTumor(cancerType));

        cancerType.setTissue("Lymph");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertFalse("Lymph tissue is solid tumor, but it should not be.", CancerTypeUtils.isSolidTumor(cancerType));

        cancerType.setTissue("Eye");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertTrue("Eye tissue is not solid tumor, but it should be.", CancerTypeUtils.isSolidTumor(cancerType));
    }

    // Is liquid tumor is decided on tissue level
    @Test
    public void testIsLiquidTumor() throws Exception {
        CancerType cancerType = new CancerType();

        // null
        assertFalse("Null is liquid tumor, but it should not be.", CancerTypeUtils.isLiquidTumor(cancerType));

        // empty
        cancerType.setTissue("");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertFalse("Empty is liquid tumor, but it should not be.", CancerTypeUtils.isLiquidTumor(cancerType));

        cancerType.setTissue("Skin");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertFalse("Skin tissue is liquid tumor, but it should not be.", CancerTypeUtils.isLiquidTumor(cancerType));

        cancerType.setTissue("Blood");
        cancerType.setTumorForm(CancerTypeUtils.getTumorForm(cancerType.getTissue()));
        assertTrue("Blood tissue is not liquid tumor, but it should be.", CancerTypeUtils.isLiquidTumor(cancerType));
    }

    @Test
    public void testHasSolidTumor() throws Exception {
        Set<CancerType> cancerTypeSet = new HashSet<>();
        CancerType ct1 = new CancerType();
        CancerType ct2 = new CancerType();
        ct1.setId(0L);
        ct1.setId(0L);
        cancerTypeSet.add(ct1);
        cancerTypeSet.add(ct2);

        assertFalse("Empty tumor type set has solid tumor, but it should not.", CancerTypeUtils.hasSolidTumor(cancerTypeSet));

        ct1.setTissue("Eye");
        ct1.setTumorForm(CancerTypeUtils.getTumorForm(ct1.getTissue()));
        assertTrue(
            "Tumor types set does not have solid tumor, but it should because of EYE is solid tumor.",
            CancerTypeUtils.hasSolidTumor(cancerTypeSet)
        );

        ct2.setTissue("Bone");
        ct2.setTumorForm(CancerTypeUtils.getTumorForm(ct2.getTissue()));
        assertTrue(
            "Tumor types set does not have solid tumor, but both tumor types in the set are solid tumor.",
            CancerTypeUtils.hasSolidTumor(cancerTypeSet)
        );

        ct1.setTissue("Blood");
        ct1.setTumorForm(CancerTypeUtils.getTumorForm(ct1.getTissue()));
        ct2.setTissue("Bone");
        ct2.setTumorForm(CancerTypeUtils.getTumorForm(ct2.getTissue()));
        assertTrue(
            "Tumor types set does not have solid tumor, but one of tumor types Bone is solid tumor.",
            CancerTypeUtils.hasSolidTumor(cancerTypeSet)
        );
    }

    @Test
    public void testHasLiquidTumor() throws Exception {
        Set<CancerType> cancerTypeSet = new HashSet<>();
        CancerType ct1 = new CancerType();
        CancerType ct2 = new CancerType();
        ct1.setId(0L);
        ct1.setId(0L);
        cancerTypeSet.add(ct1);
        cancerTypeSet.add(ct2);

        assertFalse("Empty tumor type set has liquid tumor, but it should not have", CancerTypeUtils.hasLiquidTumor(cancerTypeSet));

        ct1.setTissue("Blood");
        ct1.setTumorForm(CancerTypeUtils.getTumorForm(ct1.getTissue()));
        assertTrue(
            "Tumor types set does not have liquid tumor, but one tumor type in the set is liquid tumor.",
            CancerTypeUtils.hasLiquidTumor(cancerTypeSet)
        );

        ct1.setTissue("Blood");
        ct1.setTumorForm(CancerTypeUtils.getTumorForm(ct1.getTissue()));
        ct2.setTissue("Bone");
        ct2.setTumorForm(CancerTypeUtils.getTumorForm(ct2.getTissue()));
        assertTrue(
            "Tumor types set does not have liquid tumor, but one of tumor types Blood is liquid tumor.",
            CancerTypeUtils.hasLiquidTumor(cancerTypeSet)
        );
    }

    @Test
    public void testSortByLevel() {
        CancerType ct1 = new CancerType();
        ct1.setLevel(2);
        ct1.setSubtype("ct1");

        CancerType ct2 = new CancerType();
        ct2.setLevel(1);
        ct2.setSubtype("ct2");

        // Same level, so should sort alphabetically
        CancerType ct3 = new CancerType();
        ct3.setLevel(0);
        ct3.setSubtype("b");

        CancerType ct4 = new CancerType();
        ct4.setLevel(0);
        ct4.setSubtype("c");

        // No subtype, so should sort using maintype
        CancerType ct5 = new CancerType();
        ct5.setLevel(0);
        ct5.setMainType("a");

        List<CancerType> cancerTypes = new ArrayList<>();
        cancerTypes.add(ct1);
        cancerTypes.add(ct2);
        cancerTypes.add(ct3);
        cancerTypes.add(ct4);
        cancerTypes.add(ct5);

        List<CancerType> expectedOutput = new ArrayList<>();
        expectedOutput.add(ct5);
        expectedOutput.add(ct3);
        expectedOutput.add(ct4);
        expectedOutput.add(ct2);
        expectedOutput.add(ct1);

        CancerTypeUtils.sortByLevel(cancerTypes);
        assertEquals(expectedOutput, cancerTypes);
    }
}
