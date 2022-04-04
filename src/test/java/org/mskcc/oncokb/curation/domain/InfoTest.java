package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class InfoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Info.class);
        Info info1 = new Info();
        info1.setId(1L);
        Info info2 = new Info();
        info2.setId(info1.getId());
        assertThat(info1).isEqualTo(info2);
        info2.setId(2L);
        assertThat(info1).isNotEqualTo(info2);
        info1.setId(null);
        assertThat(info1).isNotEqualTo(info2);
    }
}
