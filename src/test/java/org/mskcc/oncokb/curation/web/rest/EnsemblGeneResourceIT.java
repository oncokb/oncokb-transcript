package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.repository.EnsemblGeneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link EnsemblGeneResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class EnsemblGeneResourceIT {

    private static final ReferenceGenome DEFAULT_REFERENCE_GENOME = ReferenceGenome.GRCh37;
    private static final ReferenceGenome UPDATED_REFERENCE_GENOME = ReferenceGenome.GRCh38;

    private static final String DEFAULT_ENSEMBL_GENE_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENSEMBL_GENE_ID = "BBBBBBBBBB";

    private static final Boolean DEFAULT_CANONICAL = false;
    private static final Boolean UPDATED_CANONICAL = true;

    private static final String DEFAULT_CHROMOSOME = "AAAAAAAAAA";
    private static final String UPDATED_CHROMOSOME = "BBBBBBBBBB";

    private static final Integer DEFAULT_START = 1;
    private static final Integer UPDATED_START = 2;

    private static final Integer DEFAULT_END = 1;
    private static final Integer UPDATED_END = 2;

    private static final Integer DEFAULT_STRAND = 1;
    private static final Integer UPDATED_STRAND = 2;

    private static final String ENTITY_API_URL = "/api/ensembl-genes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private EnsemblGeneRepository ensemblGeneRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEnsemblGeneMockMvc;

    private EnsemblGene ensemblGene;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EnsemblGene createEntity(EntityManager em) {
        EnsemblGene ensemblGene = new EnsemblGene()
            .referenceGenome(DEFAULT_REFERENCE_GENOME)
            .ensemblGeneId(DEFAULT_ENSEMBL_GENE_ID)
            .canonical(DEFAULT_CANONICAL)
            .chromosome(DEFAULT_CHROMOSOME)
            .start(DEFAULT_START)
            .end(DEFAULT_END)
            .strand(DEFAULT_STRAND);
        return ensemblGene;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EnsemblGene createUpdatedEntity(EntityManager em) {
        EnsemblGene ensemblGene = new EnsemblGene()
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblGeneId(UPDATED_ENSEMBL_GENE_ID)
            .canonical(UPDATED_CANONICAL)
            .chromosome(UPDATED_CHROMOSOME)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .strand(UPDATED_STRAND);
        return ensemblGene;
    }

    @BeforeEach
    public void initTest() {
        ensemblGene = createEntity(em);
    }

    @Test
    @Transactional
    void createEnsemblGene() throws Exception {
        int databaseSizeBeforeCreate = ensemblGeneRepository.findAll().size();
        // Create the EnsemblGene
        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isCreated());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeCreate + 1);
        EnsemblGene testEnsemblGene = ensemblGeneList.get(ensemblGeneList.size() - 1);
        assertThat(testEnsemblGene.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
        assertThat(testEnsemblGene.getEnsemblGeneId()).isEqualTo(DEFAULT_ENSEMBL_GENE_ID);
        assertThat(testEnsemblGene.getCanonical()).isEqualTo(DEFAULT_CANONICAL);
        assertThat(testEnsemblGene.getChromosome()).isEqualTo(DEFAULT_CHROMOSOME);
        assertThat(testEnsemblGene.getStart()).isEqualTo(DEFAULT_START);
        assertThat(testEnsemblGene.getEnd()).isEqualTo(DEFAULT_END);
        assertThat(testEnsemblGene.getStrand()).isEqualTo(DEFAULT_STRAND);
    }

    @Test
    @Transactional
    void createEnsemblGeneWithExistingId() throws Exception {
        // Create the EnsemblGene with an existing ID
        ensemblGene.setId(1L);

        int databaseSizeBeforeCreate = ensemblGeneRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEnsemblGeneIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = ensemblGeneRepository.findAll().size();
        // set the field null
        ensemblGene.setEnsemblGeneId(null);

        // Create the EnsemblGene, which fails.

        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCanonicalIsRequired() throws Exception {
        int databaseSizeBeforeTest = ensemblGeneRepository.findAll().size();
        // set the field null
        ensemblGene.setCanonical(null);

        // Create the EnsemblGene, which fails.

        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkChromosomeIsRequired() throws Exception {
        int databaseSizeBeforeTest = ensemblGeneRepository.findAll().size();
        // set the field null
        ensemblGene.setChromosome(null);

        // Create the EnsemblGene, which fails.

        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStartIsRequired() throws Exception {
        int databaseSizeBeforeTest = ensemblGeneRepository.findAll().size();
        // set the field null
        ensemblGene.setStart(null);

        // Create the EnsemblGene, which fails.

        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndIsRequired() throws Exception {
        int databaseSizeBeforeTest = ensemblGeneRepository.findAll().size();
        // set the field null
        ensemblGene.setEnd(null);

        // Create the EnsemblGene, which fails.

        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStrandIsRequired() throws Exception {
        int databaseSizeBeforeTest = ensemblGeneRepository.findAll().size();
        // set the field null
        ensemblGene.setStrand(null);

        // Create the EnsemblGene, which fails.

        restEnsemblGeneMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEnsemblGenes() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList
        restEnsemblGeneMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(ensemblGene.getId().intValue())))
            .andExpect(jsonPath("$.[*].referenceGenome").value(hasItem(DEFAULT_REFERENCE_GENOME.toString())))
            .andExpect(jsonPath("$.[*].ensemblGeneId").value(hasItem(DEFAULT_ENSEMBL_GENE_ID)))
            .andExpect(jsonPath("$.[*].canonical").value(hasItem(DEFAULT_CANONICAL.booleanValue())))
            .andExpect(jsonPath("$.[*].chromosome").value(hasItem(DEFAULT_CHROMOSOME)))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START)))
            .andExpect(jsonPath("$.[*].end").value(hasItem(DEFAULT_END)))
            .andExpect(jsonPath("$.[*].strand").value(hasItem(DEFAULT_STRAND)));
    }

    @Test
    @Transactional
    void getEnsemblGene() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get the ensemblGene
        restEnsemblGeneMockMvc
            .perform(get(ENTITY_API_URL_ID, ensemblGene.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(ensemblGene.getId().intValue()))
            .andExpect(jsonPath("$.referenceGenome").value(DEFAULT_REFERENCE_GENOME.toString()))
            .andExpect(jsonPath("$.ensemblGeneId").value(DEFAULT_ENSEMBL_GENE_ID))
            .andExpect(jsonPath("$.canonical").value(DEFAULT_CANONICAL.booleanValue()))
            .andExpect(jsonPath("$.chromosome").value(DEFAULT_CHROMOSOME))
            .andExpect(jsonPath("$.start").value(DEFAULT_START))
            .andExpect(jsonPath("$.end").value(DEFAULT_END))
            .andExpect(jsonPath("$.strand").value(DEFAULT_STRAND));
    }

    @Test
    @Transactional
    void getNonExistingEnsemblGene() throws Exception {
        // Get the ensemblGene
        restEnsemblGeneMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewEnsemblGene() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();

        // Update the ensemblGene
        EnsemblGene updatedEnsemblGene = ensemblGeneRepository.findById(ensemblGene.getId()).get();
        // Disconnect from session so that the updates on updatedEnsemblGene are not directly saved in db
        em.detach(updatedEnsemblGene);
        updatedEnsemblGene
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblGeneId(UPDATED_ENSEMBL_GENE_ID)
            .canonical(UPDATED_CANONICAL)
            .chromosome(UPDATED_CHROMOSOME)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .strand(UPDATED_STRAND);

        restEnsemblGeneMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedEnsemblGene.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedEnsemblGene))
            )
            .andExpect(status().isOk());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
        EnsemblGene testEnsemblGene = ensemblGeneList.get(ensemblGeneList.size() - 1);
        assertThat(testEnsemblGene.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
        assertThat(testEnsemblGene.getEnsemblGeneId()).isEqualTo(UPDATED_ENSEMBL_GENE_ID);
        assertThat(testEnsemblGene.getCanonical()).isEqualTo(UPDATED_CANONICAL);
        assertThat(testEnsemblGene.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testEnsemblGene.getStart()).isEqualTo(UPDATED_START);
        assertThat(testEnsemblGene.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testEnsemblGene.getStrand()).isEqualTo(UPDATED_STRAND);
    }

    @Test
    @Transactional
    void putNonExistingEnsemblGene() throws Exception {
        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();
        ensemblGene.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEnsemblGeneMockMvc
            .perform(
                put(ENTITY_API_URL_ID, ensemblGene.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEnsemblGene() throws Exception {
        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();
        ensemblGene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEnsemblGeneMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEnsemblGene() throws Exception {
        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();
        ensemblGene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEnsemblGeneMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEnsemblGeneWithPatch() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();

        // Update the ensemblGene using partial update
        EnsemblGene partialUpdatedEnsemblGene = new EnsemblGene();
        partialUpdatedEnsemblGene.setId(ensemblGene.getId());

        partialUpdatedEnsemblGene.canonical(UPDATED_CANONICAL).start(UPDATED_START).end(UPDATED_END).strand(UPDATED_STRAND);

        restEnsemblGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEnsemblGene.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedEnsemblGene))
            )
            .andExpect(status().isOk());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
        EnsemblGene testEnsemblGene = ensemblGeneList.get(ensemblGeneList.size() - 1);
        assertThat(testEnsemblGene.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
        assertThat(testEnsemblGene.getEnsemblGeneId()).isEqualTo(DEFAULT_ENSEMBL_GENE_ID);
        assertThat(testEnsemblGene.getCanonical()).isEqualTo(UPDATED_CANONICAL);
        assertThat(testEnsemblGene.getChromosome()).isEqualTo(DEFAULT_CHROMOSOME);
        assertThat(testEnsemblGene.getStart()).isEqualTo(UPDATED_START);
        assertThat(testEnsemblGene.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testEnsemblGene.getStrand()).isEqualTo(UPDATED_STRAND);
    }

    @Test
    @Transactional
    void fullUpdateEnsemblGeneWithPatch() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();

        // Update the ensemblGene using partial update
        EnsemblGene partialUpdatedEnsemblGene = new EnsemblGene();
        partialUpdatedEnsemblGene.setId(ensemblGene.getId());

        partialUpdatedEnsemblGene
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblGeneId(UPDATED_ENSEMBL_GENE_ID)
            .canonical(UPDATED_CANONICAL)
            .chromosome(UPDATED_CHROMOSOME)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .strand(UPDATED_STRAND);

        restEnsemblGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEnsemblGene.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedEnsemblGene))
            )
            .andExpect(status().isOk());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
        EnsemblGene testEnsemblGene = ensemblGeneList.get(ensemblGeneList.size() - 1);
        assertThat(testEnsemblGene.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
        assertThat(testEnsemblGene.getEnsemblGeneId()).isEqualTo(UPDATED_ENSEMBL_GENE_ID);
        assertThat(testEnsemblGene.getCanonical()).isEqualTo(UPDATED_CANONICAL);
        assertThat(testEnsemblGene.getChromosome()).isEqualTo(UPDATED_CHROMOSOME);
        assertThat(testEnsemblGene.getStart()).isEqualTo(UPDATED_START);
        assertThat(testEnsemblGene.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testEnsemblGene.getStrand()).isEqualTo(UPDATED_STRAND);
    }

    @Test
    @Transactional
    void patchNonExistingEnsemblGene() throws Exception {
        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();
        ensemblGene.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEnsemblGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, ensemblGene.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEnsemblGene() throws Exception {
        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();
        ensemblGene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEnsemblGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isBadRequest());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEnsemblGene() throws Exception {
        int databaseSizeBeforeUpdate = ensemblGeneRepository.findAll().size();
        ensemblGene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEnsemblGeneMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(ensemblGene))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EnsemblGene in the database
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEnsemblGene() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        int databaseSizeBeforeDelete = ensemblGeneRepository.findAll().size();

        // Delete the ensemblGene
        restEnsemblGeneMockMvc
            .perform(delete(ENTITY_API_URL_ID, ensemblGene.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<EnsemblGene> ensemblGeneList = ensemblGeneRepository.findAll();
        assertThat(ensemblGeneList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
