package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class AssociationCancerTypeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AssociationCancerType.class);
        AssociationCancerType associationCancerType1 = new AssociationCancerType();
        associationCancerType1.setId(1L);
        AssociationCancerType associationCancerType2 = new AssociationCancerType();
        associationCancerType2.setId(associationCancerType1.getId());
        assertThat(associationCancerType1).isEqualTo(associationCancerType2);
        associationCancerType2.setId(2L);
        assertThat(associationCancerType1).isNotEqualTo(associationCancerType2);
        associationCancerType1.setId(null);
        assertThat(associationCancerType1).isNotEqualTo(associationCancerType2);
    }
}
