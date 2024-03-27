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
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.repository.NciThesaurusRepository;
import org.mskcc.oncokb.curation.service.NciThesaurusService;
import org.mskcc.oncokb.curation.service.criteria.NciThesaurusCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link NciThesaurusResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class NciThesaurusResourceIT {

    private static final String DEFAULT_VERSION = "AAAAAAAAAA";
    private static final String UPDATED_VERSION = "BBBBBBBBBB";

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_PREFERRED_NAME = "AAAAAAAAAA";
    private static final String UPDATED_PREFERRED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DISPLAY_NAME = "AAAAAAAAAA";
    private static final String UPDATED_DISPLAY_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/nci-thesauruses";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private NciThesaurusRepository nciThesaurusRepository;

    @Mock
    private NciThesaurusRepository nciThesaurusRepositoryMock;

    @Mock
    private NciThesaurusService nciThesaurusServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNciThesaurusMockMvc;

    private NciThesaurus nciThesaurus;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NciThesaurus createEntity(EntityManager em) {
        NciThesaurus nciThesaurus = new NciThesaurus()
            .version(DEFAULT_VERSION)
            .code(DEFAULT_CODE)
            .preferredName(DEFAULT_PREFERRED_NAME)
            .displayName(DEFAULT_DISPLAY_NAME);
        return nciThesaurus;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NciThesaurus createUpdatedEntity(EntityManager em) {
        NciThesaurus nciThesaurus = new NciThesaurus()
            .version(UPDATED_VERSION)
            .code(UPDATED_CODE)
            .preferredName(UPDATED_PREFERRED_NAME)
            .displayName(UPDATED_DISPLAY_NAME);
        return nciThesaurus;
    }

    @BeforeEach
    public void initTest() {
        nciThesaurus = createEntity(em);
    }

    @Test
    @Transactional
    void createNciThesaurus() throws Exception {
        int databaseSizeBeforeCreate = nciThesaurusRepository.findAll().size();
        // Create the NciThesaurus
        restNciThesaurusMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isCreated());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeCreate + 1);
        NciThesaurus testNciThesaurus = nciThesaurusList.get(nciThesaurusList.size() - 1);
        assertThat(testNciThesaurus.getVersion()).isEqualTo(DEFAULT_VERSION);
        assertThat(testNciThesaurus.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testNciThesaurus.getPreferredName()).isEqualTo(DEFAULT_PREFERRED_NAME);
        assertThat(testNciThesaurus.getDisplayName()).isEqualTo(DEFAULT_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void createNciThesaurusWithExistingId() throws Exception {
        // Create the NciThesaurus with an existing ID
        nciThesaurus.setId(1L);

        int databaseSizeBeforeCreate = nciThesaurusRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNciThesaurusMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkVersionIsRequired() throws Exception {
        int databaseSizeBeforeTest = nciThesaurusRepository.findAll().size();
        // set the field null
        nciThesaurus.setVersion(null);

        // Create the NciThesaurus, which fails.

        restNciThesaurusMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        int databaseSizeBeforeTest = nciThesaurusRepository.findAll().size();
        // set the field null
        nciThesaurus.setCode(null);

        // Create the NciThesaurus, which fails.

        restNciThesaurusMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllNciThesauruses() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList
        restNciThesaurusMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(nciThesaurus.getId().intValue())))
            .andExpect(jsonPath("$.[*].version").value(hasItem(DEFAULT_VERSION)))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].preferredName").value(hasItem(DEFAULT_PREFERRED_NAME)))
            .andExpect(jsonPath("$.[*].displayName").value(hasItem(DEFAULT_DISPLAY_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllNciThesaurusesWithEagerRelationshipsIsEnabled() throws Exception {
        when(nciThesaurusServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restNciThesaurusMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(nciThesaurusServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllNciThesaurusesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(nciThesaurusServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restNciThesaurusMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(nciThesaurusServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getNciThesaurus() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get the nciThesaurus
        restNciThesaurusMockMvc
            .perform(get(ENTITY_API_URL_ID, nciThesaurus.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(nciThesaurus.getId().intValue()))
            .andExpect(jsonPath("$.version").value(DEFAULT_VERSION))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.preferredName").value(DEFAULT_PREFERRED_NAME))
            .andExpect(jsonPath("$.displayName").value(DEFAULT_DISPLAY_NAME));
    }

    @Test
    @Transactional
    void getNciThesaurusesByIdFiltering() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        Long id = nciThesaurus.getId();

        defaultNciThesaurusShouldBeFound("id.equals=" + id);
        defaultNciThesaurusShouldNotBeFound("id.notEquals=" + id);

        defaultNciThesaurusShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultNciThesaurusShouldNotBeFound("id.greaterThan=" + id);

        defaultNciThesaurusShouldBeFound("id.lessThanOrEqual=" + id);
        defaultNciThesaurusShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByVersionIsEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where version equals to DEFAULT_VERSION
        defaultNciThesaurusShouldBeFound("version.equals=" + DEFAULT_VERSION);

        // Get all the nciThesaurusList where version equals to UPDATED_VERSION
        defaultNciThesaurusShouldNotBeFound("version.equals=" + UPDATED_VERSION);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByVersionIsNotEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where version not equals to DEFAULT_VERSION
        defaultNciThesaurusShouldNotBeFound("version.notEquals=" + DEFAULT_VERSION);

        // Get all the nciThesaurusList where version not equals to UPDATED_VERSION
        defaultNciThesaurusShouldBeFound("version.notEquals=" + UPDATED_VERSION);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByVersionIsInShouldWork() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where version in DEFAULT_VERSION or UPDATED_VERSION
        defaultNciThesaurusShouldBeFound("version.in=" + DEFAULT_VERSION + "," + UPDATED_VERSION);

        // Get all the nciThesaurusList where version equals to UPDATED_VERSION
        defaultNciThesaurusShouldNotBeFound("version.in=" + UPDATED_VERSION);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByVersionIsNullOrNotNull() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where version is not null
        defaultNciThesaurusShouldBeFound("version.specified=true");

        // Get all the nciThesaurusList where version is null
        defaultNciThesaurusShouldNotBeFound("version.specified=false");
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByVersionContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where version contains DEFAULT_VERSION
        defaultNciThesaurusShouldBeFound("version.contains=" + DEFAULT_VERSION);

        // Get all the nciThesaurusList where version contains UPDATED_VERSION
        defaultNciThesaurusShouldNotBeFound("version.contains=" + UPDATED_VERSION);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByVersionNotContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where version does not contain DEFAULT_VERSION
        defaultNciThesaurusShouldNotBeFound("version.doesNotContain=" + DEFAULT_VERSION);

        // Get all the nciThesaurusList where version does not contain UPDATED_VERSION
        defaultNciThesaurusShouldBeFound("version.doesNotContain=" + UPDATED_VERSION);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where code equals to DEFAULT_CODE
        defaultNciThesaurusShouldBeFound("code.equals=" + DEFAULT_CODE);

        // Get all the nciThesaurusList where code equals to UPDATED_CODE
        defaultNciThesaurusShouldNotBeFound("code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByCodeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where code not equals to DEFAULT_CODE
        defaultNciThesaurusShouldNotBeFound("code.notEquals=" + DEFAULT_CODE);

        // Get all the nciThesaurusList where code not equals to UPDATED_CODE
        defaultNciThesaurusShouldBeFound("code.notEquals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where code in DEFAULT_CODE or UPDATED_CODE
        defaultNciThesaurusShouldBeFound("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE);

        // Get all the nciThesaurusList where code equals to UPDATED_CODE
        defaultNciThesaurusShouldNotBeFound("code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where code is not null
        defaultNciThesaurusShouldBeFound("code.specified=true");

        // Get all the nciThesaurusList where code is null
        defaultNciThesaurusShouldNotBeFound("code.specified=false");
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByCodeContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where code contains DEFAULT_CODE
        defaultNciThesaurusShouldBeFound("code.contains=" + DEFAULT_CODE);

        // Get all the nciThesaurusList where code contains UPDATED_CODE
        defaultNciThesaurusShouldNotBeFound("code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where code does not contain DEFAULT_CODE
        defaultNciThesaurusShouldNotBeFound("code.doesNotContain=" + DEFAULT_CODE);

        // Get all the nciThesaurusList where code does not contain UPDATED_CODE
        defaultNciThesaurusShouldBeFound("code.doesNotContain=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByPreferredNameIsEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where preferredName equals to DEFAULT_PREFERRED_NAME
        defaultNciThesaurusShouldBeFound("preferredName.equals=" + DEFAULT_PREFERRED_NAME);

        // Get all the nciThesaurusList where preferredName equals to UPDATED_PREFERRED_NAME
        defaultNciThesaurusShouldNotBeFound("preferredName.equals=" + UPDATED_PREFERRED_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByPreferredNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where preferredName not equals to DEFAULT_PREFERRED_NAME
        defaultNciThesaurusShouldNotBeFound("preferredName.notEquals=" + DEFAULT_PREFERRED_NAME);

        // Get all the nciThesaurusList where preferredName not equals to UPDATED_PREFERRED_NAME
        defaultNciThesaurusShouldBeFound("preferredName.notEquals=" + UPDATED_PREFERRED_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByPreferredNameIsInShouldWork() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where preferredName in DEFAULT_PREFERRED_NAME or UPDATED_PREFERRED_NAME
        defaultNciThesaurusShouldBeFound("preferredName.in=" + DEFAULT_PREFERRED_NAME + "," + UPDATED_PREFERRED_NAME);

        // Get all the nciThesaurusList where preferredName equals to UPDATED_PREFERRED_NAME
        defaultNciThesaurusShouldNotBeFound("preferredName.in=" + UPDATED_PREFERRED_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByPreferredNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where preferredName is not null
        defaultNciThesaurusShouldBeFound("preferredName.specified=true");

        // Get all the nciThesaurusList where preferredName is null
        defaultNciThesaurusShouldNotBeFound("preferredName.specified=false");
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByPreferredNameContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where preferredName contains DEFAULT_PREFERRED_NAME
        defaultNciThesaurusShouldBeFound("preferredName.contains=" + DEFAULT_PREFERRED_NAME);

        // Get all the nciThesaurusList where preferredName contains UPDATED_PREFERRED_NAME
        defaultNciThesaurusShouldNotBeFound("preferredName.contains=" + UPDATED_PREFERRED_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByPreferredNameNotContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where preferredName does not contain DEFAULT_PREFERRED_NAME
        defaultNciThesaurusShouldNotBeFound("preferredName.doesNotContain=" + DEFAULT_PREFERRED_NAME);

        // Get all the nciThesaurusList where preferredName does not contain UPDATED_PREFERRED_NAME
        defaultNciThesaurusShouldBeFound("preferredName.doesNotContain=" + UPDATED_PREFERRED_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByDisplayNameIsEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where displayName equals to DEFAULT_DISPLAY_NAME
        defaultNciThesaurusShouldBeFound("displayName.equals=" + DEFAULT_DISPLAY_NAME);

        // Get all the nciThesaurusList where displayName equals to UPDATED_DISPLAY_NAME
        defaultNciThesaurusShouldNotBeFound("displayName.equals=" + UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByDisplayNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where displayName not equals to DEFAULT_DISPLAY_NAME
        defaultNciThesaurusShouldNotBeFound("displayName.notEquals=" + DEFAULT_DISPLAY_NAME);

        // Get all the nciThesaurusList where displayName not equals to UPDATED_DISPLAY_NAME
        defaultNciThesaurusShouldBeFound("displayName.notEquals=" + UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByDisplayNameIsInShouldWork() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where displayName in DEFAULT_DISPLAY_NAME or UPDATED_DISPLAY_NAME
        defaultNciThesaurusShouldBeFound("displayName.in=" + DEFAULT_DISPLAY_NAME + "," + UPDATED_DISPLAY_NAME);

        // Get all the nciThesaurusList where displayName equals to UPDATED_DISPLAY_NAME
        defaultNciThesaurusShouldNotBeFound("displayName.in=" + UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByDisplayNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where displayName is not null
        defaultNciThesaurusShouldBeFound("displayName.specified=true");

        // Get all the nciThesaurusList where displayName is null
        defaultNciThesaurusShouldNotBeFound("displayName.specified=false");
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByDisplayNameContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where displayName contains DEFAULT_DISPLAY_NAME
        defaultNciThesaurusShouldBeFound("displayName.contains=" + DEFAULT_DISPLAY_NAME);

        // Get all the nciThesaurusList where displayName contains UPDATED_DISPLAY_NAME
        defaultNciThesaurusShouldNotBeFound("displayName.contains=" + UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesByDisplayNameNotContainsSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        // Get all the nciThesaurusList where displayName does not contain DEFAULT_DISPLAY_NAME
        defaultNciThesaurusShouldNotBeFound("displayName.doesNotContain=" + DEFAULT_DISPLAY_NAME);

        // Get all the nciThesaurusList where displayName does not contain UPDATED_DISPLAY_NAME
        defaultNciThesaurusShouldBeFound("displayName.doesNotContain=" + UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void getAllNciThesaurusesBySynonymIsEqualToSomething() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);
        Synonym synonym;
        if (TestUtil.findAll(em, Synonym.class).isEmpty()) {
            synonym = SynonymResourceIT.createEntity(em);
            em.persist(synonym);
            em.flush();
        } else {
            synonym = TestUtil.findAll(em, Synonym.class).get(0);
        }
        em.persist(synonym);
        em.flush();
        nciThesaurus.addSynonym(synonym);
        nciThesaurusRepository.saveAndFlush(nciThesaurus);
        Long synonymId = synonym.getId();

        // Get all the nciThesaurusList where synonym equals to synonymId
        defaultNciThesaurusShouldBeFound("synonymId.equals=" + synonymId);

        // Get all the nciThesaurusList where synonym equals to (synonymId + 1)
        defaultNciThesaurusShouldNotBeFound("synonymId.equals=" + (synonymId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultNciThesaurusShouldBeFound(String filter) throws Exception {
        restNciThesaurusMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(nciThesaurus.getId().intValue())))
            .andExpect(jsonPath("$.[*].version").value(hasItem(DEFAULT_VERSION)))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].preferredName").value(hasItem(DEFAULT_PREFERRED_NAME)))
            .andExpect(jsonPath("$.[*].displayName").value(hasItem(DEFAULT_DISPLAY_NAME)));

        // Check, that the count call also returns 1
        restNciThesaurusMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultNciThesaurusShouldNotBeFound(String filter) throws Exception {
        restNciThesaurusMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restNciThesaurusMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingNciThesaurus() throws Exception {
        // Get the nciThesaurus
        restNciThesaurusMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewNciThesaurus() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();

        // Update the nciThesaurus
        NciThesaurus updatedNciThesaurus = nciThesaurusRepository.findById(nciThesaurus.getId()).get();
        // Disconnect from session so that the updates on updatedNciThesaurus are not directly saved in db
        em.detach(updatedNciThesaurus);
        updatedNciThesaurus
            .version(UPDATED_VERSION)
            .code(UPDATED_CODE)
            .preferredName(UPDATED_PREFERRED_NAME)
            .displayName(UPDATED_DISPLAY_NAME);

        restNciThesaurusMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedNciThesaurus.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedNciThesaurus))
            )
            .andExpect(status().isOk());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
        NciThesaurus testNciThesaurus = nciThesaurusList.get(nciThesaurusList.size() - 1);
        assertThat(testNciThesaurus.getVersion()).isEqualTo(UPDATED_VERSION);
        assertThat(testNciThesaurus.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testNciThesaurus.getPreferredName()).isEqualTo(UPDATED_PREFERRED_NAME);
        assertThat(testNciThesaurus.getDisplayName()).isEqualTo(UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void putNonExistingNciThesaurus() throws Exception {
        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();
        nciThesaurus.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNciThesaurusMockMvc
            .perform(
                put(ENTITY_API_URL_ID, nciThesaurus.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNciThesaurus() throws Exception {
        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();
        nciThesaurus.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNciThesaurusMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNciThesaurus() throws Exception {
        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();
        nciThesaurus.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNciThesaurusMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNciThesaurusWithPatch() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();

        // Update the nciThesaurus using partial update
        NciThesaurus partialUpdatedNciThesaurus = new NciThesaurus();
        partialUpdatedNciThesaurus.setId(nciThesaurus.getId());

        partialUpdatedNciThesaurus.code(UPDATED_CODE).displayName(UPDATED_DISPLAY_NAME);

        restNciThesaurusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNciThesaurus.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedNciThesaurus))
            )
            .andExpect(status().isOk());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
        NciThesaurus testNciThesaurus = nciThesaurusList.get(nciThesaurusList.size() - 1);
        assertThat(testNciThesaurus.getVersion()).isEqualTo(DEFAULT_VERSION);
        assertThat(testNciThesaurus.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testNciThesaurus.getPreferredName()).isEqualTo(DEFAULT_PREFERRED_NAME);
        assertThat(testNciThesaurus.getDisplayName()).isEqualTo(UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void fullUpdateNciThesaurusWithPatch() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();

        // Update the nciThesaurus using partial update
        NciThesaurus partialUpdatedNciThesaurus = new NciThesaurus();
        partialUpdatedNciThesaurus.setId(nciThesaurus.getId());

        partialUpdatedNciThesaurus
            .version(UPDATED_VERSION)
            .code(UPDATED_CODE)
            .preferredName(UPDATED_PREFERRED_NAME)
            .displayName(UPDATED_DISPLAY_NAME);

        restNciThesaurusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNciThesaurus.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedNciThesaurus))
            )
            .andExpect(status().isOk());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
        NciThesaurus testNciThesaurus = nciThesaurusList.get(nciThesaurusList.size() - 1);
        assertThat(testNciThesaurus.getVersion()).isEqualTo(UPDATED_VERSION);
        assertThat(testNciThesaurus.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testNciThesaurus.getPreferredName()).isEqualTo(UPDATED_PREFERRED_NAME);
        assertThat(testNciThesaurus.getDisplayName()).isEqualTo(UPDATED_DISPLAY_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingNciThesaurus() throws Exception {
        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();
        nciThesaurus.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNciThesaurusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, nciThesaurus.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNciThesaurus() throws Exception {
        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();
        nciThesaurus.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNciThesaurusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isBadRequest());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNciThesaurus() throws Exception {
        int databaseSizeBeforeUpdate = nciThesaurusRepository.findAll().size();
        nciThesaurus.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNciThesaurusMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(nciThesaurus))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the NciThesaurus in the database
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNciThesaurus() throws Exception {
        // Initialize the database
        nciThesaurusRepository.saveAndFlush(nciThesaurus);

        int databaseSizeBeforeDelete = nciThesaurusRepository.findAll().size();

        // Delete the nciThesaurus
        restNciThesaurusMockMvc
            .perform(delete(ENTITY_API_URL_ID, nciThesaurus.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<NciThesaurus> nciThesaurusList = nciThesaurusRepository.findAll();
        assertThat(nciThesaurusList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
