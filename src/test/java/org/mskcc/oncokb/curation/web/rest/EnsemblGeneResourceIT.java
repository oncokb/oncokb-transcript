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
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.repository.EnsemblGeneRepository;
import org.mskcc.oncokb.curation.service.criteria.EnsemblGeneCriteria;
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

    private static final Integer DEFAULT_START = 1;
    private static final Integer UPDATED_START = 2;
    private static final Integer SMALLER_START = 1 - 1;

    private static final Integer DEFAULT_END = 1;
    private static final Integer UPDATED_END = 2;
    private static final Integer SMALLER_END = 1 - 1;

    private static final Integer DEFAULT_STRAND = 1;
    private static final Integer UPDATED_STRAND = 2;
    private static final Integer SMALLER_STRAND = 1 - 1;

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
            .andExpect(jsonPath("$.start").value(DEFAULT_START))
            .andExpect(jsonPath("$.end").value(DEFAULT_END))
            .andExpect(jsonPath("$.strand").value(DEFAULT_STRAND));
    }

    @Test
    @Transactional
    void getEnsemblGenesByIdFiltering() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        Long id = ensemblGene.getId();

        defaultEnsemblGeneShouldBeFound("id.equals=" + id);
        defaultEnsemblGeneShouldNotBeFound("id.notEquals=" + id);

        defaultEnsemblGeneShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultEnsemblGeneShouldNotBeFound("id.greaterThan=" + id);

        defaultEnsemblGeneShouldBeFound("id.lessThanOrEqual=" + id);
        defaultEnsemblGeneShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByReferenceGenomeIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where referenceGenome equals to DEFAULT_REFERENCE_GENOME
        defaultEnsemblGeneShouldBeFound("referenceGenome.equals=" + DEFAULT_REFERENCE_GENOME);

        // Get all the ensemblGeneList where referenceGenome equals to UPDATED_REFERENCE_GENOME
        defaultEnsemblGeneShouldNotBeFound("referenceGenome.equals=" + UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByReferenceGenomeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where referenceGenome not equals to DEFAULT_REFERENCE_GENOME
        defaultEnsemblGeneShouldNotBeFound("referenceGenome.notEquals=" + DEFAULT_REFERENCE_GENOME);

        // Get all the ensemblGeneList where referenceGenome not equals to UPDATED_REFERENCE_GENOME
        defaultEnsemblGeneShouldBeFound("referenceGenome.notEquals=" + UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByReferenceGenomeIsInShouldWork() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where referenceGenome in DEFAULT_REFERENCE_GENOME or UPDATED_REFERENCE_GENOME
        defaultEnsemblGeneShouldBeFound("referenceGenome.in=" + DEFAULT_REFERENCE_GENOME + "," + UPDATED_REFERENCE_GENOME);

        // Get all the ensemblGeneList where referenceGenome equals to UPDATED_REFERENCE_GENOME
        defaultEnsemblGeneShouldNotBeFound("referenceGenome.in=" + UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByReferenceGenomeIsNullOrNotNull() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where referenceGenome is not null
        defaultEnsemblGeneShouldBeFound("referenceGenome.specified=true");

        // Get all the ensemblGeneList where referenceGenome is null
        defaultEnsemblGeneShouldNotBeFound("referenceGenome.specified=false");
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEnsemblGeneIdIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where ensemblGeneId equals to DEFAULT_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldBeFound("ensemblGeneId.equals=" + DEFAULT_ENSEMBL_GENE_ID);

        // Get all the ensemblGeneList where ensemblGeneId equals to UPDATED_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldNotBeFound("ensemblGeneId.equals=" + UPDATED_ENSEMBL_GENE_ID);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEnsemblGeneIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where ensemblGeneId not equals to DEFAULT_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldNotBeFound("ensemblGeneId.notEquals=" + DEFAULT_ENSEMBL_GENE_ID);

        // Get all the ensemblGeneList where ensemblGeneId not equals to UPDATED_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldBeFound("ensemblGeneId.notEquals=" + UPDATED_ENSEMBL_GENE_ID);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEnsemblGeneIdIsInShouldWork() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where ensemblGeneId in DEFAULT_ENSEMBL_GENE_ID or UPDATED_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldBeFound("ensemblGeneId.in=" + DEFAULT_ENSEMBL_GENE_ID + "," + UPDATED_ENSEMBL_GENE_ID);

        // Get all the ensemblGeneList where ensemblGeneId equals to UPDATED_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldNotBeFound("ensemblGeneId.in=" + UPDATED_ENSEMBL_GENE_ID);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEnsemblGeneIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where ensemblGeneId is not null
        defaultEnsemblGeneShouldBeFound("ensemblGeneId.specified=true");

        // Get all the ensemblGeneList where ensemblGeneId is null
        defaultEnsemblGeneShouldNotBeFound("ensemblGeneId.specified=false");
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEnsemblGeneIdContainsSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where ensemblGeneId contains DEFAULT_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldBeFound("ensemblGeneId.contains=" + DEFAULT_ENSEMBL_GENE_ID);

        // Get all the ensemblGeneList where ensemblGeneId contains UPDATED_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldNotBeFound("ensemblGeneId.contains=" + UPDATED_ENSEMBL_GENE_ID);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEnsemblGeneIdNotContainsSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where ensemblGeneId does not contain DEFAULT_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldNotBeFound("ensemblGeneId.doesNotContain=" + DEFAULT_ENSEMBL_GENE_ID);

        // Get all the ensemblGeneList where ensemblGeneId does not contain UPDATED_ENSEMBL_GENE_ID
        defaultEnsemblGeneShouldBeFound("ensemblGeneId.doesNotContain=" + UPDATED_ENSEMBL_GENE_ID);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByCanonicalIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where canonical equals to DEFAULT_CANONICAL
        defaultEnsemblGeneShouldBeFound("canonical.equals=" + DEFAULT_CANONICAL);

        // Get all the ensemblGeneList where canonical equals to UPDATED_CANONICAL
        defaultEnsemblGeneShouldNotBeFound("canonical.equals=" + UPDATED_CANONICAL);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByCanonicalIsNotEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where canonical not equals to DEFAULT_CANONICAL
        defaultEnsemblGeneShouldNotBeFound("canonical.notEquals=" + DEFAULT_CANONICAL);

        // Get all the ensemblGeneList where canonical not equals to UPDATED_CANONICAL
        defaultEnsemblGeneShouldBeFound("canonical.notEquals=" + UPDATED_CANONICAL);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByCanonicalIsInShouldWork() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where canonical in DEFAULT_CANONICAL or UPDATED_CANONICAL
        defaultEnsemblGeneShouldBeFound("canonical.in=" + DEFAULT_CANONICAL + "," + UPDATED_CANONICAL);

        // Get all the ensemblGeneList where canonical equals to UPDATED_CANONICAL
        defaultEnsemblGeneShouldNotBeFound("canonical.in=" + UPDATED_CANONICAL);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByCanonicalIsNullOrNotNull() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where canonical is not null
        defaultEnsemblGeneShouldBeFound("canonical.specified=true");

        // Get all the ensemblGeneList where canonical is null
        defaultEnsemblGeneShouldNotBeFound("canonical.specified=false");
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start equals to DEFAULT_START
        defaultEnsemblGeneShouldBeFound("start.equals=" + DEFAULT_START);

        // Get all the ensemblGeneList where start equals to UPDATED_START
        defaultEnsemblGeneShouldNotBeFound("start.equals=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsNotEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start not equals to DEFAULT_START
        defaultEnsemblGeneShouldNotBeFound("start.notEquals=" + DEFAULT_START);

        // Get all the ensemblGeneList where start not equals to UPDATED_START
        defaultEnsemblGeneShouldBeFound("start.notEquals=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsInShouldWork() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start in DEFAULT_START or UPDATED_START
        defaultEnsemblGeneShouldBeFound("start.in=" + DEFAULT_START + "," + UPDATED_START);

        // Get all the ensemblGeneList where start equals to UPDATED_START
        defaultEnsemblGeneShouldNotBeFound("start.in=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsNullOrNotNull() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start is not null
        defaultEnsemblGeneShouldBeFound("start.specified=true");

        // Get all the ensemblGeneList where start is null
        defaultEnsemblGeneShouldNotBeFound("start.specified=false");
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start is greater than or equal to DEFAULT_START
        defaultEnsemblGeneShouldBeFound("start.greaterThanOrEqual=" + DEFAULT_START);

        // Get all the ensemblGeneList where start is greater than or equal to UPDATED_START
        defaultEnsemblGeneShouldNotBeFound("start.greaterThanOrEqual=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start is less than or equal to DEFAULT_START
        defaultEnsemblGeneShouldBeFound("start.lessThanOrEqual=" + DEFAULT_START);

        // Get all the ensemblGeneList where start is less than or equal to SMALLER_START
        defaultEnsemblGeneShouldNotBeFound("start.lessThanOrEqual=" + SMALLER_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsLessThanSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start is less than DEFAULT_START
        defaultEnsemblGeneShouldNotBeFound("start.lessThan=" + DEFAULT_START);

        // Get all the ensemblGeneList where start is less than UPDATED_START
        defaultEnsemblGeneShouldBeFound("start.lessThan=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStartIsGreaterThanSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where start is greater than DEFAULT_START
        defaultEnsemblGeneShouldNotBeFound("start.greaterThan=" + DEFAULT_START);

        // Get all the ensemblGeneList where start is greater than SMALLER_START
        defaultEnsemblGeneShouldBeFound("start.greaterThan=" + SMALLER_START);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end equals to DEFAULT_END
        defaultEnsemblGeneShouldBeFound("end.equals=" + DEFAULT_END);

        // Get all the ensemblGeneList where end equals to UPDATED_END
        defaultEnsemblGeneShouldNotBeFound("end.equals=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsNotEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end not equals to DEFAULT_END
        defaultEnsemblGeneShouldNotBeFound("end.notEquals=" + DEFAULT_END);

        // Get all the ensemblGeneList where end not equals to UPDATED_END
        defaultEnsemblGeneShouldBeFound("end.notEquals=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsInShouldWork() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end in DEFAULT_END or UPDATED_END
        defaultEnsemblGeneShouldBeFound("end.in=" + DEFAULT_END + "," + UPDATED_END);

        // Get all the ensemblGeneList where end equals to UPDATED_END
        defaultEnsemblGeneShouldNotBeFound("end.in=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsNullOrNotNull() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end is not null
        defaultEnsemblGeneShouldBeFound("end.specified=true");

        // Get all the ensemblGeneList where end is null
        defaultEnsemblGeneShouldNotBeFound("end.specified=false");
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end is greater than or equal to DEFAULT_END
        defaultEnsemblGeneShouldBeFound("end.greaterThanOrEqual=" + DEFAULT_END);

        // Get all the ensemblGeneList where end is greater than or equal to UPDATED_END
        defaultEnsemblGeneShouldNotBeFound("end.greaterThanOrEqual=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end is less than or equal to DEFAULT_END
        defaultEnsemblGeneShouldBeFound("end.lessThanOrEqual=" + DEFAULT_END);

        // Get all the ensemblGeneList where end is less than or equal to SMALLER_END
        defaultEnsemblGeneShouldNotBeFound("end.lessThanOrEqual=" + SMALLER_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsLessThanSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end is less than DEFAULT_END
        defaultEnsemblGeneShouldNotBeFound("end.lessThan=" + DEFAULT_END);

        // Get all the ensemblGeneList where end is less than UPDATED_END
        defaultEnsemblGeneShouldBeFound("end.lessThan=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByEndIsGreaterThanSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where end is greater than DEFAULT_END
        defaultEnsemblGeneShouldNotBeFound("end.greaterThan=" + DEFAULT_END);

        // Get all the ensemblGeneList where end is greater than SMALLER_END
        defaultEnsemblGeneShouldBeFound("end.greaterThan=" + SMALLER_END);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand equals to DEFAULT_STRAND
        defaultEnsemblGeneShouldBeFound("strand.equals=" + DEFAULT_STRAND);

        // Get all the ensemblGeneList where strand equals to UPDATED_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.equals=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsNotEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand not equals to DEFAULT_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.notEquals=" + DEFAULT_STRAND);

        // Get all the ensemblGeneList where strand not equals to UPDATED_STRAND
        defaultEnsemblGeneShouldBeFound("strand.notEquals=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsInShouldWork() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand in DEFAULT_STRAND or UPDATED_STRAND
        defaultEnsemblGeneShouldBeFound("strand.in=" + DEFAULT_STRAND + "," + UPDATED_STRAND);

        // Get all the ensemblGeneList where strand equals to UPDATED_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.in=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsNullOrNotNull() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand is not null
        defaultEnsemblGeneShouldBeFound("strand.specified=true");

        // Get all the ensemblGeneList where strand is null
        defaultEnsemblGeneShouldNotBeFound("strand.specified=false");
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand is greater than or equal to DEFAULT_STRAND
        defaultEnsemblGeneShouldBeFound("strand.greaterThanOrEqual=" + DEFAULT_STRAND);

        // Get all the ensemblGeneList where strand is greater than or equal to UPDATED_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.greaterThanOrEqual=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand is less than or equal to DEFAULT_STRAND
        defaultEnsemblGeneShouldBeFound("strand.lessThanOrEqual=" + DEFAULT_STRAND);

        // Get all the ensemblGeneList where strand is less than or equal to SMALLER_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.lessThanOrEqual=" + SMALLER_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsLessThanSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand is less than DEFAULT_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.lessThan=" + DEFAULT_STRAND);

        // Get all the ensemblGeneList where strand is less than UPDATED_STRAND
        defaultEnsemblGeneShouldBeFound("strand.lessThan=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByStrandIsGreaterThanSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);

        // Get all the ensemblGeneList where strand is greater than DEFAULT_STRAND
        defaultEnsemblGeneShouldNotBeFound("strand.greaterThan=" + DEFAULT_STRAND);

        // Get all the ensemblGeneList where strand is greater than SMALLER_STRAND
        defaultEnsemblGeneShouldBeFound("strand.greaterThan=" + SMALLER_STRAND);
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByTranscriptIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);
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
        ensemblGene.addTranscript(transcript);
        ensemblGeneRepository.saveAndFlush(ensemblGene);
        Long transcriptId = transcript.getId();

        // Get all the ensemblGeneList where transcript equals to transcriptId
        defaultEnsemblGeneShouldBeFound("transcriptId.equals=" + transcriptId);

        // Get all the ensemblGeneList where transcript equals to (transcriptId + 1)
        defaultEnsemblGeneShouldNotBeFound("transcriptId.equals=" + (transcriptId + 1));
    }

    @Test
    @Transactional
    void getAllEnsemblGenesByGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);
        Gene gene;
        if (TestUtil.findAll(em, Gene.class).isEmpty()) {
            gene = GeneResourceIT.createEntity(em);
            em.persist(gene);
            em.flush();
        } else {
            gene = TestUtil.findAll(em, Gene.class).get(0);
        }
        em.persist(gene);
        em.flush();
        ensemblGene.setGene(gene);
        ensemblGeneRepository.saveAndFlush(ensemblGene);
        Long geneId = gene.getId();

        // Get all the ensemblGeneList where gene equals to geneId
        defaultEnsemblGeneShouldBeFound("geneId.equals=" + geneId);

        // Get all the ensemblGeneList where gene equals to (geneId + 1)
        defaultEnsemblGeneShouldNotBeFound("geneId.equals=" + (geneId + 1));
    }

    @Test
    @Transactional
    void getAllEnsemblGenesBySeqRegionIsEqualToSomething() throws Exception {
        // Initialize the database
        ensemblGeneRepository.saveAndFlush(ensemblGene);
        SeqRegion seqRegion;
        if (TestUtil.findAll(em, SeqRegion.class).isEmpty()) {
            seqRegion = SeqRegionResourceIT.createEntity(em);
            em.persist(seqRegion);
            em.flush();
        } else {
            seqRegion = TestUtil.findAll(em, SeqRegion.class).get(0);
        }
        em.persist(seqRegion);
        em.flush();
        ensemblGene.setSeqRegion(seqRegion);
        ensemblGeneRepository.saveAndFlush(ensemblGene);
        Long seqRegionId = seqRegion.getId();

        // Get all the ensemblGeneList where seqRegion equals to seqRegionId
        defaultEnsemblGeneShouldBeFound("seqRegionId.equals=" + seqRegionId);

        // Get all the ensemblGeneList where seqRegion equals to (seqRegionId + 1)
        defaultEnsemblGeneShouldNotBeFound("seqRegionId.equals=" + (seqRegionId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultEnsemblGeneShouldBeFound(String filter) throws Exception {
        restEnsemblGeneMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(ensemblGene.getId().intValue())))
            .andExpect(jsonPath("$.[*].referenceGenome").value(hasItem(DEFAULT_REFERENCE_GENOME.toString())))
            .andExpect(jsonPath("$.[*].ensemblGeneId").value(hasItem(DEFAULT_ENSEMBL_GENE_ID)))
            .andExpect(jsonPath("$.[*].canonical").value(hasItem(DEFAULT_CANONICAL.booleanValue())))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START)))
            .andExpect(jsonPath("$.[*].end").value(hasItem(DEFAULT_END)))
            .andExpect(jsonPath("$.[*].strand").value(hasItem(DEFAULT_STRAND)));

        // Check, that the count call also returns 1
        restEnsemblGeneMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultEnsemblGeneShouldNotBeFound(String filter) throws Exception {
        restEnsemblGeneMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restEnsemblGeneMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
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

        partialUpdatedEnsemblGene.canonical(UPDATED_CANONICAL).end(UPDATED_END).strand(UPDATED_STRAND);

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
        assertThat(testEnsemblGene.getStart()).isEqualTo(DEFAULT_START);
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
