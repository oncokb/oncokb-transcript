package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class DrugBrandTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DrugBrand.class);
        DrugBrand drugBrand1 = new DrugBrand();
        drugBrand1.setId(1L);
        DrugBrand drugBrand2 = new DrugBrand();
        drugBrand2.setId(drugBrand1.getId());
        assertThat(drugBrand1).isEqualTo(drugBrand2);
        drugBrand2.setId(2L);
        assertThat(drugBrand1).isNotEqualTo(drugBrand2);
        drugBrand1.setId(null);
        assertThat(drugBrand1).isNotEqualTo(drugBrand2);
    }
}
