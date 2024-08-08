package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.ClinicalTrial;
import org.mskcc.oncokb.curation.domain.ClinicalTrialArm;
import org.mskcc.oncokb.curation.domain.EligibilityCriteria;
import org.mskcc.oncokb.curation.repository.ClinicalTrialRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialService;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ClinicalTrialResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ClinicalTrialResourceIT {

    private static final String DEFAULT_NCT_ID = "AAAAAAAAAA";
    private static final String UPDATED_NCT_ID = "BBBBBBBBBB";

    private static final String DEFAULT_BRIEF_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_BRIEF_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_PHASE = "AAAAAAAAAA";
    private static final String UPDATED_PHASE = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/clinical-trials";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ClinicalTrialRepository clinicalTrialRepository;

    @Mock
    private ClinicalTrialRepository clinicalTrialRepositoryMock;

    @Mock
    private ClinicalTrialService clinicalTrialServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClinicalTrialMockMvc;

    private ClinicalTrial clinicalTrial;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrial createEntity(EntityManager em) {
        ClinicalTrial clinicalTrial = new ClinicalTrial()
            .nctId(DEFAULT_NCT_ID)
            .briefTitle(DEFAULT_BRIEF_TITLE)
            .phase(DEFAULT_PHASE)
            .status(DEFAULT_STATUS);
        return clinicalTrial;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrial createUpdatedEntity(EntityManager em) {
        ClinicalTrial clinicalTrial = new ClinicalTrial()
            .nctId(UPDATED_NCT_ID)
            .briefTitle(UPDATED_BRIEF_TITLE)
            .phase(UPDATED_PHASE)
            .status(UPDATED_STATUS);
        return clinicalTrial;
    }

    @BeforeEach
    public void initTest() {
        clinicalTrial = createEntity(em);
    }

    @Test
    @Transactional
    void createClinicalTrial() throws Exception {
        int databaseSizeBeforeCreate = clinicalTrialRepository.findAll().size();
        // Create the ClinicalTrial
        restClinicalTrialMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isCreated());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeCreate + 1);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(DEFAULT_NCT_ID);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(DEFAULT_BRIEF_TITLE);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(DEFAULT_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(DEFAULT_STATUS);
    }

    @Test
    @Transactional
    void createClinicalTrialWithExistingId() throws Exception {
        // Create the ClinicalTrial with an existing ID
        clinicalTrial.setId(1L);

        int databaseSizeBeforeCreate = clinicalTrialRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClinicalTrialMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkBriefTitleIsRequired() throws Exception {
        int databaseSizeBeforeTest = clinicalTrialRepository.findAll().size();
        // set the field null
        clinicalTrial.setBriefTitle(null);

        // Create the ClinicalTrial, which fails.

        restClinicalTrialMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClinicalTrials() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrial.getId().intValue())))
            .andExpect(jsonPath("$.[*].nctId").value(hasItem(DEFAULT_NCT_ID)))
            .andExpect(jsonPath("$.[*].briefTitle").value(hasItem(DEFAULT_BRIEF_TITLE)))
            .andExpect(jsonPath("$.[*].phase").value(hasItem(DEFAULT_PHASE)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsWithEagerRelationshipsIsEnabled() throws Exception {
        when(clinicalTrialServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(clinicalTrialServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getClinicalTrial() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get the clinicalTrial
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL_ID, clinicalTrial.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clinicalTrial.getId().intValue()))
            .andExpect(jsonPath("$.nctId").value(DEFAULT_NCT_ID))
            .andExpect(jsonPath("$.briefTitle").value(DEFAULT_BRIEF_TITLE))
            .andExpect(jsonPath("$.phase").value(DEFAULT_PHASE))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS));
    }

    @Test
    @Transactional
    void getClinicalTrialsByIdFiltering() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        Long id = clinicalTrial.getId();

        defaultClinicalTrialShouldBeFound("id.equals=" + id);
        defaultClinicalTrialShouldNotBeFound("id.notEquals=" + id);

        defaultClinicalTrialShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultClinicalTrialShouldNotBeFound("id.greaterThan=" + id);

        defaultClinicalTrialShouldBeFound("id.lessThanOrEqual=" + id);
        defaultClinicalTrialShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByNctIdIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where nctId equals to DEFAULT_NCT_ID
        defaultClinicalTrialShouldBeFound("nctId.equals=" + DEFAULT_NCT_ID);

        // Get all the clinicalTrialList where nctId equals to UPDATED_NCT_ID
        defaultClinicalTrialShouldNotBeFound("nctId.equals=" + UPDATED_NCT_ID);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByNctIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where nctId not equals to DEFAULT_NCT_ID
        defaultClinicalTrialShouldNotBeFound("nctId.notEquals=" + DEFAULT_NCT_ID);

        // Get all the clinicalTrialList where nctId not equals to UPDATED_NCT_ID
        defaultClinicalTrialShouldBeFound("nctId.notEquals=" + UPDATED_NCT_ID);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByNctIdIsInShouldWork() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where nctId in DEFAULT_NCT_ID or UPDATED_NCT_ID
        defaultClinicalTrialShouldBeFound("nctId.in=" + DEFAULT_NCT_ID + "," + UPDATED_NCT_ID);

        // Get all the clinicalTrialList where nctId equals to UPDATED_NCT_ID
        defaultClinicalTrialShouldNotBeFound("nctId.in=" + UPDATED_NCT_ID);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByNctIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where nctId is not null
        defaultClinicalTrialShouldBeFound("nctId.specified=true");

        // Get all the clinicalTrialList where nctId is null
        defaultClinicalTrialShouldNotBeFound("nctId.specified=false");
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByNctIdContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where nctId contains DEFAULT_NCT_ID
        defaultClinicalTrialShouldBeFound("nctId.contains=" + DEFAULT_NCT_ID);

        // Get all the clinicalTrialList where nctId contains UPDATED_NCT_ID
        defaultClinicalTrialShouldNotBeFound("nctId.contains=" + UPDATED_NCT_ID);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByNctIdNotContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where nctId does not contain DEFAULT_NCT_ID
        defaultClinicalTrialShouldNotBeFound("nctId.doesNotContain=" + DEFAULT_NCT_ID);

        // Get all the clinicalTrialList where nctId does not contain UPDATED_NCT_ID
        defaultClinicalTrialShouldBeFound("nctId.doesNotContain=" + UPDATED_NCT_ID);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByBriefTitleIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where briefTitle equals to DEFAULT_BRIEF_TITLE
        defaultClinicalTrialShouldBeFound("briefTitle.equals=" + DEFAULT_BRIEF_TITLE);

        // Get all the clinicalTrialList where briefTitle equals to UPDATED_BRIEF_TITLE
        defaultClinicalTrialShouldNotBeFound("briefTitle.equals=" + UPDATED_BRIEF_TITLE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByBriefTitleIsNotEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where briefTitle not equals to DEFAULT_BRIEF_TITLE
        defaultClinicalTrialShouldNotBeFound("briefTitle.notEquals=" + DEFAULT_BRIEF_TITLE);

        // Get all the clinicalTrialList where briefTitle not equals to UPDATED_BRIEF_TITLE
        defaultClinicalTrialShouldBeFound("briefTitle.notEquals=" + UPDATED_BRIEF_TITLE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByBriefTitleIsInShouldWork() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where briefTitle in DEFAULT_BRIEF_TITLE or UPDATED_BRIEF_TITLE
        defaultClinicalTrialShouldBeFound("briefTitle.in=" + DEFAULT_BRIEF_TITLE + "," + UPDATED_BRIEF_TITLE);

        // Get all the clinicalTrialList where briefTitle equals to UPDATED_BRIEF_TITLE
        defaultClinicalTrialShouldNotBeFound("briefTitle.in=" + UPDATED_BRIEF_TITLE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByBriefTitleIsNullOrNotNull() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where briefTitle is not null
        defaultClinicalTrialShouldBeFound("briefTitle.specified=true");

        // Get all the clinicalTrialList where briefTitle is null
        defaultClinicalTrialShouldNotBeFound("briefTitle.specified=false");
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByBriefTitleContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where briefTitle contains DEFAULT_BRIEF_TITLE
        defaultClinicalTrialShouldBeFound("briefTitle.contains=" + DEFAULT_BRIEF_TITLE);

        // Get all the clinicalTrialList where briefTitle contains UPDATED_BRIEF_TITLE
        defaultClinicalTrialShouldNotBeFound("briefTitle.contains=" + UPDATED_BRIEF_TITLE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByBriefTitleNotContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where briefTitle does not contain DEFAULT_BRIEF_TITLE
        defaultClinicalTrialShouldNotBeFound("briefTitle.doesNotContain=" + DEFAULT_BRIEF_TITLE);

        // Get all the clinicalTrialList where briefTitle does not contain UPDATED_BRIEF_TITLE
        defaultClinicalTrialShouldBeFound("briefTitle.doesNotContain=" + UPDATED_BRIEF_TITLE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByPhaseIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where phase equals to DEFAULT_PHASE
        defaultClinicalTrialShouldBeFound("phase.equals=" + DEFAULT_PHASE);

        // Get all the clinicalTrialList where phase equals to UPDATED_PHASE
        defaultClinicalTrialShouldNotBeFound("phase.equals=" + UPDATED_PHASE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByPhaseIsNotEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where phase not equals to DEFAULT_PHASE
        defaultClinicalTrialShouldNotBeFound("phase.notEquals=" + DEFAULT_PHASE);

        // Get all the clinicalTrialList where phase not equals to UPDATED_PHASE
        defaultClinicalTrialShouldBeFound("phase.notEquals=" + UPDATED_PHASE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByPhaseIsInShouldWork() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where phase in DEFAULT_PHASE or UPDATED_PHASE
        defaultClinicalTrialShouldBeFound("phase.in=" + DEFAULT_PHASE + "," + UPDATED_PHASE);

        // Get all the clinicalTrialList where phase equals to UPDATED_PHASE
        defaultClinicalTrialShouldNotBeFound("phase.in=" + UPDATED_PHASE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByPhaseIsNullOrNotNull() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where phase is not null
        defaultClinicalTrialShouldBeFound("phase.specified=true");

        // Get all the clinicalTrialList where phase is null
        defaultClinicalTrialShouldNotBeFound("phase.specified=false");
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByPhaseContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where phase contains DEFAULT_PHASE
        defaultClinicalTrialShouldBeFound("phase.contains=" + DEFAULT_PHASE);

        // Get all the clinicalTrialList where phase contains UPDATED_PHASE
        defaultClinicalTrialShouldNotBeFound("phase.contains=" + UPDATED_PHASE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByPhaseNotContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where phase does not contain DEFAULT_PHASE
        defaultClinicalTrialShouldNotBeFound("phase.doesNotContain=" + DEFAULT_PHASE);

        // Get all the clinicalTrialList where phase does not contain UPDATED_PHASE
        defaultClinicalTrialShouldBeFound("phase.doesNotContain=" + UPDATED_PHASE);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where status equals to DEFAULT_STATUS
        defaultClinicalTrialShouldBeFound("status.equals=" + DEFAULT_STATUS);

        // Get all the clinicalTrialList where status equals to UPDATED_STATUS
        defaultClinicalTrialShouldNotBeFound("status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByStatusIsNotEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where status not equals to DEFAULT_STATUS
        defaultClinicalTrialShouldNotBeFound("status.notEquals=" + DEFAULT_STATUS);

        // Get all the clinicalTrialList where status not equals to UPDATED_STATUS
        defaultClinicalTrialShouldBeFound("status.notEquals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where status in DEFAULT_STATUS or UPDATED_STATUS
        defaultClinicalTrialShouldBeFound("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS);

        // Get all the clinicalTrialList where status equals to UPDATED_STATUS
        defaultClinicalTrialShouldNotBeFound("status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where status is not null
        defaultClinicalTrialShouldBeFound("status.specified=true");

        // Get all the clinicalTrialList where status is null
        defaultClinicalTrialShouldNotBeFound("status.specified=false");
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByStatusContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where status contains DEFAULT_STATUS
        defaultClinicalTrialShouldBeFound("status.contains=" + DEFAULT_STATUS);

        // Get all the clinicalTrialList where status contains UPDATED_STATUS
        defaultClinicalTrialShouldNotBeFound("status.contains=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByStatusNotContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList where status does not contain DEFAULT_STATUS
        defaultClinicalTrialShouldNotBeFound("status.doesNotContain=" + DEFAULT_STATUS);

        // Get all the clinicalTrialList where status does not contain UPDATED_STATUS
        defaultClinicalTrialShouldBeFound("status.doesNotContain=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByClinicalTrialArmIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);
        ClinicalTrialArm clinicalTrialArm;
        if (TestUtil.findAll(em, ClinicalTrialArm.class).isEmpty()) {
            clinicalTrialArm = ClinicalTrialArmResourceIT.createEntity(em);
            em.persist(clinicalTrialArm);
            em.flush();
        } else {
            clinicalTrialArm = TestUtil.findAll(em, ClinicalTrialArm.class).get(0);
        }
        em.persist(clinicalTrialArm);
        em.flush();
        clinicalTrial.addClinicalTrialArm(clinicalTrialArm);
        clinicalTrialRepository.saveAndFlush(clinicalTrial);
        Long clinicalTrialArmId = clinicalTrialArm.getId();

        // Get all the clinicalTrialList where clinicalTrialArm equals to clinicalTrialArmId
        defaultClinicalTrialShouldBeFound("clinicalTrialArmId.equals=" + clinicalTrialArmId);

        // Get all the clinicalTrialList where clinicalTrialArm equals to (clinicalTrialArmId + 1)
        defaultClinicalTrialShouldNotBeFound("clinicalTrialArmId.equals=" + (clinicalTrialArmId + 1));
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByEligibilityCriteriaIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);
        EligibilityCriteria eligibilityCriteria;
        if (TestUtil.findAll(em, EligibilityCriteria.class).isEmpty()) {
            eligibilityCriteria = EligibilityCriteriaResourceIT.createEntity(em);
            em.persist(eligibilityCriteria);
            em.flush();
        } else {
            eligibilityCriteria = TestUtil.findAll(em, EligibilityCriteria.class).get(0);
        }
        em.persist(eligibilityCriteria);
        em.flush();
        clinicalTrial.addEligibilityCriteria(eligibilityCriteria);
        clinicalTrialRepository.saveAndFlush(clinicalTrial);
        Long eligibilityCriteriaId = eligibilityCriteria.getId();

        // Get all the clinicalTrialList where eligibilityCriteria equals to eligibilityCriteriaId
        defaultClinicalTrialShouldBeFound("eligibilityCriteriaId.equals=" + eligibilityCriteriaId);

        // Get all the clinicalTrialList where eligibilityCriteria equals to (eligibilityCriteriaId + 1)
        defaultClinicalTrialShouldNotBeFound("eligibilityCriteriaId.equals=" + (eligibilityCriteriaId + 1));
    }

    @Test
    @Transactional
    void getAllClinicalTrialsByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);
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
        clinicalTrial.addAssociation(association);
        clinicalTrialRepository.saveAndFlush(clinicalTrial);
        Long associationId = association.getId();

        // Get all the clinicalTrialList where association equals to associationId
        defaultClinicalTrialShouldBeFound("associationId.equals=" + associationId);

        // Get all the clinicalTrialList where association equals to (associationId + 1)
        defaultClinicalTrialShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultClinicalTrialShouldBeFound(String filter) throws Exception {
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrial.getId().intValue())))
            .andExpect(jsonPath("$.[*].nctId").value(hasItem(DEFAULT_NCT_ID)))
            .andExpect(jsonPath("$.[*].briefTitle").value(hasItem(DEFAULT_BRIEF_TITLE)))
            .andExpect(jsonPath("$.[*].phase").value(hasItem(DEFAULT_PHASE)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)));

        // Check, that the count call also returns 1
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultClinicalTrialShouldNotBeFound(String filter) throws Exception {
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingClinicalTrial() throws Exception {
        // Get the clinicalTrial
        restClinicalTrialMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewClinicalTrial() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();

        // Update the clinicalTrial
        ClinicalTrial updatedClinicalTrial = clinicalTrialRepository.findById(clinicalTrial.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedClinicalTrial are not directly saved in db
        em.detach(updatedClinicalTrial);
        updatedClinicalTrial.nctId(UPDATED_NCT_ID).briefTitle(UPDATED_BRIEF_TITLE).phase(UPDATED_PHASE).status(UPDATED_STATUS);

        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedClinicalTrial.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedClinicalTrial))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(UPDATED_NCT_ID);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(UPDATED_BRIEF_TITLE);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(UPDATED_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(UPDATED_STATUS);
    }

    @Test
    @Transactional
    void putNonExistingClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clinicalTrial.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClinicalTrialWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();

        // Update the clinicalTrial using partial update
        ClinicalTrial partialUpdatedClinicalTrial = new ClinicalTrial();
        partialUpdatedClinicalTrial.setId(clinicalTrial.getId());

        partialUpdatedClinicalTrial.nctId(UPDATED_NCT_ID).briefTitle(UPDATED_BRIEF_TITLE);

        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrial.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrial))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(UPDATED_NCT_ID);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(UPDATED_BRIEF_TITLE);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(DEFAULT_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(DEFAULT_STATUS);
    }

    @Test
    @Transactional
    void fullUpdateClinicalTrialWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();

        // Update the clinicalTrial using partial update
        ClinicalTrial partialUpdatedClinicalTrial = new ClinicalTrial();
        partialUpdatedClinicalTrial.setId(clinicalTrial.getId());

        partialUpdatedClinicalTrial.nctId(UPDATED_NCT_ID).briefTitle(UPDATED_BRIEF_TITLE).phase(UPDATED_PHASE).status(UPDATED_STATUS);

        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrial.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrial))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(UPDATED_NCT_ID);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(UPDATED_BRIEF_TITLE);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(UPDATED_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(UPDATED_STATUS);
    }

    @Test
    @Transactional
    void patchNonExistingClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clinicalTrial.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteClinicalTrial() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeDelete = clinicalTrialRepository.findAll().size();

        // Delete the clinicalTrial
        restClinicalTrialMockMvc
            .perform(delete(ENTITY_API_URL_ID, clinicalTrial.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
