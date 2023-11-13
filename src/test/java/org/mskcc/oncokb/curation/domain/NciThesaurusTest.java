package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class NciThesaurusTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(NciThesaurus.class);
        NciThesaurus nciThesaurus1 = new NciThesaurus();
        nciThesaurus1.setId(1L);
        NciThesaurus nciThesaurus2 = new NciThesaurus();
        nciThesaurus2.setId(nciThesaurus1.getId());
        assertThat(nciThesaurus1).isEqualTo(nciThesaurus2);
        nciThesaurus2.setId(2L);
        assertThat(nciThesaurus1).isNotEqualTo(nciThesaurus2);
        nciThesaurus1.setId(null);
        assertThat(nciThesaurus1).isNotEqualTo(nciThesaurus2);
    }
}
