package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class ConsequenceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Consequence.class);
        Consequence consequence1 = new Consequence();
        consequence1.setId(1L);
        Consequence consequence2 = new Consequence();
        consequence2.setId(consequence1.getId());
        assertThat(consequence1).isEqualTo(consequence2);
        consequence2.setId(2L);
        assertThat(consequence1).isNotEqualTo(consequence2);
        consequence1.setId(null);
        assertThat(consequence1).isNotEqualTo(consequence2);
    }
}
