package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class FdaDrugTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FdaDrug.class);
        FdaDrug fdaDrug1 = new FdaDrug();
        fdaDrug1.setId(1L);
        FdaDrug fdaDrug2 = new FdaDrug();
        fdaDrug2.setId(fdaDrug1.getId());
        assertThat(fdaDrug1).isEqualTo(fdaDrug2);
        fdaDrug2.setId(2L);
        assertThat(fdaDrug1).isNotEqualTo(fdaDrug2);
        fdaDrug1.setId(null);
        assertThat(fdaDrug1).isNotEqualTo(fdaDrug2);
    }
}
