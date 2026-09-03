package org.mskcc.oncokb.curation.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mskcc.oncokb.curation.util.AlterationUtils.isFusionMissingDoubleColon;
import static org.mskcc.oncokb.curation.util.AlterationUtils.parseProteinChange;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
import org.mskcc.oncokb.curation.domain.EntityStatus;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.util.AlterationUtils;

public class AlterationUtilsTest {

    @Test
    public void testParseFusionNormalizesName() {
        AlterationUtils alterationUtils = new AlterationUtils();

        // the fusion keyword is capitalized and added when it is left out
        assertEquals("BCR::ABL1 Fusion", parseAlterationName(alterationUtils, "BCR::ABL1 Fusion"));
        assertEquals("BCR::ABL1 Fusion", parseAlterationName(alterationUtils, "BCR::ABL1"));
        assertEquals("BCR::ABL1 Fusion", parseAlterationName(alterationUtils, "BCR:: ABL1 fusion"));

        // the gene partner order the curator entered is preserved
        assertEquals("ABL1::BCR Fusion", parseAlterationName(alterationUtils, "ABL1::BCR Fusion"));

        // a hugo symbol containing a hyphen is only readable because the partners are separated by the double colon
        assertEquals("NKX2-1::BRAF Fusion", parseAlterationName(alterationUtils, "NKX2-1::BRAF fusion"));

        // the generic fusion alterations are untouched other than being capitalized
        assertEquals("Fusions", parseAlterationName(alterationUtils, "fusions"));
        assertEquals("Fusion", parseAlterationName(alterationUtils, "FUSION"));
    }

    @Test
    public void testGetGenesStrs() {
        AlterationUtils alterationUtils = new AlterationUtils();

        assertEquals(List.of("BCR", "ABL1"), alterationUtils.getGenesStrs("BCR::ABL1 Fusion"));
        assertEquals(List.of("bcr", "abl1"), alterationUtils.getGenesStrs("bcr::abl1 fusion"));
        // a hugo symbol containing a hyphen is read as one partner
        assertEquals(List.of("HLA-DRB1", "MET"), alterationUtils.getGenesStrs("HLA-DRB1::MET Fusion"));
        assertEquals(List.of("NKX2-1", "BRAF"), alterationUtils.getGenesStrs("NKX2-1::BRAF Fusion"));

        // only the double colon separates the gene partners
        assertEquals(List.of(), alterationUtils.getGenesStrs("BCR-ABL1 Fusion"));
        assertEquals(List.of(), alterationUtils.getGenesStrs("bcr_abl1 fusion"));
        assertEquals(List.of(), alterationUtils.getGenesStrs("Fusions"));
        assertEquals(List.of(), alterationUtils.getGenesStrs("118_153trunc"));
    }

    private String parseAlterationName(AlterationUtils alterationUtils, String alteration) {
        return alterationUtils.parseAlteration(alteration).getEntity().getAlteration();
    }

    @Test
    public void testRevisedProteinChangeInParseProteinChange() {
        EntityStatus<Alteration> status = new AlterationAnnotationStatus();
        parseProteinChange(status, "v600e");
        assertEquals("V600E", status.getEntity().getProteinChange());

        parseProteinChange(status, "*757kext*");
        assertEquals("*757Kext*", status.getEntity().getProteinChange());

        parseProteinChange(status, "T599delinsip");
        assertEquals("T599delinsIP", status.getEntity().getProteinChange());
    }

    @Test
    public void testNormalizeDelDupDelins() {
        EntityStatus<Alteration> status;

        // del with trailing sequence -> strip sequence, warning message returned
        status = new AlterationAnnotationStatus();
        parseProteinChange(status, "C359delC");
        assertEquals("C359del", status.getEntity().getProteinChange());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'C359delC' to 'C359del'", getMessage(status));

        // dup with trailing sequence -> strip sequence, warning message returned
        status = new AlterationAnnotationStatus();
        parseProteinChange(status, "P68_C77dupACGT");
        assertEquals("P68_C77dup", status.getEntity().getProteinChange());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'P68_C77dupACGT' to 'P68_C77dup'", getMessage(status));

        // delSEQinsINS -> delinsINS, warning message returned
        status = new AlterationAnnotationStatus();
        parseProteinChange(status, "T599delACinsIP");
        assertEquals("T599delinsIP", status.getEntity().getProteinChange());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'T599delACinsIP' to 'T599delinsIP'", getMessage(status));

        // already correct forms should be unchanged, no warning
        status = new AlterationAnnotationStatus();
        parseProteinChange(status, "C359del");
        assertEquals("C359del", status.getEntity().getProteinChange());
        assertNull(getMessage(status));

        status = new AlterationAnnotationStatus();
        parseProteinChange(status, "P68_C77dup");
        assertEquals("P68_C77dup", status.getEntity().getProteinChange());
        assertNull(getMessage(status));

        status = new AlterationAnnotationStatus();
        parseProteinChange(status, "T599delinsIP");
        assertEquals("T599delinsIP", status.getEntity().getProteinChange());
        assertNull(getMessage(status));
    }

