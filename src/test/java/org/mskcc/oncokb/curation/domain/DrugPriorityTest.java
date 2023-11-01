package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class DrugPriorityTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DrugPriority.class);
        DrugPriority drugPriority1 = new DrugPriority();
        drugPriority1.setId(1L);
        DrugPriority drugPriority2 = new DrugPriority();
        drugPriority2.setId(drugPriority1.getId());
        assertThat(drugPriority1).isEqualTo(drugPriority2);
        drugPriority2.setId(2L);
        assertThat(drugPriority1).isNotEqualTo(drugPriority2);
        drugPriority1.setId(null);
        assertThat(drugPriority1).isNotEqualTo(drugPriority2);
    }
}
