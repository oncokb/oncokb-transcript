package org.mskcc.oncokb.curation.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapperImpl;

class TranscriptMapperTest {

    private TranscriptMapper transcriptMapper;

    @BeforeEach
    public void setUp() {
        transcriptMapper = new TranscriptMapperImpl();
    }
}
