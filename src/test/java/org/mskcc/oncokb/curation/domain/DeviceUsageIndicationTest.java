package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class DeviceUsageIndicationTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DeviceUsageIndication.class);
        DeviceUsageIndication deviceUsageIndication1 = new DeviceUsageIndication();
        deviceUsageIndication1.setId(1L);
        DeviceUsageIndication deviceUsageIndication2 = new DeviceUsageIndication();
        deviceUsageIndication2.setId(deviceUsageIndication1.getId());
        assertThat(deviceUsageIndication1).isEqualTo(deviceUsageIndication2);
        deviceUsageIndication2.setId(2L);
        assertThat(deviceUsageIndication1).isNotEqualTo(deviceUsageIndication2);
        deviceUsageIndication1.setId(null);
        assertThat(deviceUsageIndication1).isNotEqualTo(deviceUsageIndication2);
    }
}
