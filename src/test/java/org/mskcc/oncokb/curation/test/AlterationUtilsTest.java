package org.mskcc.oncokb.curation.test;

import static org.junit.Assert.assertEquals;
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
}
