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
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.mskcc.oncokb.curation.repository.SeqRegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link SeqRegionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SeqRegionResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_CHROMOSOME = "AAAAAAAAAA";
    private static final String UPDATED_CHROMOSOME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/seq-regions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private SeqRegionRepository seqRegionRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSeqRegionMockMvc;

    private SeqRegion seqRegion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SeqRegion createEntity(EntityManager em) {
        SeqRegion seqRegion = new SeqRegion().name(DEFAULT_NAME).chromosome(DEFAULT_CHROMOSOME).description(DEFAULT_DESCRIPTION);
        return seqRegion;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SeqRegion createUpdatedEntity(EntityManager em) {
        SeqRegion seqRegion = new SeqRegion().name(UPDATED_NAME).chromosome(UPDATED_CHROMOSOME).description(UPDATED_DESCRIPTION);
        return seqRegion;
    }

    @BeforeEach
    public void initTest() {
        seqRegion = createEntity(em);
    }

    @Test
    @Transactional
    void createSeqRegion() throws Exception {
        int databaseSizeBeforeCreate = seqRegionRepository.findAll().size();
        // Create the SeqRegion
        restSeqRegionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isCreated());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeCreate + 1);
        SeqRegion testSeqRegion = seqRegionList.get(seqRegionList.size() - 1);
        assertThat(testSeqRegion.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSeqRegion.getChromosome()).isEqualTo(DEFAULT_CHROMOSOME);
        assertThat(testSeqRegion.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createSeqRegionWithExistingId() throws Exception {
        // Create the SeqRegion with an existing ID
        seqRegion.setId(1L);

        int databaseSizeBeforeCreate = seqRegionRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSeqRegionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = seqRegionRepository.findAll().size();
        // set the field null
        seqRegion.setName(null);

        // Create the SeqRegion, which fails.

        restSeqRegionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isBadRequest());

        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSeqRegions() throws Exception {
        // Initialize the database
        seqRegionRepository.saveAndFlush(seqRegion);

        // Get all the seqRegionList
        restSeqRegionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(seqRegion.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].chromosome").value(hasItem(DEFAULT_CHROMOSOME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    void getSeqRegion() throws Exception {
        // Initialize the database
        seqRegionRepository.saveAndFlush(seqRegion);

        // Get the seqRegion
        restSeqRegionMockMvc
            .perform(get(ENTITY_API_URL_ID, seqRegion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(seqRegion.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.chromosome").value(DEFAULT_CHROMOSOME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingSeqRegion() throws Exception {
        // Get the seqRegion
        restSeqRegionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewSeqRegion() throws Exception {
        // Initialize the database
        seqRegionRepository.saveAndFlush(seqRegion);

        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();

        // Update the seqRegion
        SeqRegion updatedSeqRegion = seqRegionRepository.findById(seqRegion.getId()).get();
        // Disconnect from session so that the updates on updatedSeqRegion are not directly saved in db
        em.detach(updatedSeqRegion);
        updatedSeqRegion.name(UPDATED_NAME).chromosome(UPDATED_CHROMOSOME).description(UPDATED_DESCRIPTION);

        restSeqRegionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedSeqRegion.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedSeqRegion))
            )
            .andExpect(status().isOk());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
        SeqRegion testSeqRegion = seqRegionList.get(seqRegionList.size() - 1);
        assertThat(testSeqRegion.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSeqRegion.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testSeqRegion.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingSeqRegion() throws Exception {
        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();
        seqRegion.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSeqRegionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, seqRegion.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSeqRegion() throws Exception {
        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();
        seqRegion.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeqRegionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSeqRegion() throws Exception {
        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();
        seqRegion.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeqRegionMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSeqRegionWithPatch() throws Exception {
        // Initialize the database
        seqRegionRepository.saveAndFlush(seqRegion);

        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();

        // Update the seqRegion using partial update
        SeqRegion partialUpdatedSeqRegion = new SeqRegion();
        partialUpdatedSeqRegion.setId(seqRegion.getId());

        partialUpdatedSeqRegion.chromosome(UPDATED_CHROMOSOME).description(UPDATED_DESCRIPTION);

        restSeqRegionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSeqRegion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSeqRegion))
            )
            .andExpect(status().isOk());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
        SeqRegion testSeqRegion = seqRegionList.get(seqRegionList.size() - 1);
        assertThat(testSeqRegion.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSeqRegion.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testSeqRegion.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateSeqRegionWithPatch() throws Exception {
        // Initialize the database
        seqRegionRepository.saveAndFlush(seqRegion);

        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();

        // Update the seqRegion using partial update
        SeqRegion partialUpdatedSeqRegion = new SeqRegion();
        partialUpdatedSeqRegion.setId(seqRegion.getId());

        partialUpdatedSeqRegion.name(UPDATED_NAME).chromosome(UPDATED_CHROMOSOME).description(UPDATED_DESCRIPTION);

        restSeqRegionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSeqRegion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSeqRegion))
            )
            .andExpect(status().isOk());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
        SeqRegion testSeqRegion = seqRegionList.get(seqRegionList.size() - 1);
        assertThat(testSeqRegion.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSeqRegion.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testSeqRegion.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingSeqRegion() throws Exception {
        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();
        seqRegion.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSeqRegionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, seqRegion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSeqRegion() throws Exception {
        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();
        seqRegion.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeqRegionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSeqRegion() throws Exception {
        int databaseSizeBeforeUpdate = seqRegionRepository.findAll().size();
        seqRegion.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeqRegionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(seqRegion))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SeqRegion in the database
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSeqRegion() throws Exception {
        // Initialize the database
        seqRegionRepository.saveAndFlush(seqRegion);

        int databaseSizeBeforeDelete = seqRegionRepository.findAll().size();

        // Delete the seqRegion
        restSeqRegionMockMvc
            .perform(delete(ENTITY_API_URL_ID, seqRegion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<SeqRegion> seqRegionList = seqRegionRepository.findAll();
        assertThat(seqRegionList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
