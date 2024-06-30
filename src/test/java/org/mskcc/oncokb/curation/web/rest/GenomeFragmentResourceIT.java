package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;
import org.mskcc.oncokb.curation.repository.GenomeFragmentRepository;
import org.mskcc.oncokb.curation.service.criteria.GenomeFragmentCriteria;
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

    private static final Integer DEFAULT_START = 1;
    private static final Integer UPDATED_START = 2;
    private static final Integer SMALLER_START = 1 - 1;

    private static final Integer DEFAULT_END = 1;
    private static final Integer UPDATED_END = 2;
    private static final Integer SMALLER_END = 1 - 1;

    private static final Integer DEFAULT_STRAND = 1;
    private static final Integer UPDATED_STRAND = 2;
    private static final Integer SMALLER_STRAND = 1 - 1;

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
    void checkStartIsRequired() throws Exception {
        int databaseSizeBeforeTest = genomeFragmentRepository.findAll().size();
        // set the field null
        genomeFragment.setStart(null);

        // Create the GenomeFragment, which fails.

        restGenomeFragmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndIsRequired() throws Exception {
        int databaseSizeBeforeTest = genomeFragmentRepository.findAll().size();
        // set the field null
        genomeFragment.setEnd(null);

        // Create the GenomeFragment, which fails.

        restGenomeFragmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStrandIsRequired() throws Exception {
        int databaseSizeBeforeTest = genomeFragmentRepository.findAll().size();
        // set the field null
        genomeFragment.setStrand(null);

        // Create the GenomeFragment, which fails.

        restGenomeFragmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = genomeFragmentRepository.findAll().size();
        // set the field null
        genomeFragment.setType(null);

        // Create the GenomeFragment, which fails.

        restGenomeFragmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomeFragment))
            )
            .andExpect(status().isBadRequest());

        List<GenomeFragment> genomeFragmentList = genomeFragmentRepository.findAll();
        assertThat(genomeFragmentList).hasSize(databaseSizeBeforeTest);
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
            .andExpect(jsonPath("$.start").value(DEFAULT_START))
            .andExpect(jsonPath("$.end").value(DEFAULT_END))
            .andExpect(jsonPath("$.strand").value(DEFAULT_STRAND))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()));
    }

    @Test
    @Transactional
    void getGenomeFragmentsByIdFiltering() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        Long id = genomeFragment.getId();

        defaultGenomeFragmentShouldBeFound("id.equals=" + id);
        defaultGenomeFragmentShouldNotBeFound("id.notEquals=" + id);

        defaultGenomeFragmentShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultGenomeFragmentShouldNotBeFound("id.greaterThan=" + id);

        defaultGenomeFragmentShouldBeFound("id.lessThanOrEqual=" + id);
        defaultGenomeFragmentShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start equals to DEFAULT_START
        defaultGenomeFragmentShouldBeFound("start.equals=" + DEFAULT_START);

        // Get all the genomeFragmentList where start equals to UPDATED_START
        defaultGenomeFragmentShouldNotBeFound("start.equals=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsNotEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start not equals to DEFAULT_START
        defaultGenomeFragmentShouldNotBeFound("start.notEquals=" + DEFAULT_START);

        // Get all the genomeFragmentList where start not equals to UPDATED_START
        defaultGenomeFragmentShouldBeFound("start.notEquals=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsInShouldWork() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start in DEFAULT_START or UPDATED_START
        defaultGenomeFragmentShouldBeFound("start.in=" + DEFAULT_START + "," + UPDATED_START);

        // Get all the genomeFragmentList where start equals to UPDATED_START
        defaultGenomeFragmentShouldNotBeFound("start.in=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsNullOrNotNull() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start is not null
        defaultGenomeFragmentShouldBeFound("start.specified=true");

        // Get all the genomeFragmentList where start is null
        defaultGenomeFragmentShouldNotBeFound("start.specified=false");
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start is greater than or equal to DEFAULT_START
        defaultGenomeFragmentShouldBeFound("start.greaterThanOrEqual=" + DEFAULT_START);

        // Get all the genomeFragmentList where start is greater than or equal to UPDATED_START
        defaultGenomeFragmentShouldNotBeFound("start.greaterThanOrEqual=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start is less than or equal to DEFAULT_START
        defaultGenomeFragmentShouldBeFound("start.lessThanOrEqual=" + DEFAULT_START);

        // Get all the genomeFragmentList where start is less than or equal to SMALLER_START
        defaultGenomeFragmentShouldNotBeFound("start.lessThanOrEqual=" + SMALLER_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsLessThanSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start is less than DEFAULT_START
        defaultGenomeFragmentShouldNotBeFound("start.lessThan=" + DEFAULT_START);

        // Get all the genomeFragmentList where start is less than UPDATED_START
        defaultGenomeFragmentShouldBeFound("start.lessThan=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStartIsGreaterThanSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where start is greater than DEFAULT_START
        defaultGenomeFragmentShouldNotBeFound("start.greaterThan=" + DEFAULT_START);

        // Get all the genomeFragmentList where start is greater than SMALLER_START
        defaultGenomeFragmentShouldBeFound("start.greaterThan=" + SMALLER_START);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end equals to DEFAULT_END
        defaultGenomeFragmentShouldBeFound("end.equals=" + DEFAULT_END);

        // Get all the genomeFragmentList where end equals to UPDATED_END
        defaultGenomeFragmentShouldNotBeFound("end.equals=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsNotEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end not equals to DEFAULT_END
        defaultGenomeFragmentShouldNotBeFound("end.notEquals=" + DEFAULT_END);

        // Get all the genomeFragmentList where end not equals to UPDATED_END
        defaultGenomeFragmentShouldBeFound("end.notEquals=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsInShouldWork() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end in DEFAULT_END or UPDATED_END
        defaultGenomeFragmentShouldBeFound("end.in=" + DEFAULT_END + "," + UPDATED_END);

        // Get all the genomeFragmentList where end equals to UPDATED_END
        defaultGenomeFragmentShouldNotBeFound("end.in=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsNullOrNotNull() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end is not null
        defaultGenomeFragmentShouldBeFound("end.specified=true");

        // Get all the genomeFragmentList where end is null
        defaultGenomeFragmentShouldNotBeFound("end.specified=false");
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end is greater than or equal to DEFAULT_END
        defaultGenomeFragmentShouldBeFound("end.greaterThanOrEqual=" + DEFAULT_END);

        // Get all the genomeFragmentList where end is greater than or equal to UPDATED_END
        defaultGenomeFragmentShouldNotBeFound("end.greaterThanOrEqual=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end is less than or equal to DEFAULT_END
        defaultGenomeFragmentShouldBeFound("end.lessThanOrEqual=" + DEFAULT_END);

        // Get all the genomeFragmentList where end is less than or equal to SMALLER_END
        defaultGenomeFragmentShouldNotBeFound("end.lessThanOrEqual=" + SMALLER_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsLessThanSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end is less than DEFAULT_END
        defaultGenomeFragmentShouldNotBeFound("end.lessThan=" + DEFAULT_END);

        // Get all the genomeFragmentList where end is less than UPDATED_END
        defaultGenomeFragmentShouldBeFound("end.lessThan=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByEndIsGreaterThanSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where end is greater than DEFAULT_END
        defaultGenomeFragmentShouldNotBeFound("end.greaterThan=" + DEFAULT_END);

        // Get all the genomeFragmentList where end is greater than SMALLER_END
        defaultGenomeFragmentShouldBeFound("end.greaterThan=" + SMALLER_END);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand equals to DEFAULT_STRAND
        defaultGenomeFragmentShouldBeFound("strand.equals=" + DEFAULT_STRAND);

        // Get all the genomeFragmentList where strand equals to UPDATED_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.equals=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsNotEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand not equals to DEFAULT_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.notEquals=" + DEFAULT_STRAND);

        // Get all the genomeFragmentList where strand not equals to UPDATED_STRAND
        defaultGenomeFragmentShouldBeFound("strand.notEquals=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsInShouldWork() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand in DEFAULT_STRAND or UPDATED_STRAND
        defaultGenomeFragmentShouldBeFound("strand.in=" + DEFAULT_STRAND + "," + UPDATED_STRAND);

        // Get all the genomeFragmentList where strand equals to UPDATED_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.in=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsNullOrNotNull() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand is not null
        defaultGenomeFragmentShouldBeFound("strand.specified=true");

        // Get all the genomeFragmentList where strand is null
        defaultGenomeFragmentShouldNotBeFound("strand.specified=false");
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand is greater than or equal to DEFAULT_STRAND
        defaultGenomeFragmentShouldBeFound("strand.greaterThanOrEqual=" + DEFAULT_STRAND);

        // Get all the genomeFragmentList where strand is greater than or equal to UPDATED_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.greaterThanOrEqual=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand is less than or equal to DEFAULT_STRAND
        defaultGenomeFragmentShouldBeFound("strand.lessThanOrEqual=" + DEFAULT_STRAND);

        // Get all the genomeFragmentList where strand is less than or equal to SMALLER_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.lessThanOrEqual=" + SMALLER_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsLessThanSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand is less than DEFAULT_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.lessThan=" + DEFAULT_STRAND);

        // Get all the genomeFragmentList where strand is less than UPDATED_STRAND
        defaultGenomeFragmentShouldBeFound("strand.lessThan=" + UPDATED_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByStrandIsGreaterThanSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where strand is greater than DEFAULT_STRAND
        defaultGenomeFragmentShouldNotBeFound("strand.greaterThan=" + DEFAULT_STRAND);

        // Get all the genomeFragmentList where strand is greater than SMALLER_STRAND
        defaultGenomeFragmentShouldBeFound("strand.greaterThan=" + SMALLER_STRAND);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where type equals to DEFAULT_TYPE
        defaultGenomeFragmentShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the genomeFragmentList where type equals to UPDATED_TYPE
        defaultGenomeFragmentShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where type not equals to DEFAULT_TYPE
        defaultGenomeFragmentShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the genomeFragmentList where type not equals to UPDATED_TYPE
        defaultGenomeFragmentShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultGenomeFragmentShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the genomeFragmentList where type equals to UPDATED_TYPE
        defaultGenomeFragmentShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);

        // Get all the genomeFragmentList where type is not null
        defaultGenomeFragmentShouldBeFound("type.specified=true");

        // Get all the genomeFragmentList where type is null
        defaultGenomeFragmentShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsBySeqRegionIsEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);
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
        genomeFragment.setSeqRegion(seqRegion);
        genomeFragmentRepository.saveAndFlush(genomeFragment);
        Long seqRegionId = seqRegion.getId();

        // Get all the genomeFragmentList where seqRegion equals to seqRegionId
        defaultGenomeFragmentShouldBeFound("seqRegionId.equals=" + seqRegionId);

        // Get all the genomeFragmentList where seqRegion equals to (seqRegionId + 1)
        defaultGenomeFragmentShouldNotBeFound("seqRegionId.equals=" + (seqRegionId + 1));
    }

    @Test
    @Transactional
    void getAllGenomeFragmentsByTranscriptIsEqualToSomething() throws Exception {
        // Initialize the database
        genomeFragmentRepository.saveAndFlush(genomeFragment);
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
        genomeFragment.setTranscript(transcript);
        genomeFragmentRepository.saveAndFlush(genomeFragment);
        Long transcriptId = transcript.getId();

        // Get all the genomeFragmentList where transcript equals to transcriptId
        defaultGenomeFragmentShouldBeFound("transcriptId.equals=" + transcriptId);

        // Get all the genomeFragmentList where transcript equals to (transcriptId + 1)
        defaultGenomeFragmentShouldNotBeFound("transcriptId.equals=" + (transcriptId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultGenomeFragmentShouldBeFound(String filter) throws Exception {
        restGenomeFragmentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(genomeFragment.getId().intValue())))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START)))
            .andExpect(jsonPath("$.[*].end").value(hasItem(DEFAULT_END)))
            .andExpect(jsonPath("$.[*].strand").value(hasItem(DEFAULT_STRAND)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())));

        // Check, that the count call also returns 1
        restGenomeFragmentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultGenomeFragmentShouldNotBeFound(String filter) throws Exception {
        restGenomeFragmentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restGenomeFragmentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
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
        GenomeFragment updatedGenomeFragment = genomeFragmentRepository.findById(genomeFragment.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedGenomeFragment are not directly saved in db
        em.detach(updatedGenomeFragment);
        updatedGenomeFragment.start(UPDATED_START).end(UPDATED_END).strand(UPDATED_STRAND).type(UPDATED_TYPE);

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

        partialUpdatedGenomeFragment.start(UPDATED_START).end(UPDATED_END).strand(UPDATED_STRAND).type(UPDATED_TYPE);

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
        assertThat(testGenomeFragment.getStart()).isEqualTo(UPDATED_START);
        assertThat(testGenomeFragment.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testGenomeFragment.getStrand()).isEqualTo(UPDATED_STRAND);
        assertThat(testGenomeFragment.getType()).isEqualTo(UPDATED_TYPE);
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

        partialUpdatedGenomeFragment.start(UPDATED_START).end(UPDATED_END).strand(UPDATED_STRAND).type(UPDATED_TYPE);

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
