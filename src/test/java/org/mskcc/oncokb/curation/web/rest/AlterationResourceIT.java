package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
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
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.mskcc.oncokb.curation.service.AlterationService;
import org.mskcc.oncokb.curation.service.criteria.AlterationCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AlterationResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class AlterationResourceIT {

    private static final AlterationType DEFAULT_TYPE = AlterationType.GENOMIC_CHANGE;
    private static final AlterationType UPDATED_TYPE = AlterationType.CDNA_CHANGE;

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ALTERATION = "AAAAAAAAAA";
    private static final String UPDATED_ALTERATION = "BBBBBBBBBB";

    private static final String DEFAULT_PROTEIN_CHANGE = "AAAAAAAAAA";
    private static final String UPDATED_PROTEIN_CHANGE = "BBBBBBBBBB";

    private static final Integer DEFAULT_START = 1;
    private static final Integer UPDATED_START = 2;
    private static final Integer SMALLER_START = 1 - 1;

    private static final Integer DEFAULT_END = 1;
    private static final Integer UPDATED_END = 2;
    private static final Integer SMALLER_END = 1 - 1;

    private static final String DEFAULT_REF_RESIDUES = "AAAAAAAAAA";
    private static final String UPDATED_REF_RESIDUES = "BBBBBBBBBB";

    private static final String DEFAULT_VARIANT_RESIDUES = "AAAAAAAAAA";
    private static final String UPDATED_VARIANT_RESIDUES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/alterations";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private AlterationRepository alterationRepository;

    @Mock
    private AlterationRepository alterationRepositoryMock;

    @Mock
    private AlterationService alterationServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAlterationMockMvc;

    private Alteration alteration;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Alteration createEntity(EntityManager em) {
        Alteration alteration = new Alteration()
            .type(DEFAULT_TYPE)
            .name(DEFAULT_NAME)
            .alteration(DEFAULT_ALTERATION)
            .proteinChange(DEFAULT_PROTEIN_CHANGE)
            .start(DEFAULT_START)
            .end(DEFAULT_END)
            .refResidues(DEFAULT_REF_RESIDUES)
            .variantResidues(DEFAULT_VARIANT_RESIDUES);
        return alteration;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Alteration createUpdatedEntity(EntityManager em) {
        Alteration alteration = new Alteration()
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinChange(UPDATED_PROTEIN_CHANGE)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);
        return alteration;
    }

    @BeforeEach
    public void initTest() {
        alteration = createEntity(em);
    }

    @Test
    @Transactional
    void createAlteration() throws Exception {
        int databaseSizeBeforeCreate = alterationRepository.findAll().size();
        // Create the Alteration
        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isCreated());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeCreate + 1);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(DEFAULT_ALTERATION);
        assertThat(testAlteration.getProteinChange()).isEqualTo(DEFAULT_PROTEIN_CHANGE);
        assertThat(testAlteration.getStart()).isEqualTo(DEFAULT_START);
        assertThat(testAlteration.getEnd()).isEqualTo(DEFAULT_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(DEFAULT_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(DEFAULT_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void createAlterationWithExistingId() throws Exception {
        // Create the Alteration with an existing ID
        alteration.setId(1L);

        int databaseSizeBeforeCreate = alterationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setType(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setName(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAlterationIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setAlteration(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkProteinChangeIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setProteinChange(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAlterations() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alteration.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].alteration").value(hasItem(DEFAULT_ALTERATION)))
            .andExpect(jsonPath("$.[*].proteinChange").value(hasItem(DEFAULT_PROTEIN_CHANGE)))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START)))
            .andExpect(jsonPath("$.[*].end").value(hasItem(DEFAULT_END)))
            .andExpect(jsonPath("$.[*].refResidues").value(hasItem(DEFAULT_REF_RESIDUES)))
            .andExpect(jsonPath("$.[*].variantResidues").value(hasItem(DEFAULT_VARIANT_RESIDUES)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllAlterationsWithEagerRelationshipsIsEnabled() throws Exception {
        when(alterationServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restAlterationMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(alterationServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllAlterationsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(alterationServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restAlterationMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(alterationServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getAlteration() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get the alteration
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL_ID, alteration.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(alteration.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.alteration").value(DEFAULT_ALTERATION))
            .andExpect(jsonPath("$.proteinChange").value(DEFAULT_PROTEIN_CHANGE))
            .andExpect(jsonPath("$.start").value(DEFAULT_START))
            .andExpect(jsonPath("$.end").value(DEFAULT_END))
            .andExpect(jsonPath("$.refResidues").value(DEFAULT_REF_RESIDUES))
            .andExpect(jsonPath("$.variantResidues").value(DEFAULT_VARIANT_RESIDUES));
    }

    @Test
    @Transactional
    void getAlterationsByIdFiltering() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        Long id = alteration.getId();

        defaultAlterationShouldBeFound("id.equals=" + id);
        defaultAlterationShouldNotBeFound("id.notEquals=" + id);

        defaultAlterationShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultAlterationShouldNotBeFound("id.greaterThan=" + id);

        defaultAlterationShouldBeFound("id.lessThanOrEqual=" + id);
        defaultAlterationShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllAlterationsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where type equals to DEFAULT_TYPE
        defaultAlterationShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the alterationList where type equals to UPDATED_TYPE
        defaultAlterationShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllAlterationsByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where type not equals to DEFAULT_TYPE
        defaultAlterationShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the alterationList where type not equals to UPDATED_TYPE
        defaultAlterationShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllAlterationsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultAlterationShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the alterationList where type equals to UPDATED_TYPE
        defaultAlterationShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllAlterationsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where type is not null
        defaultAlterationShouldBeFound("type.specified=true");

        // Get all the alterationList where type is null
        defaultAlterationShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where name equals to DEFAULT_NAME
        defaultAlterationShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the alterationList where name equals to UPDATED_NAME
        defaultAlterationShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAlterationsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where name not equals to DEFAULT_NAME
        defaultAlterationShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the alterationList where name not equals to UPDATED_NAME
        defaultAlterationShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAlterationsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where name in DEFAULT_NAME or UPDATED_NAME
        defaultAlterationShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the alterationList where name equals to UPDATED_NAME
        defaultAlterationShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAlterationsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where name is not null
        defaultAlterationShouldBeFound("name.specified=true");

        // Get all the alterationList where name is null
        defaultAlterationShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByNameContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where name contains DEFAULT_NAME
        defaultAlterationShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the alterationList where name contains UPDATED_NAME
        defaultAlterationShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAlterationsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where name does not contain DEFAULT_NAME
        defaultAlterationShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the alterationList where name does not contain UPDATED_NAME
        defaultAlterationShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllAlterationsByAlterationIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where alteration equals to DEFAULT_ALTERATION
        defaultAlterationShouldBeFound("alteration.equals=" + DEFAULT_ALTERATION);

        // Get all the alterationList where alteration equals to UPDATED_ALTERATION
        defaultAlterationShouldNotBeFound("alteration.equals=" + UPDATED_ALTERATION);
    }

    @Test
    @Transactional
    void getAllAlterationsByAlterationIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where alteration not equals to DEFAULT_ALTERATION
        defaultAlterationShouldNotBeFound("alteration.notEquals=" + DEFAULT_ALTERATION);

        // Get all the alterationList where alteration not equals to UPDATED_ALTERATION
        defaultAlterationShouldBeFound("alteration.notEquals=" + UPDATED_ALTERATION);
    }

    @Test
    @Transactional
    void getAllAlterationsByAlterationIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where alteration in DEFAULT_ALTERATION or UPDATED_ALTERATION
        defaultAlterationShouldBeFound("alteration.in=" + DEFAULT_ALTERATION + "," + UPDATED_ALTERATION);

        // Get all the alterationList where alteration equals to UPDATED_ALTERATION
        defaultAlterationShouldNotBeFound("alteration.in=" + UPDATED_ALTERATION);
    }

    @Test
    @Transactional
    void getAllAlterationsByAlterationIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where alteration is not null
        defaultAlterationShouldBeFound("alteration.specified=true");

        // Get all the alterationList where alteration is null
        defaultAlterationShouldNotBeFound("alteration.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByAlterationContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where alteration contains DEFAULT_ALTERATION
        defaultAlterationShouldBeFound("alteration.contains=" + DEFAULT_ALTERATION);

        // Get all the alterationList where alteration contains UPDATED_ALTERATION
        defaultAlterationShouldNotBeFound("alteration.contains=" + UPDATED_ALTERATION);
    }

    @Test
    @Transactional
    void getAllAlterationsByAlterationNotContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where alteration does not contain DEFAULT_ALTERATION
        defaultAlterationShouldNotBeFound("alteration.doesNotContain=" + DEFAULT_ALTERATION);

        // Get all the alterationList where alteration does not contain UPDATED_ALTERATION
        defaultAlterationShouldBeFound("alteration.doesNotContain=" + UPDATED_ALTERATION);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinChangeIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinChange equals to DEFAULT_PROTEIN_CHANGE
        defaultAlterationShouldBeFound("proteinChange.equals=" + DEFAULT_PROTEIN_CHANGE);

        // Get all the alterationList where proteinChange equals to UPDATED_PROTEIN_CHANGE
        defaultAlterationShouldNotBeFound("proteinChange.equals=" + UPDATED_PROTEIN_CHANGE);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinChangeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinChange not equals to DEFAULT_PROTEIN_CHANGE
        defaultAlterationShouldNotBeFound("proteinChange.notEquals=" + DEFAULT_PROTEIN_CHANGE);

        // Get all the alterationList where proteinChange not equals to UPDATED_PROTEIN_CHANGE
        defaultAlterationShouldBeFound("proteinChange.notEquals=" + UPDATED_PROTEIN_CHANGE);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinChangeIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinChange in DEFAULT_PROTEIN_CHANGE or UPDATED_PROTEIN_CHANGE
        defaultAlterationShouldBeFound("proteinChange.in=" + DEFAULT_PROTEIN_CHANGE + "," + UPDATED_PROTEIN_CHANGE);

        // Get all the alterationList where proteinChange equals to UPDATED_PROTEIN_CHANGE
        defaultAlterationShouldNotBeFound("proteinChange.in=" + UPDATED_PROTEIN_CHANGE);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinChangeIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinChange is not null
        defaultAlterationShouldBeFound("proteinChange.specified=true");

        // Get all the alterationList where proteinChange is null
        defaultAlterationShouldNotBeFound("proteinChange.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinChangeContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinChange contains DEFAULT_PROTEIN_CHANGE
        defaultAlterationShouldBeFound("proteinChange.contains=" + DEFAULT_PROTEIN_CHANGE);

        // Get all the alterationList where proteinChange contains UPDATED_PROTEIN_CHANGE
        defaultAlterationShouldNotBeFound("proteinChange.contains=" + UPDATED_PROTEIN_CHANGE);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinChangeNotContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinChange does not contain DEFAULT_PROTEIN_CHANGE
        defaultAlterationShouldNotBeFound("proteinChange.doesNotContain=" + DEFAULT_PROTEIN_CHANGE);

        // Get all the alterationList where proteinChange does not contain UPDATED_PROTEIN_CHANGE
        defaultAlterationShouldBeFound("proteinChange.doesNotContain=" + UPDATED_PROTEIN_CHANGE);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start equals to DEFAULT_START
        defaultAlterationShouldBeFound("start.equals=" + DEFAULT_START);

        // Get all the alterationList where start equals to UPDATED_START
        defaultAlterationShouldNotBeFound("start.equals=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start not equals to DEFAULT_START
        defaultAlterationShouldNotBeFound("start.notEquals=" + DEFAULT_START);

        // Get all the alterationList where start not equals to UPDATED_START
        defaultAlterationShouldBeFound("start.notEquals=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start in DEFAULT_START or UPDATED_START
        defaultAlterationShouldBeFound("start.in=" + DEFAULT_START + "," + UPDATED_START);

        // Get all the alterationList where start equals to UPDATED_START
        defaultAlterationShouldNotBeFound("start.in=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start is not null
        defaultAlterationShouldBeFound("start.specified=true");

        // Get all the alterationList where start is null
        defaultAlterationShouldNotBeFound("start.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start is greater than or equal to DEFAULT_START
        defaultAlterationShouldBeFound("start.greaterThanOrEqual=" + DEFAULT_START);

        // Get all the alterationList where start is greater than or equal to UPDATED_START
        defaultAlterationShouldNotBeFound("start.greaterThanOrEqual=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start is less than or equal to DEFAULT_START
        defaultAlterationShouldBeFound("start.lessThanOrEqual=" + DEFAULT_START);

        // Get all the alterationList where start is less than or equal to SMALLER_START
        defaultAlterationShouldNotBeFound("start.lessThanOrEqual=" + SMALLER_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsLessThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start is less than DEFAULT_START
        defaultAlterationShouldNotBeFound("start.lessThan=" + DEFAULT_START);

        // Get all the alterationList where start is less than UPDATED_START
        defaultAlterationShouldBeFound("start.lessThan=" + UPDATED_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByStartIsGreaterThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where start is greater than DEFAULT_START
        defaultAlterationShouldNotBeFound("start.greaterThan=" + DEFAULT_START);

        // Get all the alterationList where start is greater than SMALLER_START
        defaultAlterationShouldBeFound("start.greaterThan=" + SMALLER_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end equals to DEFAULT_END
        defaultAlterationShouldBeFound("end.equals=" + DEFAULT_END);

        // Get all the alterationList where end equals to UPDATED_END
        defaultAlterationShouldNotBeFound("end.equals=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end not equals to DEFAULT_END
        defaultAlterationShouldNotBeFound("end.notEquals=" + DEFAULT_END);

        // Get all the alterationList where end not equals to UPDATED_END
        defaultAlterationShouldBeFound("end.notEquals=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end in DEFAULT_END or UPDATED_END
        defaultAlterationShouldBeFound("end.in=" + DEFAULT_END + "," + UPDATED_END);

        // Get all the alterationList where end equals to UPDATED_END
        defaultAlterationShouldNotBeFound("end.in=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end is not null
        defaultAlterationShouldBeFound("end.specified=true");

        // Get all the alterationList where end is null
        defaultAlterationShouldNotBeFound("end.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end is greater than or equal to DEFAULT_END
        defaultAlterationShouldBeFound("end.greaterThanOrEqual=" + DEFAULT_END);

        // Get all the alterationList where end is greater than or equal to UPDATED_END
        defaultAlterationShouldNotBeFound("end.greaterThanOrEqual=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end is less than or equal to DEFAULT_END
        defaultAlterationShouldBeFound("end.lessThanOrEqual=" + DEFAULT_END);

        // Get all the alterationList where end is less than or equal to SMALLER_END
        defaultAlterationShouldNotBeFound("end.lessThanOrEqual=" + SMALLER_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsLessThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end is less than DEFAULT_END
        defaultAlterationShouldNotBeFound("end.lessThan=" + DEFAULT_END);

        // Get all the alterationList where end is less than UPDATED_END
        defaultAlterationShouldBeFound("end.lessThan=" + UPDATED_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByEndIsGreaterThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where end is greater than DEFAULT_END
        defaultAlterationShouldNotBeFound("end.greaterThan=" + DEFAULT_END);

        // Get all the alterationList where end is greater than SMALLER_END
        defaultAlterationShouldBeFound("end.greaterThan=" + SMALLER_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByRefResiduesIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where refResidues equals to DEFAULT_REF_RESIDUES
        defaultAlterationShouldBeFound("refResidues.equals=" + DEFAULT_REF_RESIDUES);

        // Get all the alterationList where refResidues equals to UPDATED_REF_RESIDUES
        defaultAlterationShouldNotBeFound("refResidues.equals=" + UPDATED_REF_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByRefResiduesIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where refResidues not equals to DEFAULT_REF_RESIDUES
        defaultAlterationShouldNotBeFound("refResidues.notEquals=" + DEFAULT_REF_RESIDUES);

        // Get all the alterationList where refResidues not equals to UPDATED_REF_RESIDUES
        defaultAlterationShouldBeFound("refResidues.notEquals=" + UPDATED_REF_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByRefResiduesIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where refResidues in DEFAULT_REF_RESIDUES or UPDATED_REF_RESIDUES
        defaultAlterationShouldBeFound("refResidues.in=" + DEFAULT_REF_RESIDUES + "," + UPDATED_REF_RESIDUES);

        // Get all the alterationList where refResidues equals to UPDATED_REF_RESIDUES
        defaultAlterationShouldNotBeFound("refResidues.in=" + UPDATED_REF_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByRefResiduesIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where refResidues is not null
        defaultAlterationShouldBeFound("refResidues.specified=true");

        // Get all the alterationList where refResidues is null
        defaultAlterationShouldNotBeFound("refResidues.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByRefResiduesContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where refResidues contains DEFAULT_REF_RESIDUES
        defaultAlterationShouldBeFound("refResidues.contains=" + DEFAULT_REF_RESIDUES);

        // Get all the alterationList where refResidues contains UPDATED_REF_RESIDUES
        defaultAlterationShouldNotBeFound("refResidues.contains=" + UPDATED_REF_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByRefResiduesNotContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where refResidues does not contain DEFAULT_REF_RESIDUES
        defaultAlterationShouldNotBeFound("refResidues.doesNotContain=" + DEFAULT_REF_RESIDUES);

        // Get all the alterationList where refResidues does not contain UPDATED_REF_RESIDUES
        defaultAlterationShouldBeFound("refResidues.doesNotContain=" + UPDATED_REF_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByVariantResiduesIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where variantResidues equals to DEFAULT_VARIANT_RESIDUES
        defaultAlterationShouldBeFound("variantResidues.equals=" + DEFAULT_VARIANT_RESIDUES);

        // Get all the alterationList where variantResidues equals to UPDATED_VARIANT_RESIDUES
        defaultAlterationShouldNotBeFound("variantResidues.equals=" + UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByVariantResiduesIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where variantResidues not equals to DEFAULT_VARIANT_RESIDUES
        defaultAlterationShouldNotBeFound("variantResidues.notEquals=" + DEFAULT_VARIANT_RESIDUES);

        // Get all the alterationList where variantResidues not equals to UPDATED_VARIANT_RESIDUES
        defaultAlterationShouldBeFound("variantResidues.notEquals=" + UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByVariantResiduesIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where variantResidues in DEFAULT_VARIANT_RESIDUES or UPDATED_VARIANT_RESIDUES
        defaultAlterationShouldBeFound("variantResidues.in=" + DEFAULT_VARIANT_RESIDUES + "," + UPDATED_VARIANT_RESIDUES);

        // Get all the alterationList where variantResidues equals to UPDATED_VARIANT_RESIDUES
        defaultAlterationShouldNotBeFound("variantResidues.in=" + UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByVariantResiduesIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where variantResidues is not null
        defaultAlterationShouldBeFound("variantResidues.specified=true");

        // Get all the alterationList where variantResidues is null
        defaultAlterationShouldNotBeFound("variantResidues.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByVariantResiduesContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where variantResidues contains DEFAULT_VARIANT_RESIDUES
        defaultAlterationShouldBeFound("variantResidues.contains=" + DEFAULT_VARIANT_RESIDUES);

        // Get all the alterationList where variantResidues contains UPDATED_VARIANT_RESIDUES
        defaultAlterationShouldNotBeFound("variantResidues.contains=" + UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByVariantResiduesNotContainsSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where variantResidues does not contain DEFAULT_VARIANT_RESIDUES
        defaultAlterationShouldNotBeFound("variantResidues.doesNotContain=" + DEFAULT_VARIANT_RESIDUES);

        // Get all the alterationList where variantResidues does not contain UPDATED_VARIANT_RESIDUES
        defaultAlterationShouldBeFound("variantResidues.doesNotContain=" + UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void getAllAlterationsByGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);
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
        alteration.addGene(gene);
        alterationRepository.saveAndFlush(alteration);
        Long geneId = gene.getId();

        // Get all the alterationList where gene equals to geneId
        defaultAlterationShouldBeFound("geneId.equals=" + geneId);

        // Get all the alterationList where gene equals to (geneId + 1)
        defaultAlterationShouldNotBeFound("geneId.equals=" + (geneId + 1));
    }

    @Test
    @Transactional
    void getAllAlterationsByTranscriptIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);
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
        alteration.addTranscript(transcript);
        alterationRepository.saveAndFlush(alteration);
        Long transcriptId = transcript.getId();

        // Get all the alterationList where transcript equals to transcriptId
        defaultAlterationShouldBeFound("transcriptId.equals=" + transcriptId);

        // Get all the alterationList where transcript equals to (transcriptId + 1)
        defaultAlterationShouldNotBeFound("transcriptId.equals=" + (transcriptId + 1));
    }

    @Test
    @Transactional
    void getAllAlterationsByConsequenceIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);
        Consequence consequence;
        if (TestUtil.findAll(em, Consequence.class).isEmpty()) {
            consequence = ConsequenceResourceIT.createEntity(em);
            em.persist(consequence);
            em.flush();
        } else {
            consequence = TestUtil.findAll(em, Consequence.class).get(0);
        }
        em.persist(consequence);
        em.flush();
        alteration.setConsequence(consequence);
        alterationRepository.saveAndFlush(alteration);
        Long consequenceId = consequence.getId();

        // Get all the alterationList where consequence equals to consequenceId
        defaultAlterationShouldBeFound("consequenceId.equals=" + consequenceId);

        // Get all the alterationList where consequence equals to (consequenceId + 1)
        defaultAlterationShouldNotBeFound("consequenceId.equals=" + (consequenceId + 1));
    }

    @Test
    @Transactional
    void getAllAlterationsByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);
        Association association;
        if (TestUtil.findAll(em, Association.class).isEmpty()) {
            association = AssociationResourceIT.createEntity(em);
            em.persist(association);
            em.flush();
        } else {
            association = TestUtil.findAll(em, Association.class).get(0);
        }
        em.persist(association);
        em.flush();
        alteration.addAssociation(association);
        alterationRepository.saveAndFlush(alteration);
        Long associationId = association.getId();

        // Get all the alterationList where association equals to associationId
        defaultAlterationShouldBeFound("associationId.equals=" + associationId);

        // Get all the alterationList where association equals to (associationId + 1)
        defaultAlterationShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultAlterationShouldBeFound(String filter) throws Exception {
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alteration.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].alteration").value(hasItem(DEFAULT_ALTERATION)))
            .andExpect(jsonPath("$.[*].proteinChange").value(hasItem(DEFAULT_PROTEIN_CHANGE)))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START)))
            .andExpect(jsonPath("$.[*].end").value(hasItem(DEFAULT_END)))
            .andExpect(jsonPath("$.[*].refResidues").value(hasItem(DEFAULT_REF_RESIDUES)))
            .andExpect(jsonPath("$.[*].variantResidues").value(hasItem(DEFAULT_VARIANT_RESIDUES)));

        // Check, that the count call also returns 1
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultAlterationShouldNotBeFound(String filter) throws Exception {
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingAlteration() throws Exception {
        // Get the alteration
        restAlterationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewAlteration() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();

        // Update the alteration
        Alteration updatedAlteration = alterationRepository.findById(alteration.getId()).get();
        // Disconnect from session so that the updates on updatedAlteration are not directly saved in db
        em.detach(updatedAlteration);
        updatedAlteration
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinChange(UPDATED_PROTEIN_CHANGE)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);

        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedAlteration.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedAlteration))
            )
            .andExpect(status().isOk());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinChange()).isEqualTo(UPDATED_PROTEIN_CHANGE);
        assertThat(testAlteration.getStart()).isEqualTo(UPDATED_START);
        assertThat(testAlteration.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(UPDATED_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void putNonExistingAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, alteration.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAlterationWithPatch() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();

        // Update the alteration using partial update
        Alteration partialUpdatedAlteration = new Alteration();
        partialUpdatedAlteration.setId(alteration.getId());

        partialUpdatedAlteration
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .proteinChange(UPDATED_PROTEIN_CHANGE)
            .end(UPDATED_END)
            .refResidues(UPDATED_REF_RESIDUES);

        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlteration))
            )
            .andExpect(status().isOk());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(DEFAULT_ALTERATION);
        assertThat(testAlteration.getProteinChange()).isEqualTo(UPDATED_PROTEIN_CHANGE);
        assertThat(testAlteration.getStart()).isEqualTo(DEFAULT_START);
        assertThat(testAlteration.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(UPDATED_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(DEFAULT_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void fullUpdateAlterationWithPatch() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();

        // Update the alteration using partial update
        Alteration partialUpdatedAlteration = new Alteration();
        partialUpdatedAlteration.setId(alteration.getId());

        partialUpdatedAlteration
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinChange(UPDATED_PROTEIN_CHANGE)
            .start(UPDATED_START)
            .end(UPDATED_END)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);

        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlteration))
            )
            .andExpect(status().isOk());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinChange()).isEqualTo(UPDATED_PROTEIN_CHANGE);
        assertThat(testAlteration.getStart()).isEqualTo(UPDATED_START);
        assertThat(testAlteration.getEnd()).isEqualTo(UPDATED_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(UPDATED_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void patchNonExistingAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, alteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAlteration() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeDelete = alterationRepository.findAll().size();

        // Delete the alteration
        restAlterationMockMvc
            .perform(delete(ENTITY_API_URL_ID, alteration.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