    @Test
    public void testNormalizeCodingDnaChange() {
        AlterationUtils alterationUtils = new AlterationUtils();
        EntityStatus<Alteration> status;

        // del with trailing sequence -> strip sequence, warning message returned
        status = alterationUtils.parseAlteration("c.4393_4394delAG");
        assertEquals("c.4393_4394del", status.getEntity().getAlteration());
        assertEquals("c.4393_4394del", status.getEntity().getName());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'c.4393_4394delAG' to 'c.4393_4394del'", getMessage(status));

        // dup with trailing sequence -> strip sequence
        status = alterationUtils.parseAlteration("c.4393_4394dupAG");
        assertEquals("c.4393_4394dup", status.getEntity().getAlteration());
        assertTrue(status.isWarning());

        // delSEQinsINS -> delinsINS, the inserted sequence is preserved
        status = alterationUtils.parseAlteration("c.4393_4394delAGinsTT");
        assertEquals("c.4393_4394delinsTT", status.getEntity().getAlteration());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'c.4393_4394delAGinsTT' to 'c.4393_4394delinsTT'", getMessage(status));

        // already correct forms should be unchanged, no warning
        status = alterationUtils.parseAlteration("c.4393_4394del");
        assertEquals("c.4393_4394del", status.getEntity().getAlteration());
        assertTrue(status.isOk());

        status = alterationUtils.parseAlteration("c.4393_4394delinsTT");
        assertEquals("c.4393_4394delinsTT", status.getEntity().getAlteration());
        assertTrue(status.isOk());

        status = alterationUtils.parseAlteration("c.4393_4394dup");
        assertEquals("c.4393_4394dup", status.getEntity().getAlteration());
        assertTrue(status.isOk());
    }

    @Test
    public void testFusionMustUseDoubleColon() {
        AlterationUtils alterationUtils = new AlterationUtils();
        EntityStatus<Alteration> status;

        // a fusion named with a hyphen is rejected and spelled out with the double colon separator
        status = alterationUtils.parseAlteration("BCR-ABL1 Fusion");
        assertTrue(status.isError());
        assertTrue(getMessage(status).contains("Do you mean BCR::ABL1 Fusion?"));

        // an underscore is rejected the same way
        status = alterationUtils.parseAlteration("MAP2K1_SMAD3 fusion");
        assertTrue(status.isError());
        assertTrue(getMessage(status).contains("Do you mean MAP2K1::SMAD3 Fusion?"));

        // a partner section with more than one hyphen cannot be split, so no suggestion is offered
        status = alterationUtils.parseAlteration("NKX2-1-BRAF Fusion");
        assertTrue(status.isError());
        assertFalse(getMessage(status).contains("Do you mean"));

        // the alteration the curator typed is echoed back untouched
        assertEquals("NKX2-1-BRAF Fusion", status.getEntity().getAlteration());

        // the double colon form is parsed, including a hugo symbol that contains a hyphen
        status = alterationUtils.parseAlteration("HLA-DRB1::MET Fusion");
        assertTrue(status.isOk());
        assertEquals("HLA-DRB1::MET Fusion", status.getEntity().getAlteration());
        assertEquals(AlterationType.STRUCTURAL_VARIANT, status.getEntity().getType());

        // an alteration that does not name two gene partners has no separator to check
        assertFalse(isFusionMissingDoubleColon("Fusions"));
        assertFalse(isFusionMissingDoubleColon("NKX2-1 Fusions"));
        assertFalse(isFusionMissingDoubleColon("Intragenic fusion"));
        assertFalse(isFusionMissingDoubleColon("BCR::ABL1 Fusion"));
        assertFalse(isFusionMissingDoubleColon("V600E"));
        // an underscore outside of a fusion name is a protein change position range
        assertFalse(isFusionMissingDoubleColon("118_153trunc"));
    }

    private static String getMessage(EntityStatus<?> status) {
        String joined = String.join("", status.getMessages());
        return joined.isEmpty() ? null : joined;
    }
}
