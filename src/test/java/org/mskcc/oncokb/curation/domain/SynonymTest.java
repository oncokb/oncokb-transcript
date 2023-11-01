package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class SynonymTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Synonym.class);
        Synonym synonym1 = new Synonym();
        synonym1.setId(1L);
        Synonym synonym2 = new Synonym();
        synonym2.setId(synonym1.getId());
        assertThat(synonym1).isEqualTo(synonym2);
        synonym2.setId(2L);
        assertThat(synonym1).isNotEqualTo(synonym2);
        synonym1.setId(null);
        assertThat(synonym1).isNotEqualTo(synonym2);
    }
}
