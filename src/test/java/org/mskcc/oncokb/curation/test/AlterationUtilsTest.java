package org.mskcc.oncokb.curation.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mskcc.oncokb.curation.util.AlterationUtils.parseProteinChange;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
import org.mskcc.oncokb.curation.domain.EntityStatus;

public class AlterationUtilsTest {

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
        EntityStatus<Alteration> status = new AlterationAnnotationStatus();

        // del with trailing sequence -> strip sequence, warning message returned
        parseProteinChange(status, "C359delC");
        assertEquals("C359del", status.getEntity().getProteinChange());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'C359delC' to 'C359del'", status.getMessage());

        // dup with trailing sequence -> strip sequence, warning message returned
        parseProteinChange(status, "P68_C77dupACGT");
        assertEquals("P68_C77dup", status.getEntity().getProteinChange());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'P68_C77dupACGT' to 'P68_C77dup'", status.getMessage());

        // delSEQinsINS -> delinsINS, warning message returned
        parseProteinChange(status, "T599delACinsIP");
        assertEquals("T599delinsIP", status.getEntity().getProteinChange());
        assertTrue(status.isWarning());
        assertEquals("Normalized from 'T599delACinsIP' to 'T599delinsIP'", status.getMessage());

        // already correct forms should be unchanged, no warning
        parseProteinChange(status, "C359del");
        assertEquals("C359del", status.getEntity().getProteinChange());
        assertNull(status.getMessage());

        parseProteinChange(status, "P68_C77dup");
        assertEquals("P68_C77dup", status.getEntity().getProteinChange());
        assertNull(status.getMessage());

        parseProteinChange(status, "T599delinsIP");
        assertEquals("T599delinsIP", status.getEntity().getProteinChange());
        assertNull(status.getMessage());
    }
}
