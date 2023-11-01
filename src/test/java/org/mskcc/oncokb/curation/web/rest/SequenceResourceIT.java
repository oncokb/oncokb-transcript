package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.repository.SequenceRepository;
import org.mskcc.oncokb.curation.service.criteria.SequenceCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link SequenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SequenceResourceIT {

    private static final SequenceType DEFAULT_SEQUENCE_TYPE = SequenceType.PROTEIN;
    private static final SequenceType UPDATED_SEQUENCE_TYPE = SequenceType.CDNA;

    private static final String DEFAULT_SEQUENCE = "AAAAAAAAAA";
    private static final String UPDATED_SEQUENCE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/sequences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private SequenceRepository sequenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSequenceMockMvc;

    private Sequence sequence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sequence createEntity(EntityManager em) {
        Sequence sequence = new Sequence().sequenceType(DEFAULT_SEQUENCE_TYPE).sequence(DEFAULT_SEQUENCE);
        return sequence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sequence createUpdatedEntity(EntityManager em) {
        Sequence sequence = new Sequence().sequenceType(UPDATED_SEQUENCE_TYPE).sequence(UPDATED_SEQUENCE);
        return sequence;
    }

    @BeforeEach
    public void initTest() {
        sequence = createEntity(em);
    }

    @Test
    @Transactional
    void createSequence() throws Exception {
        int databaseSizeBeforeCreate = sequenceRepository.findAll().size();
        // Create the Sequence
        restSequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isCreated());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeCreate + 1);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(DEFAULT_SEQUENCE_TYPE);
        assertThat(testSequence.getSequence()).isEqualTo(DEFAULT_SEQUENCE);
    }

    @Test
    @Transactional
    void createSequenceWithExistingId() throws Exception {
        // Create the Sequence with an existing ID
        sequence.setId(1L);

        int databaseSizeBeforeCreate = sequenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSequenceTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = sequenceRepository.findAll().size();
        // set the field null
        sequence.setSequenceType(null);

        // Create the Sequence, which fails.

        restSequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isBadRequest());

        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSequences() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList
        restSequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(sequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].sequenceType").value(hasItem(DEFAULT_SEQUENCE_TYPE.toString())))
            .andExpect(jsonPath("$.[*].sequence").value(hasItem(DEFAULT_SEQUENCE.toString())));
    }

    @Test
    @Transactional
    void getSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get the sequence
        restSequenceMockMvc
            .perform(get(ENTITY_API_URL_ID, sequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(sequence.getId().intValue()))
            .andExpect(jsonPath("$.sequenceType").value(DEFAULT_SEQUENCE_TYPE.toString()))
            .andExpect(jsonPath("$.sequence").value(DEFAULT_SEQUENCE.toString()));
    }

    @Test
    @Transactional
    void getSequencesByIdFiltering() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        Long id = sequence.getId();

        defaultSequenceShouldBeFound("id.equals=" + id);
        defaultSequenceShouldNotBeFound("id.notEquals=" + id);

        defaultSequenceShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultSequenceShouldNotBeFound("id.greaterThan=" + id);

        defaultSequenceShouldBeFound("id.lessThanOrEqual=" + id);
        defaultSequenceShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllSequencesBySequenceTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList where sequenceType equals to DEFAULT_SEQUENCE_TYPE
        defaultSequenceShouldBeFound("sequenceType.equals=" + DEFAULT_SEQUENCE_TYPE);

        // Get all the sequenceList where sequenceType equals to UPDATED_SEQUENCE_TYPE
        defaultSequenceShouldNotBeFound("sequenceType.equals=" + UPDATED_SEQUENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllSequencesBySequenceTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList where sequenceType not equals to DEFAULT_SEQUENCE_TYPE
        defaultSequenceShouldNotBeFound("sequenceType.notEquals=" + DEFAULT_SEQUENCE_TYPE);

        // Get all the sequenceList where sequenceType not equals to UPDATED_SEQUENCE_TYPE
        defaultSequenceShouldBeFound("sequenceType.notEquals=" + UPDATED_SEQUENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllSequencesBySequenceTypeIsInShouldWork() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList where sequenceType in DEFAULT_SEQUENCE_TYPE or UPDATED_SEQUENCE_TYPE
        defaultSequenceShouldBeFound("sequenceType.in=" + DEFAULT_SEQUENCE_TYPE + "," + UPDATED_SEQUENCE_TYPE);

        // Get all the sequenceList where sequenceType equals to UPDATED_SEQUENCE_TYPE
        defaultSequenceShouldNotBeFound("sequenceType.in=" + UPDATED_SEQUENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllSequencesBySequenceTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList where sequenceType is not null
        defaultSequenceShouldBeFound("sequenceType.specified=true");

        // Get all the sequenceList where sequenceType is null
        defaultSequenceShouldNotBeFound("sequenceType.specified=false");
    }

    @Test
    @Transactional
    void getAllSequencesByTranscriptIsEqualToSomething() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);
        Transcript transcript;
        if (TestUtil.findAll(em, Transcript.class).isEmpty()) {
            transcript = TranscriptResourceIT.createEntity(em);
            em.persist(transcript);
            em.flush();
        } else {
            transcript = TestUtil.findAll(em, Transcript.class).get(0);
        }
        em.persist(transcript);
        em.flush();
        sequence.setTranscript(transcript);
        sequenceRepository.saveAndFlush(sequence);
        Long transcriptId = transcript.getId();

        // Get all the sequenceList where transcript equals to transcriptId
        defaultSequenceShouldBeFound("transcriptId.equals=" + transcriptId);

        // Get all the sequenceList where transcript equals to (transcriptId + 1)
        defaultSequenceShouldNotBeFound("transcriptId.equals=" + (transcriptId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultSequenceShouldBeFound(String filter) throws Exception {
        restSequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(sequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].sequenceType").value(hasItem(DEFAULT_SEQUENCE_TYPE.toString())))
            .andExpect(jsonPath("$.[*].sequence").value(hasItem(DEFAULT_SEQUENCE.toString())));

        // Check, that the count call also returns 1
        restSequenceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultSequenceShouldNotBeFound(String filter) throws Exception {
        restSequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restSequenceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingSequence() throws Exception {
        // Get the sequence
        restSequenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence
        Sequence updatedSequence = sequenceRepository.findById(sequence.getId()).get();
        // Disconnect from session so that the updates on updatedSequence are not directly saved in db
        em.detach(updatedSequence);
        updatedSequence.sequenceType(UPDATED_SEQUENCE_TYPE).sequence(UPDATED_SEQUENCE);

        restSequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedSequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(UPDATED_SEQUENCE_TYPE);
        assertThat(testSequence.getSequence()).isEqualTo(UPDATED_SEQUENCE);
    }

    @Test
    @Transactional
    void putNonExistingSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();
        sequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, sequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();
        sequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();
        sequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSequenceWithPatch() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence using partial update
        Sequence partialUpdatedSequence = new Sequence();
        partialUpdatedSequence.setId(sequence.getId());

        partialUpdatedSequence.sequenceType(UPDATED_SEQUENCE_TYPE);

        restSequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(UPDATED_SEQUENCE_TYPE);
        assertThat(testSequence.getSequence()).isEqualTo(DEFAULT_SEQUENCE);
    }

    @Test
    @Transactional
    void fullUpdateSequenceWithPatch() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence using partial update
        Sequence partialUpdatedSequence = new Sequence();
        partialUpdatedSequence.setId(sequence.getId());

        partialUpdatedSequence.sequenceType(UPDATED_SEQUENCE_TYPE).sequence(UPDATED_SEQUENCE);

        restSequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(UPDATED_SEQUENCE_TYPE);
        assertThat(testSequence.getSequence()).isEqualTo(UPDATED_SEQUENCE);
    }

    @Test
    @Transactional
    void patchNonExistingSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();
        sequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, sequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();
        sequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();
        sequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(sequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeDelete = sequenceRepository.findAll().size();

        // Delete the sequence
        restSequenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, sequence.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
