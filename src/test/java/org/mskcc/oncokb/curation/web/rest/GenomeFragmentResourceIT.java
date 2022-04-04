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
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;
import org.mskcc.oncokb.curation.repository.GenomeFragmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link GenomeFragmentResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class GenomeFragmentResourceIT {

    private static final String DEFAULT_CHROMOSOME = "AAAAAAAAAA";
    private static final String UPDATED_CHROMOSOME = "BBBBBBBBBB";

    private static final Integer DEFAULT_START = 1;
    private static final Integer UPDATED_START = 2;

    private static final Integer DEFAULT_END = 1;
    private static final Integer UPDATED_END = 2;

    private static final Integer DEFAULT_STRAND = 1;
    private static final Integer UPDATED_STRAND = 2;

    private static final GenomeFragmentType DEFAULT_TYPE = GenomeFragmentType.GENE;
    private static final GenomeFragmentType UPDATED_TYPE = GenomeFragmentType.EXON;

    private static final String ENTITY_API_URL = "/api/genome-fragments";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private GenomeFragmentRepository genomeFragmentRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGenomeFragmentMockMvc;

    private GenomeFragment genomeFragment;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GenomeFragment createEntity(EntityManager em) {
        GenomeFragment genomeFragment = new GenomeFragment()
            .chromosome(DEFAULT_CHROMOSOME)
            .start(DEFAULT_START)
            .end(DEFAULT_END)
            .strand(DEFAULT_STRAND)
            .type(DEFAULT_TYPE);
        return genomeFragment;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GenomeFragment createUpdatedEntity(EntityManager em) {
        GenomeFragment genomeFragment = new GenomeFragment()
            .chromosome(UPDATED_CHROMOSOME)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .strand(UPDATED_STRAND)
            .type(UPDATED_TYPE);
        return genomeFragment;
    }

    @BeforeEach
    public void initTest() {
        genomeFragment = createEntity(em);
    }

    @Test
    @Transactional
    void createGenomeFragment() throws Exception {
        int databaseSizeBeforeCreate = genomeFragmentRepository.findAll().size();
        // Create the GenomeFragment
        restGenomeFragmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isCreated());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeCreate + 1);
        GenomeFragment testGenomeFragment = genomeFragmentList.get(genomeFragmentList.size() - 1);
        assertThat(testGenomeFragment.getChromosome()).isEqualTo(DEFAULT_CHROMOSOME);
        assertThat(testGenomeFragment.getStart()).isEqualTo(DEFAULT_START);
        assertThat(testGenomeFragment.getEnd()).isEqualTo(DEFAULT_END);
        assertThat(testGenomeFragment.getStrand()).isEqualTo(DEFAULT_STRAND);
        assertThat(testGenomeFragment.getType()).isEqualTo(DEFAULT_TYPE);
    }

    @Test
    @Transactional
    void createGenomeFragmentWithExistingId() throws Exception {
        // Create the GenomeFragment with an existing ID
        genomeFragment.setId(1L);

        int databaseSizeBeforeCreate = genomeFragmentRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGenomeFragmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllGenomeFragments() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList
        restGenomeFragmentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(genomeFragment.getId().intValue())))
            .andExpect(jsonPath("$.[*].chromosome").value(hasItem(DEFAULT_CHROMOSOME)))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START)))
            .andExpect(jsonPath("$.[*].end").value(hasItem(DEFAULT_END)))
            .andExpect(jsonPath("$.[*].strand").value(hasItem(DEFAULT_STRAND)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())));
    }

    @Test
    @Transactional
    void getGenomeFragment() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get the genomeFragment
        restGenomeFragmentMockMvc
            .perform(get(ENTITY_API_URL_ID, genomeFragment.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(genomeFragment.getId().intValue()))
            .andExpect(jsonPath("$.chromosome").value(DEFAULT_CHROMOSOME))
            .andExpect(jsonPath("$.start").value(DEFAULT_START))
            .andExpect(jsonPath("$.end").value(DEFAULT_END))
            .andExpect(jsonPath("$.strand").value(DEFAULT_STRAND))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingGenomeFragment() throws Exception {
        // Get the genomeFragment
        restGenomeFragmentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewGenomeFragment() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();

        // Update the genomeFragment
        GenomeFragment updatedGenomeFragment = genomeFragmentRepository.findById(genomeFragment.getId()).get();
        // Disconnect from session so that the updates on updatedGenomeFragment are not directly saved in db
        em.detach(updatedGenomeFragment);
        updatedGenomeFragment
            .chromosome(UPDATED_CHROMOSOME)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .strand(UPDATED_STRAND)
            .type(UPDATED_TYPE);

        restGenomeFragmentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGenomeFragment.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedGenomeFragment))
            )
            .andExpect(status().isOk());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
        GenomeFragment testGenomeFragment = genomeFragmentList.get(genomeFragmentList.size() - 1);
        assertThat(testGenomeFragment.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testGenomeFragment.getStart()).isEqualTo(UPDATED_START);
        assertThat(testGenomeFragment.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testGenomeFragment.getStrand()).isEqualTo(UPDATED_STRAND);
        assertThat(testGenomeFragment.getType()).isEqualTo(UPDATED_TYPE);
    }

    @Test
    @Transactional
    void putNonExistingGenomeFragment() throws Exception {
        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();
        genomeFragment.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGenomeFragmentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, genomeFragment.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGenomeFragment() throws Exception {
        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();
        genomeFragment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomeFragmentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGenomeFragment() throws Exception {
        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();
        genomeFragment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomeFragmentMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGenomeFragmentWithPatch() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();

        // Update the genomeFragment using partial update
        GenomeFragment partialUpdatedGenomeFragment = new GenomeFragment();
        partialUpdatedGenomeFragment.setId(genomeFragment.getId());

        partialUpdatedGenomeFragment.chromosome(UPDATED_CHROMOSOME).start(UPDATED_START).end(UPDATED_END).strand(UPDATED_STRAND);

        restGenomeFragmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGenomeFragment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGenomeFragment))
            )
            .andExpect(status().isOk());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
        GenomeFragment testGenomeFragment = genomeFragmentList.get(genomeFragmentList.size() - 1);
        assertThat(testGenomeFragment.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testGenomeFragment.getStart()).isEqualTo(UPDATED_START);
        assertThat(testGenomeFragment.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testGenomeFragment.getStrand()).isEqualTo(UPDATED_STRAND);
        assertThat(testGenomeFragment.getType()).isEqualTo(DEFAULT_TYPE);
    }

    @Test
    @Transactional
    void fullUpdateGenomeFragmentWithPatch() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();

        // Update the genomeFragment using partial update
        GenomeFragment partialUpdatedGenomeFragment = new GenomeFragment();
        partialUpdatedGenomeFragment.setId(genomeFragment.getId());

        partialUpdatedGenomeFragment
            .chromosome(UPDATED_CHROMOSOME)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .strand(UPDATED_STRAND)
            .type(UPDATED_TYPE);

        restGenomeFragmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGenomeFragment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGenomeFragment))
            )
            .andExpect(status().isOk());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
        GenomeFragment testGenomeFragment = genomeFragmentList.get(genomeFragmentList.size() - 1);
        assertThat(testGenomeFragment.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testGenomeFragment.getStart()).isEqualTo(UPDATED_START);
        assertThat(testGenomeFragment.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testGenomeFragment.getStrand()).isEqualTo(UPDATED_STRAND);
        assertThat(testGenomeFragment.getType()).isEqualTo(UPDATED_TYPE);
    }

    @Test
    @Transactional
    void patchNonExistingGenomeFragment() throws Exception {
        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();
        genomeFragment.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGenomeFragmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, genomeFragment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGenomeFragment() throws Exception {
        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();
        genomeFragment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomeFragmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGenomeFragment() throws Exception {
        int databaseSizeBeforeUpdate = genomeFragmentRepository.findAll().size();
        genomeFragment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomeFragmentMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GenomeFragment in the database
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGenomeFragment() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        int databaseSizeBeforeDelete = genomeFragmentRepository.findAll().size();

        // Delete the genomeFragment
        restGenomeFragmentMockMvc
            .perform(delete(ENTITY_API_URL_ID, genomeFragment.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
