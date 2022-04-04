package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class DrugSynonymTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DrugSynonym.class);
        DrugSynonym drugSynonym1 = new DrugSynonym();
        drugSynonym1.setId(1L);
        DrugSynonym drugSynonym2 = new DrugSynonym();
        drugSynonym2.setId(drugSynonym1.getId());
        assertThat(drugSynonym1).isEqualTo(drugSynonym2);
        drugSynonym2.setId(2L);
        assertThat(drugSynonym1).isNotEqualTo(drugSynonym2);
        drugSynonym1.setId(null);
        assertThat(drugSynonym1).isNotEqualTo(drugSynonym2);
    }
}
