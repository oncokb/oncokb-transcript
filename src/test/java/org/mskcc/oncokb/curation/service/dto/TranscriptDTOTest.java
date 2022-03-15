package org.mskcc.oncokb.curation.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class TranscriptDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(TranscriptDTO.class);
        TranscriptDTO transcriptDTO1 = new TranscriptDTO();
        transcriptDTO1.setId(1L);
        TranscriptDTO transcriptDTO2 = new TranscriptDTO();
        assertThat(transcriptDTO1).isNotEqualTo(transcriptDTO2);
        transcriptDTO2.setId(transcriptDTO1.getId());
        assertThat(transcriptDTO1).isEqualTo(transcriptDTO2);
        transcriptDTO2.setId(2L);
        assertThat(transcriptDTO1).isNotEqualTo(transcriptDTO2);
        transcriptDTO1.setId(null);
        assertThat(transcriptDTO1).isNotEqualTo(transcriptDTO2);
    }
}
