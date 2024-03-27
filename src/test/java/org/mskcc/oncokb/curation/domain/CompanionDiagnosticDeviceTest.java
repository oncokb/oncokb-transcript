package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class CompanionDiagnosticDeviceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CompanionDiagnosticDevice.class);
        CompanionDiagnosticDevice companionDiagnosticDevice1 = new CompanionDiagnosticDevice();
        companionDiagnosticDevice1.setId(1L);
        CompanionDiagnosticDevice companionDiagnosticDevice2 = new CompanionDiagnosticDevice();
        companionDiagnosticDevice2.setId(companionDiagnosticDevice1.getId());
        assertThat(companionDiagnosticDevice1).isEqualTo(companionDiagnosticDevice2);
        companionDiagnosticDevice2.setId(2L);
        assertThat(companionDiagnosticDevice1).isNotEqualTo(companionDiagnosticDevice2);
        companionDiagnosticDevice1.setId(null);
        assertThat(companionDiagnosticDevice1).isNotEqualTo(companionDiagnosticDevice2);
    }
}
