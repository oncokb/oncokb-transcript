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
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.repository.ConsequenceRepository;
import org.mskcc.oncokb.curation.service.criteria.ConsequenceCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ConsequenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ConsequenceResourceIT {

    private static final AlterationType DEFAULT_ALTERATION_TYPE = AlterationType.GENOMIC_CHANGE;
    private static final AlterationType UPDATED_ALTERATION_TYPE = AlterationType.CDNA_CHANGE;

    private static final String DEFAULT_TERM = "AAAAAAAAAA";
    private static final String UPDATED_TERM = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_GENERALLY_TRUNCATING = false;
    private static final Boolean UPDATED_IS_GENERALLY_TRUNCATING = true;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/consequences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ConsequenceRepository consequenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restConsequenceMockMvc;

    private Consequence consequence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Consequence createEntity(EntityManager em) {
        Consequence consequence = new Consequence()
            .alterationType(DEFAULT_ALTERATION_TYPE)
            .term(DEFAULT_TERM)
            .name(DEFAULT_NAME)
            .isGenerallyTruncating(DEFAULT_IS_GENERALLY_TRUNCATING)
            .description(DEFAULT_DESCRIPTION);
        return consequence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Consequence createUpdatedEntity(EntityManager em) {
        Consequence consequence = new Consequence()
            .alterationType(UPDATED_ALTERATION_TYPE)
            .term(UPDATED_TERM)
            .name(UPDATED_NAME)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);
        return consequence;
    }

    @BeforeEach
    public void initTest() {
        consequence = createEntity(em);
    }

    @Test
    @Transactional
    void createConsequence() throws Exception {
        int databaseSizeBeforeCreate = consequenceRepository.findAll().size();
        // Create the Consequence
        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isCreated());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeCreate + 1);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getAlterationType()).isEqualTo(DEFAULT_ALTERATION_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(DEFAULT_TERM);
        assertThat(testConsequence.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(DEFAULT_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createConsequenceWithExistingId() throws Exception {
        // Create the Consequence with an existing ID
        consequence.setId(1L);

        int databaseSizeBeforeCreate = consequenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkAlterationTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setAlterationType(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTermIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setTerm(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setName(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsGenerallyTruncatingIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setIsGenerallyTruncating(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllConsequences() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(consequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].alterationType").value(hasItem(DEFAULT_ALTERATION_TYPE.toString())))
            .andExpect(jsonPath("$.[*].term").value(hasItem(DEFAULT_TERM)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].isGenerallyTruncating").value(hasItem(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getConsequence() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get the consequence
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL_ID, consequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(consequence.getId().intValue()))
            .andExpect(jsonPath("$.alterationType").value(DEFAULT_ALTERATION_TYPE.toString()))
            .andExpect(jsonPath("$.term").value(DEFAULT_TERM))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.isGenerallyTruncating").value(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getConsequencesByIdFiltering() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        Long id = consequence.getId();

        defaultConsequenceShouldBeFound("id.equals=" + id);
        defaultConsequenceShouldNotBeFound("id.notEquals=" + id);

        defaultConsequenceShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultConsequenceShouldNotBeFound("id.greaterThan=" + id);

        defaultConsequenceShouldBeFound("id.lessThanOrEqual=" + id);
        defaultConsequenceShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllConsequencesByAlterationTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where alterationType equals to DEFAULT_ALTERATION_TYPE
        defaultConsequenceShouldBeFound("alterationType.equals=" + DEFAULT_ALTERATION_TYPE);

        // Get all the consequenceList where alterationType equals to UPDATED_ALTERATION_TYPE
        defaultConsequenceShouldNotBeFound("alterationType.equals=" + UPDATED_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void getAllConsequencesByAlterationTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where alterationType not equals to DEFAULT_ALTERATION_TYPE
        defaultConsequenceShouldNotBeFound("alterationType.notEquals=" + DEFAULT_ALTERATION_TYPE);

        // Get all the consequenceList where alterationType not equals to UPDATED_ALTERATION_TYPE
        defaultConsequenceShouldBeFound("alterationType.notEquals=" + UPDATED_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void getAllConsequencesByAlterationTypeIsInShouldWork() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where alterationType in DEFAULT_ALTERATION_TYPE or UPDATED_ALTERATION_TYPE
        defaultConsequenceShouldBeFound("alterationType.in=" + DEFAULT_ALTERATION_TYPE + "," + UPDATED_ALTERATION_TYPE);

        // Get all the consequenceList where alterationType equals to UPDATED_ALTERATION_TYPE
        defaultConsequenceShouldNotBeFound("alterationType.in=" + UPDATED_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void getAllConsequencesByAlterationTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where alterationType is not null
        defaultConsequenceShouldBeFound("alterationType.specified=true");

        // Get all the consequenceList where alterationType is null
        defaultConsequenceShouldNotBeFound("alterationType.specified=false");
    }

    @Test
    @Transactional
    void getAllConsequencesByTermIsEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where term equals to DEFAULT_TERM
        defaultConsequenceShouldBeFound("term.equals=" + DEFAULT_TERM);

        // Get all the consequenceList where term equals to UPDATED_TERM
        defaultConsequenceShouldNotBeFound("term.equals=" + UPDATED_TERM);
    }

    @Test
    @Transactional
    void getAllConsequencesByTermIsNotEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where term not equals to DEFAULT_TERM
        defaultConsequenceShouldNotBeFound("term.notEquals=" + DEFAULT_TERM);

        // Get all the consequenceList where term not equals to UPDATED_TERM
        defaultConsequenceShouldBeFound("term.notEquals=" + UPDATED_TERM);
    }

    @Test
    @Transactional
    void getAllConsequencesByTermIsInShouldWork() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where term in DEFAULT_TERM or UPDATED_TERM
        defaultConsequenceShouldBeFound("term.in=" + DEFAULT_TERM + "," + UPDATED_TERM);

        // Get all the consequenceList where term equals to UPDATED_TERM
        defaultConsequenceShouldNotBeFound("term.in=" + UPDATED_TERM);
    }

    @Test
    @Transactional
    void getAllConsequencesByTermIsNullOrNotNull() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where term is not null
        defaultConsequenceShouldBeFound("term.specified=true");

        // Get all the consequenceList where term is null
        defaultConsequenceShouldNotBeFound("term.specified=false");
    }

    @Test
    @Transactional
    void getAllConsequencesByTermContainsSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where term contains DEFAULT_TERM
        defaultConsequenceShouldBeFound("term.contains=" + DEFAULT_TERM);

        // Get all the consequenceList where term contains UPDATED_TERM
        defaultConsequenceShouldNotBeFound("term.contains=" + UPDATED_TERM);
    }

    @Test
    @Transactional
    void getAllConsequencesByTermNotContainsSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where term does not contain DEFAULT_TERM
        defaultConsequenceShouldNotBeFound("term.doesNotContain=" + DEFAULT_TERM);

        // Get all the consequenceList where term does not contain UPDATED_TERM
        defaultConsequenceShouldBeFound("term.doesNotContain=" + UPDATED_TERM);
    }

    @Test
    @Transactional
    void getAllConsequencesByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where name equals to DEFAULT_NAME
        defaultConsequenceShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the consequenceList where name equals to UPDATED_NAME
        defaultConsequenceShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllConsequencesByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where name not equals to DEFAULT_NAME
        defaultConsequenceShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the consequenceList where name not equals to UPDATED_NAME
        defaultConsequenceShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllConsequencesByNameIsInShouldWork() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where name in DEFAULT_NAME or UPDATED_NAME
        defaultConsequenceShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the consequenceList where name equals to UPDATED_NAME
        defaultConsequenceShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllConsequencesByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where name is not null
        defaultConsequenceShouldBeFound("name.specified=true");

        // Get all the consequenceList where name is null
        defaultConsequenceShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllConsequencesByNameContainsSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where name contains DEFAULT_NAME
        defaultConsequenceShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the consequenceList where name contains UPDATED_NAME
        defaultConsequenceShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllConsequencesByNameNotContainsSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where name does not contain DEFAULT_NAME
        defaultConsequenceShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the consequenceList where name does not contain UPDATED_NAME
        defaultConsequenceShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllConsequencesByIsGenerallyTruncatingIsEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where isGenerallyTruncating equals to DEFAULT_IS_GENERALLY_TRUNCATING
        defaultConsequenceShouldBeFound("isGenerallyTruncating.equals=" + DEFAULT_IS_GENERALLY_TRUNCATING);

        // Get all the consequenceList where isGenerallyTruncating equals to UPDATED_IS_GENERALLY_TRUNCATING
        defaultConsequenceShouldNotBeFound("isGenerallyTruncating.equals=" + UPDATED_IS_GENERALLY_TRUNCATING);
    }

    @Test
    @Transactional
    void getAllConsequencesByIsGenerallyTruncatingIsNotEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where isGenerallyTruncating not equals to DEFAULT_IS_GENERALLY_TRUNCATING
        defaultConsequenceShouldNotBeFound("isGenerallyTruncating.notEquals=" + DEFAULT_IS_GENERALLY_TRUNCATING);

        // Get all the consequenceList where isGenerallyTruncating not equals to UPDATED_IS_GENERALLY_TRUNCATING
        defaultConsequenceShouldBeFound("isGenerallyTruncating.notEquals=" + UPDATED_IS_GENERALLY_TRUNCATING);
    }

    @Test
    @Transactional
    void getAllConsequencesByIsGenerallyTruncatingIsInShouldWork() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where isGenerallyTruncating in DEFAULT_IS_GENERALLY_TRUNCATING or UPDATED_IS_GENERALLY_TRUNCATING
        defaultConsequenceShouldBeFound(
            "isGenerallyTruncating.in=" + DEFAULT_IS_GENERALLY_TRUNCATING + "," + UPDATED_IS_GENERALLY_TRUNCATING
        );

        // Get all the consequenceList where isGenerallyTruncating equals to UPDATED_IS_GENERALLY_TRUNCATING
        defaultConsequenceShouldNotBeFound("isGenerallyTruncating.in=" + UPDATED_IS_GENERALLY_TRUNCATING);
    }

    @Test
    @Transactional
    void getAllConsequencesByIsGenerallyTruncatingIsNullOrNotNull() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where isGenerallyTruncating is not null
        defaultConsequenceShouldBeFound("isGenerallyTruncating.specified=true");

        // Get all the consequenceList where isGenerallyTruncating is null
        defaultConsequenceShouldNotBeFound("isGenerallyTruncating.specified=false");
    }

    @Test
    @Transactional
    void getAllConsequencesByDescriptionIsEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where description equals to DEFAULT_DESCRIPTION
        defaultConsequenceShouldBeFound("description.equals=" + DEFAULT_DESCRIPTION);

        // Get all the consequenceList where description equals to UPDATED_DESCRIPTION
        defaultConsequenceShouldNotBeFound("description.equals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllConsequencesByDescriptionIsNotEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where description not equals to DEFAULT_DESCRIPTION
        defaultConsequenceShouldNotBeFound("description.notEquals=" + DEFAULT_DESCRIPTION);

        // Get all the consequenceList where description not equals to UPDATED_DESCRIPTION
        defaultConsequenceShouldBeFound("description.notEquals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllConsequencesByDescriptionIsInShouldWork() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where description in DEFAULT_DESCRIPTION or UPDATED_DESCRIPTION
        defaultConsequenceShouldBeFound("description.in=" + DEFAULT_DESCRIPTION + "," + UPDATED_DESCRIPTION);

        // Get all the consequenceList where description equals to UPDATED_DESCRIPTION
        defaultConsequenceShouldNotBeFound("description.in=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllConsequencesByDescriptionIsNullOrNotNull() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where description is not null
        defaultConsequenceShouldBeFound("description.specified=true");

        // Get all the consequenceList where description is null
        defaultConsequenceShouldNotBeFound("description.specified=false");
    }

    @Test
    @Transactional
    void getAllConsequencesByDescriptionContainsSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where description contains DEFAULT_DESCRIPTION
        defaultConsequenceShouldBeFound("description.contains=" + DEFAULT_DESCRIPTION);

        // Get all the consequenceList where description contains UPDATED_DESCRIPTION
        defaultConsequenceShouldNotBeFound("description.contains=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllConsequencesByDescriptionNotContainsSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList where description does not contain DEFAULT_DESCRIPTION
        defaultConsequenceShouldNotBeFound("description.doesNotContain=" + DEFAULT_DESCRIPTION);

        // Get all the consequenceList where description does not contain UPDATED_DESCRIPTION
        defaultConsequenceShouldBeFound("description.doesNotContain=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllConsequencesByAlterationIsEqualToSomething() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);
        Alteration alteration;
        if (TestUtil.findAll(em, Alteration.class).isEmpty()) {
            alteration = AlterationResourceIT.createEntity(em);
            em.persist(alteration);
            em.flush();
        } else {
            alteration = TestUtil.findAll(em, Alteration.class).get(0);
        }
        em.persist(alteration);
        em.flush();
        consequence.addAlteration(alteration);
        consequenceRepository.saveAndFlush(consequence);
        Long alterationId = alteration.getId();

        // Get all the consequenceList where alteration equals to alterationId
        defaultConsequenceShouldBeFound("alterationId.equals=" + alterationId);

        // Get all the consequenceList where alteration equals to (alterationId + 1)
        defaultConsequenceShouldNotBeFound("alterationId.equals=" + (alterationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultConsequenceShouldBeFound(String filter) throws Exception {
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(consequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].alterationType").value(hasItem(DEFAULT_ALTERATION_TYPE.toString())))
            .andExpect(jsonPath("$.[*].term").value(hasItem(DEFAULT_TERM)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].isGenerallyTruncating").value(hasItem(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));

        // Check, that the count call also returns 1
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultConsequenceShouldNotBeFound(String filter) throws Exception {
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingConsequence() throws Exception {
        // Get the consequence
        restConsequenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewConsequence() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();

        // Update the consequence
        Consequence updatedConsequence = consequenceRepository.findById(consequence.getId()).get();
        // Disconnect from session so that the updates on updatedConsequence are not directly saved in db
        em.detach(updatedConsequence);
        updatedConsequence
            .alterationType(UPDATED_ALTERATION_TYPE)
            .term(UPDATED_TERM)
            .name(UPDATED_NAME)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);

        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedConsequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedConsequence))
            )
            .andExpect(status().isOk());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getAlterationType()).isEqualTo(UPDATED_ALTERATION_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testConsequence.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, consequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateConsequenceWithPatch() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();

        // Update the consequence using partial update
        Consequence partialUpdatedConsequence = new Consequence();
        partialUpdatedConsequence.setId(consequence.getId());

        partialUpdatedConsequence.alterationType(UPDATED_ALTERATION_TYPE).term(UPDATED_TERM).name(UPDATED_NAME);

        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedConsequence))
            )
            .andExpect(status().isOk());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getAlterationType()).isEqualTo(UPDATED_ALTERATION_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testConsequence.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(DEFAULT_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateConsequenceWithPatch() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();

        // Update the consequence using partial update
        Consequence partialUpdatedConsequence = new Consequence();
        partialUpdatedConsequence.setId(consequence.getId());

        partialUpdatedConsequence
            .alterationType(UPDATED_ALTERATION_TYPE)
            .term(UPDATED_TERM)
            .name(UPDATED_NAME)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);

        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedConsequence))
            )
            .andExpect(status().isOk());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getAlterationType()).isEqualTo(UPDATED_ALTERATION_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testConsequence.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, consequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteConsequence() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeDelete = consequenceRepository.findAll().size();

        // Delete the consequence
        restConsequenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, consequence.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
