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
import org.mskcc.oncokb.curation.domain.AlterationReferenceGenome;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.Gene;
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

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ALTERATION = "AAAAAAAAAA";
    private static final String UPDATED_ALTERATION = "BBBBBBBBBB";

    private static final Integer DEFAULT_PROTEIN_START = 1;
    private static final Integer UPDATED_PROTEIN_START = 2;
    private static final Integer SMALLER_PROTEIN_START = 1 - 1;

    private static final Integer DEFAULT_PROTEIN_END = 1;
    private static final Integer UPDATED_PROTEIN_END = 2;
    private static final Integer SMALLER_PROTEIN_END = 1 - 1;

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
            .name(DEFAULT_NAME)
            .alteration(DEFAULT_ALTERATION)
            .proteinStart(DEFAULT_PROTEIN_START)
            .proteinEnd(DEFAULT_PROTEIN_END)
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
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinStart(UPDATED_PROTEIN_START)
            .proteinEnd(UPDATED_PROTEIN_END)
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
        assertThat(testAlteration.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(DEFAULT_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(DEFAULT_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(DEFAULT_PROTEIN_END);
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
    void getAllAlterations() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alteration.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].alteration").value(hasItem(DEFAULT_ALTERATION)))
            .andExpect(jsonPath("$.[*].proteinStart").value(hasItem(DEFAULT_PROTEIN_START)))
            .andExpect(jsonPath("$.[*].proteinEnd").value(hasItem(DEFAULT_PROTEIN_END)))
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
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.alteration").value(DEFAULT_ALTERATION))
            .andExpect(jsonPath("$.proteinStart").value(DEFAULT_PROTEIN_START))
            .andExpect(jsonPath("$.proteinEnd").value(DEFAULT_PROTEIN_END))
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
    void getAllAlterationsByProteinStartIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart equals to DEFAULT_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.equals=" + DEFAULT_PROTEIN_START);

        // Get all the alterationList where proteinStart equals to UPDATED_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.equals=" + UPDATED_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart not equals to DEFAULT_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.notEquals=" + DEFAULT_PROTEIN_START);

        // Get all the alterationList where proteinStart not equals to UPDATED_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.notEquals=" + UPDATED_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart in DEFAULT_PROTEIN_START or UPDATED_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.in=" + DEFAULT_PROTEIN_START + "," + UPDATED_PROTEIN_START);

        // Get all the alterationList where proteinStart equals to UPDATED_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.in=" + UPDATED_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart is not null
        defaultAlterationShouldBeFound("proteinStart.specified=true");

        // Get all the alterationList where proteinStart is null
        defaultAlterationShouldNotBeFound("proteinStart.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart is greater than or equal to DEFAULT_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.greaterThanOrEqual=" + DEFAULT_PROTEIN_START);

        // Get all the alterationList where proteinStart is greater than or equal to UPDATED_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.greaterThanOrEqual=" + UPDATED_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart is less than or equal to DEFAULT_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.lessThanOrEqual=" + DEFAULT_PROTEIN_START);

        // Get all the alterationList where proteinStart is less than or equal to SMALLER_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.lessThanOrEqual=" + SMALLER_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsLessThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart is less than DEFAULT_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.lessThan=" + DEFAULT_PROTEIN_START);

        // Get all the alterationList where proteinStart is less than UPDATED_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.lessThan=" + UPDATED_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinStartIsGreaterThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinStart is greater than DEFAULT_PROTEIN_START
        defaultAlterationShouldNotBeFound("proteinStart.greaterThan=" + DEFAULT_PROTEIN_START);

        // Get all the alterationList where proteinStart is greater than SMALLER_PROTEIN_START
        defaultAlterationShouldBeFound("proteinStart.greaterThan=" + SMALLER_PROTEIN_START);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd equals to DEFAULT_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.equals=" + DEFAULT_PROTEIN_END);

        // Get all the alterationList where proteinEnd equals to UPDATED_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.equals=" + UPDATED_PROTEIN_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsNotEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd not equals to DEFAULT_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.notEquals=" + DEFAULT_PROTEIN_END);

        // Get all the alterationList where proteinEnd not equals to UPDATED_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.notEquals=" + UPDATED_PROTEIN_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsInShouldWork() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd in DEFAULT_PROTEIN_END or UPDATED_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.in=" + DEFAULT_PROTEIN_END + "," + UPDATED_PROTEIN_END);

        // Get all the alterationList where proteinEnd equals to UPDATED_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.in=" + UPDATED_PROTEIN_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsNullOrNotNull() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd is not null
        defaultAlterationShouldBeFound("proteinEnd.specified=true");

        // Get all the alterationList where proteinEnd is null
        defaultAlterationShouldNotBeFound("proteinEnd.specified=false");
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd is greater than or equal to DEFAULT_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.greaterThanOrEqual=" + DEFAULT_PROTEIN_END);

        // Get all the alterationList where proteinEnd is greater than or equal to UPDATED_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.greaterThanOrEqual=" + UPDATED_PROTEIN_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd is less than or equal to DEFAULT_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.lessThanOrEqual=" + DEFAULT_PROTEIN_END);

        // Get all the alterationList where proteinEnd is less than or equal to SMALLER_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.lessThanOrEqual=" + SMALLER_PROTEIN_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsLessThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd is less than DEFAULT_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.lessThan=" + DEFAULT_PROTEIN_END);

        // Get all the alterationList where proteinEnd is less than UPDATED_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.lessThan=" + UPDATED_PROTEIN_END);
    }

    @Test
    @Transactional
    void getAllAlterationsByProteinEndIsGreaterThanSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList where proteinEnd is greater than DEFAULT_PROTEIN_END
        defaultAlterationShouldNotBeFound("proteinEnd.greaterThan=" + DEFAULT_PROTEIN_END);

        // Get all the alterationList where proteinEnd is greater than SMALLER_PROTEIN_END
        defaultAlterationShouldBeFound("proteinEnd.greaterThan=" + SMALLER_PROTEIN_END);
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
    void getAllAlterationsByBiomarkerAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);
        BiomarkerAssociation biomarkerAssociation;
        if (TestUtil.findAll(em, BiomarkerAssociation.class).isEmpty()) {
            biomarkerAssociation = BiomarkerAssociationResourceIT.createEntity(em);
            em.persist(biomarkerAssociation);
            em.flush();
        } else {
            biomarkerAssociation = TestUtil.findAll(em, BiomarkerAssociation.class).get(0);
        }
        em.persist(biomarkerAssociation);
        em.flush();
        alteration.addBiomarkerAssociation(biomarkerAssociation);
        alterationRepository.saveAndFlush(alteration);
        Long biomarkerAssociationId = biomarkerAssociation.getId();

        // Get all the alterationList where biomarkerAssociation equals to biomarkerAssociationId
        defaultAlterationShouldBeFound("biomarkerAssociationId.equals=" + biomarkerAssociationId);

        // Get all the alterationList where biomarkerAssociation equals to (biomarkerAssociationId + 1)
        defaultAlterationShouldNotBeFound("biomarkerAssociationId.equals=" + (biomarkerAssociationId + 1));
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

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultAlterationShouldBeFound(String filter) throws Exception {
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alteration.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].alteration").value(hasItem(DEFAULT_ALTERATION)))
            .andExpect(jsonPath("$.[*].proteinStart").value(hasItem(DEFAULT_PROTEIN_START)))
            .andExpect(jsonPath("$.[*].proteinEnd").value(hasItem(DEFAULT_PROTEIN_END)))
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
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinStart(UPDATED_PROTEIN_START)
            .proteinEnd(UPDATED_PROTEIN_END)
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
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(UPDATED_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(UPDATED_PROTEIN_END);
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
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinEnd(UPDATED_PROTEIN_END)
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
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(DEFAULT_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(UPDATED_PROTEIN_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(DEFAULT_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(UPDATED_VARIANT_RESIDUES);
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
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinStart(UPDATED_PROTEIN_START)
            .proteinEnd(UPDATED_PROTEIN_END)
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
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(UPDATED_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(UPDATED_PROTEIN_END);
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
