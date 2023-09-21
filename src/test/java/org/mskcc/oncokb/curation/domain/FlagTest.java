package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class FlagTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Flag.class);
        Flag flag1 = new Flag();
        flag1.setId(1L);
        Flag flag2 = new Flag();
        flag2.setId(flag1.getId());
        assertThat(flag1).isEqualTo(flag2);
        flag2.setId(2L);
        assertThat(flag1).isNotEqualTo(flag2);
        flag1.setId(null);
        assertThat(flag1).isNotEqualTo(flag2);
    }
}
