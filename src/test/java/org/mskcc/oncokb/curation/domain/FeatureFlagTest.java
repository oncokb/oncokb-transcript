package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class FeatureFlagTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FeatureFlag.class);
        FeatureFlag featureFlag1 = new FeatureFlag();
        featureFlag1.setId(1L);
        FeatureFlag featureFlag2 = new FeatureFlag();
        featureFlag2.setId(featureFlag1.getId());
        assertThat(featureFlag1).isEqualTo(featureFlag2);
        featureFlag2.setId(2L);
        assertThat(featureFlag1).isNotEqualTo(featureFlag2);
        featureFlag1.setId(null);
        assertThat(featureFlag1).isNotEqualTo(featureFlag2);
    }
}
