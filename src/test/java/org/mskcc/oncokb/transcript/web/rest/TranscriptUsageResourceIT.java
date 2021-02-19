package org.mskcc.oncokb.transcript.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.transcript.IntegrationTest;
import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.mskcc.oncokb.transcript.domain.enumeration.UsageSource;
import org.mskcc.oncokb.transcript.repository.TranscriptUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TranscriptUsageResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TranscriptUsageResourceIT {

    private static final UsageSource DEFAULT_SOURCE = UsageSource.ONCOKB;
    private static final UsageSource UPDATED_SOURCE = UsageSource.ONCOKB;

    @Autowired
    private TranscriptUsageRepository transcriptUsageRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTranscriptUsageMockMvc;

    private TranscriptUsage transcriptUsage;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TranscriptUsage createEntity(EntityManager em) {
        TranscriptUsage transcriptUsage = new TranscriptUsage().source(DEFAULT_SOURCE);
        return transcriptUsage;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TranscriptUsage createUpdatedEntity(EntityManager em) {
        TranscriptUsage transcriptUsage = new TranscriptUsage().source(UPDATED_SOURCE);
        return transcriptUsage;
    }

    @BeforeEach
    public void initTest() {
        transcriptUsage = createEntity(em);
    }

    @Test
    @Transactional
    void createTranscriptUsage() throws Exception {
        int databaseSizeBeforeCreate = transcriptUsageRepository.findAll().size();
        // Create the TranscriptUsage
        restTranscriptUsageMockMvc
            .perform(
                post("/api/transcript-usages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptUsage))
            )
            .andExpect(status().isCreated());

        // Validate the TranscriptUsage in the database
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeCreate + 1);
        TranscriptUsage testTranscriptUsage = transcriptUsageList.get(transcriptUsageList.size() - 1);
        assertThat(testTranscriptUsage.getSource()).isEqualTo(DEFAULT_SOURCE);
    }

    @Test
    @Transactional
    void createTranscriptUsageWithExistingId() throws Exception {
        // Create the TranscriptUsage with an existing ID
        transcriptUsage.setId(1L);

        int databaseSizeBeforeCreate = transcriptUsageRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTranscriptUsageMockMvc
            .perform(
                post("/api/transcript-usages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptUsage))
            )
            .andExpect(status().isBadRequest());

        // Validate the TranscriptUsage in the database
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllTranscriptUsages() throws Exception {
        // Initialize the database
        transcriptUsageRepository.saveAndFlush(transcriptUsage);

        // Get all the transcriptUsageList
        restTranscriptUsageMockMvc
            .perform(get("/api/transcript-usages?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(transcriptUsage.getId().intValue())))
            .andExpect(jsonPath("$.[*].source").value(hasItem(DEFAULT_SOURCE.toString())));
    }

    @Test
    @Transactional
    void getTranscriptUsage() throws Exception {
        // Initialize the database
        transcriptUsageRepository.saveAndFlush(transcriptUsage);

        // Get the transcriptUsage
        restTranscriptUsageMockMvc
            .perform(get("/api/transcript-usages/{id}", transcriptUsage.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(transcriptUsage.getId().intValue()))
            .andExpect(jsonPath("$.source").value(DEFAULT_SOURCE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingTranscriptUsage() throws Exception {
        // Get the transcriptUsage
        restTranscriptUsageMockMvc.perform(get("/api/transcript-usages/{id}", Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void updateTranscriptUsage() throws Exception {
        // Initialize the database
        transcriptUsageRepository.saveAndFlush(transcriptUsage);

        int databaseSizeBeforeUpdate = transcriptUsageRepository.findAll().size();

        // Update the transcriptUsage
        TranscriptUsage updatedTranscriptUsage = transcriptUsageRepository.findById(transcriptUsage.getId()).get();
        // Disconnect from session so that the updates on updatedTranscriptUsage are not directly saved in db
        em.detach(updatedTranscriptUsage);
        updatedTranscriptUsage.source(UPDATED_SOURCE);

        restTranscriptUsageMockMvc
            .perform(
                put("/api/transcript-usages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedTranscriptUsage))
            )
            .andExpect(status().isOk());

        // Validate the TranscriptUsage in the database
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeUpdate);
        TranscriptUsage testTranscriptUsage = transcriptUsageList.get(transcriptUsageList.size() - 1);
        assertThat(testTranscriptUsage.getSource()).isEqualTo(UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void updateNonExistingTranscriptUsage() throws Exception {
        int databaseSizeBeforeUpdate = transcriptUsageRepository.findAll().size();

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTranscriptUsageMockMvc
            .perform(
                put("/api/transcript-usages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptUsage))
            )
            .andExpect(status().isBadRequest());

        // Validate the TranscriptUsage in the database
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTranscriptUsageWithPatch() throws Exception {
        // Initialize the database
        transcriptUsageRepository.saveAndFlush(transcriptUsage);

        int databaseSizeBeforeUpdate = transcriptUsageRepository.findAll().size();

        // Update the transcriptUsage using partial update
        TranscriptUsage partialUpdatedTranscriptUsage = new TranscriptUsage();
        partialUpdatedTranscriptUsage.setId(transcriptUsage.getId());

        restTranscriptUsageMockMvc
            .perform(
                patch("/api/transcript-usages")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTranscriptUsage))
            )
            .andExpect(status().isOk());

        // Validate the TranscriptUsage in the database
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeUpdate);
        TranscriptUsage testTranscriptUsage = transcriptUsageList.get(transcriptUsageList.size() - 1);
        assertThat(testTranscriptUsage.getSource()).isEqualTo(DEFAULT_SOURCE);
    }

    @Test
    @Transactional
    void fullUpdateTranscriptUsageWithPatch() throws Exception {
        // Initialize the database
        transcriptUsageRepository.saveAndFlush(transcriptUsage);

        int databaseSizeBeforeUpdate = transcriptUsageRepository.findAll().size();

        // Update the transcriptUsage using partial update
        TranscriptUsage partialUpdatedTranscriptUsage = new TranscriptUsage();
        partialUpdatedTranscriptUsage.setId(transcriptUsage.getId());

        partialUpdatedTranscriptUsage.source(UPDATED_SOURCE);

        restTranscriptUsageMockMvc
            .perform(
                patch("/api/transcript-usages")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTranscriptUsage))
            )
            .andExpect(status().isOk());

        // Validate the TranscriptUsage in the database
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeUpdate);
        TranscriptUsage testTranscriptUsage = transcriptUsageList.get(transcriptUsageList.size() - 1);
        assertThat(testTranscriptUsage.getSource()).isEqualTo(UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void partialUpdateTranscriptUsageShouldThrown() throws Exception {
        // Update the transcriptUsage without id should throw
        TranscriptUsage partialUpdatedTranscriptUsage = new TranscriptUsage();

        restTranscriptUsageMockMvc
            .perform(
                patch("/api/transcript-usages")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTranscriptUsage))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    void deleteTranscriptUsage() throws Exception {
        // Initialize the database
        transcriptUsageRepository.saveAndFlush(transcriptUsage);

        int databaseSizeBeforeDelete = transcriptUsageRepository.findAll().size();

        // Delete the transcriptUsage
        restTranscriptUsageMockMvc
            .perform(delete("/api/transcript-usages/{id}", transcriptUsage.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<TranscriptUsage> transcriptUsageList = transcriptUsageRepository.findAll();
        assertThat(transcriptUsageList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
