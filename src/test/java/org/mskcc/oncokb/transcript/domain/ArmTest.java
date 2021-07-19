package org.mskcc.oncokb.transcript.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.transcript.web.rest.TestUtil;

class ArmTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Arm.class);
        Arm arm1 = new Arm();
        arm1.setId(1L);
        Arm arm2 = new Arm();
        arm2.setId(arm1.getId());
        assertThat(arm1).isEqualTo(arm2);
        arm2.setId(2L);
        assertThat(arm1).isNotEqualTo(arm2);
        arm1.setId(null);
        assertThat(arm1).isNotEqualTo(arm2);
    }
}
