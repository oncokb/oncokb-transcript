package org.mskcc.cbio.web.rest;

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
import org.mskcc.cbio.IntegrationTest;
import org.mskcc.cbio.domain.Sequence;
import org.mskcc.cbio.domain.enumeration.SequenceType;
import org.mskcc.cbio.repository.SequenceRepository;
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

    private static final String DEFAULT_SEQUENE = "AAAAAAAAAA";
    private static final String UPDATED_SEQUENE = "BBBBBBBBBB";

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
        Sequence sequence = new Sequence().sequenceType(DEFAULT_SEQUENCE_TYPE).sequene(DEFAULT_SEQUENE);
        return sequence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sequence createUpdatedEntity(EntityManager em) {
        Sequence sequence = new Sequence().sequenceType(UPDATED_SEQUENCE_TYPE).sequene(UPDATED_SEQUENE);
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
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isCreated());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeCreate + 1);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(DEFAULT_SEQUENCE_TYPE);
        assertThat(testSequence.getSequene()).isEqualTo(DEFAULT_SEQUENE);
    }

    @Test
    @Transactional
    void createSequenceWithExistingId() throws Exception {
        // Create the Sequence with an existing ID
        sequence.setId(1L);

        int databaseSizeBeforeCreate = sequenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSequenceMockMvc
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllSequences() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList
        restSequenceMockMvc
            .perform(get("/api/sequences?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(sequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].sequenceType").value(hasItem(DEFAULT_SEQUENCE_TYPE.toString())))
            .andExpect(jsonPath("$.[*].sequene").value(hasItem(DEFAULT_SEQUENE.toString())));
    }

    @Test
    @Transactional
    void getSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get the sequence
        restSequenceMockMvc
            .perform(get("/api/sequences/{id}", sequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(sequence.getId().intValue()))
            .andExpect(jsonPath("$.sequenceType").value(DEFAULT_SEQUENCE_TYPE.toString()))
            .andExpect(jsonPath("$.sequene").value(DEFAULT_SEQUENE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingSequence() throws Exception {
        // Get the sequence
        restSequenceMockMvc.perform(get("/api/sequences/{id}", Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void updateSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence
        Sequence updatedSequence = sequenceRepository.findById(sequence.getId()).get();
        // Disconnect from session so that the updates on updatedSequence are not directly saved in db
        em.detach(updatedSequence);
        updatedSequence.sequenceType(UPDATED_SEQUENCE_TYPE).sequene(UPDATED_SEQUENE);

        restSequenceMockMvc
            .perform(
                put("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(updatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(UPDATED_SEQUENCE_TYPE);
        assertThat(testSequence.getSequene()).isEqualTo(UPDATED_SEQUENE);
    }

    @Test
    @Transactional
    void updateNonExistingSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(put("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

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

        partialUpdatedSequence.sequene(UPDATED_SEQUENE);

        restSequenceMockMvc
            .perform(
                patch("/api/sequences")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(DEFAULT_SEQUENCE_TYPE);
        assertThat(testSequence.getSequene()).isEqualTo(UPDATED_SEQUENE);
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

        partialUpdatedSequence.sequenceType(UPDATED_SEQUENCE_TYPE).sequene(UPDATED_SEQUENE);

        restSequenceMockMvc
            .perform(
                patch("/api/sequences")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getSequenceType()).isEqualTo(UPDATED_SEQUENCE_TYPE);
        assertThat(testSequence.getSequene()).isEqualTo(UPDATED_SEQUENE);
    }

    @Test
    @Transactional
    void partialUpdateSequenceShouldThrown() throws Exception {
        // Update the sequence without id should throw
        Sequence partialUpdatedSequence = new Sequence();

        restSequenceMockMvc
            .perform(
                patch("/api/sequences")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    void deleteSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeDelete = sequenceRepository.findAll().size();

        // Delete the sequence
        restSequenceMockMvc
            .perform(delete("/api/sequences/{id}", sequence.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
