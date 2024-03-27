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
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.ClinicalTrial;
import org.mskcc.oncokb.curation.domain.EligibilityCriteria;
import org.mskcc.oncokb.curation.domain.enumeration.EligibilityCriteriaType;
import org.mskcc.oncokb.curation.repository.EligibilityCriteriaRepository;
import org.mskcc.oncokb.curation.service.EligibilityCriteriaService;
import org.mskcc.oncokb.curation.service.criteria.EligibilityCriteriaCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link EligibilityCriteriaResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class EligibilityCriteriaResourceIT {

    private static final EligibilityCriteriaType DEFAULT_TYPE = EligibilityCriteriaType.INCLUSION;
    private static final EligibilityCriteriaType UPDATED_TYPE = EligibilityCriteriaType.EXCLUSION;

    private static final Integer DEFAULT_PRIORITY = 1;
    private static final Integer UPDATED_PRIORITY = 2;
    private static final Integer SMALLER_PRIORITY = 1 - 1;

    private static final String DEFAULT_CRITERIA = "AAAAAAAAAA";
    private static final String UPDATED_CRITERIA = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/eligibility-criteria";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private EligibilityCriteriaRepository eligibilityCriteriaRepository;

    @Mock
    private EligibilityCriteriaRepository eligibilityCriteriaRepositoryMock;

    @Mock
    private EligibilityCriteriaService eligibilityCriteriaServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEligibilityCriteriaMockMvc;

    private EligibilityCriteria eligibilityCriteria;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EligibilityCriteria createEntity(EntityManager em) {
        EligibilityCriteria eligibilityCriteria = new EligibilityCriteria()
            .type(DEFAULT_TYPE)
            .priority(DEFAULT_PRIORITY)
            .criteria(DEFAULT_CRITERIA);
        return eligibilityCriteria;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EligibilityCriteria createUpdatedEntity(EntityManager em) {
        EligibilityCriteria eligibilityCriteria = new EligibilityCriteria()
            .type(UPDATED_TYPE)
            .priority(UPDATED_PRIORITY)
            .criteria(UPDATED_CRITERIA);
        return eligibilityCriteria;
    }

    @BeforeEach
    public void initTest() {
        eligibilityCriteria = createEntity(em);
    }

    @Test
    @Transactional
    void createEligibilityCriteria() throws Exception {
        int databaseSizeBeforeCreate = eligibilityCriteriaRepository.findAll().size();
        // Create the EligibilityCriteria
        restEligibilityCriteriaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isCreated());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeCreate + 1);
        EligibilityCriteria testEligibilityCriteria = eligibilityCriteriaList.get(eligibilityCriteriaList.size() - 1);
        assertThat(testEligibilityCriteria.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testEligibilityCriteria.getPriority()).isEqualTo(DEFAULT_PRIORITY);
        assertThat(testEligibilityCriteria.getCriteria()).isEqualTo(DEFAULT_CRITERIA);
    }

    @Test
    @Transactional
    void createEligibilityCriteriaWithExistingId() throws Exception {
        // Create the EligibilityCriteria with an existing ID
        eligibilityCriteria.setId(1L);

        int databaseSizeBeforeCreate = eligibilityCriteriaRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEligibilityCriteriaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isBadRequest());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = eligibilityCriteriaRepository.findAll().size();
        // set the field null
        eligibilityCriteria.setType(null);

        // Create the EligibilityCriteria, which fails.

        restEligibilityCriteriaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isBadRequest());

        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteria() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList
        restEligibilityCriteriaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(eligibilityCriteria.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].priority").value(hasItem(DEFAULT_PRIORITY)))
            .andExpect(jsonPath("$.[*].criteria").value(hasItem(DEFAULT_CRITERIA.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllEligibilityCriteriaWithEagerRelationshipsIsEnabled() throws Exception {
        when(eligibilityCriteriaServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restEligibilityCriteriaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(eligibilityCriteriaServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllEligibilityCriteriaWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(eligibilityCriteriaServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restEligibilityCriteriaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(eligibilityCriteriaServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getEligibilityCriteria() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get the eligibilityCriteria
        restEligibilityCriteriaMockMvc
            .perform(get(ENTITY_API_URL_ID, eligibilityCriteria.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(eligibilityCriteria.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.priority").value(DEFAULT_PRIORITY))
            .andExpect(jsonPath("$.criteria").value(DEFAULT_CRITERIA.toString()));
    }

    @Test
    @Transactional
    void getEligibilityCriteriaByIdFiltering() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        Long id = eligibilityCriteria.getId();

        defaultEligibilityCriteriaShouldBeFound("id.equals=" + id);
        defaultEligibilityCriteriaShouldNotBeFound("id.notEquals=" + id);

        defaultEligibilityCriteriaShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultEligibilityCriteriaShouldNotBeFound("id.greaterThan=" + id);

        defaultEligibilityCriteriaShouldBeFound("id.lessThanOrEqual=" + id);
        defaultEligibilityCriteriaShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where type equals to DEFAULT_TYPE
        defaultEligibilityCriteriaShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the eligibilityCriteriaList where type equals to UPDATED_TYPE
        defaultEligibilityCriteriaShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where type not equals to DEFAULT_TYPE
        defaultEligibilityCriteriaShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the eligibilityCriteriaList where type not equals to UPDATED_TYPE
        defaultEligibilityCriteriaShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultEligibilityCriteriaShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the eligibilityCriteriaList where type equals to UPDATED_TYPE
        defaultEligibilityCriteriaShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where type is not null
        defaultEligibilityCriteriaShouldBeFound("type.specified=true");

        // Get all the eligibilityCriteriaList where type is null
        defaultEligibilityCriteriaShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority equals to DEFAULT_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.equals=" + DEFAULT_PRIORITY);

        // Get all the eligibilityCriteriaList where priority equals to UPDATED_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.equals=" + UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsNotEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority not equals to DEFAULT_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.notEquals=" + DEFAULT_PRIORITY);

        // Get all the eligibilityCriteriaList where priority not equals to UPDATED_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.notEquals=" + UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsInShouldWork() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority in DEFAULT_PRIORITY or UPDATED_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.in=" + DEFAULT_PRIORITY + "," + UPDATED_PRIORITY);

        // Get all the eligibilityCriteriaList where priority equals to UPDATED_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.in=" + UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsNullOrNotNull() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority is not null
        defaultEligibilityCriteriaShouldBeFound("priority.specified=true");

        // Get all the eligibilityCriteriaList where priority is null
        defaultEligibilityCriteriaShouldNotBeFound("priority.specified=false");
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority is greater than or equal to DEFAULT_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.greaterThanOrEqual=" + DEFAULT_PRIORITY);

        // Get all the eligibilityCriteriaList where priority is greater than or equal to UPDATED_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.greaterThanOrEqual=" + UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority is less than or equal to DEFAULT_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.lessThanOrEqual=" + DEFAULT_PRIORITY);

        // Get all the eligibilityCriteriaList where priority is less than or equal to SMALLER_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.lessThanOrEqual=" + SMALLER_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsLessThanSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority is less than DEFAULT_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.lessThan=" + DEFAULT_PRIORITY);

        // Get all the eligibilityCriteriaList where priority is less than UPDATED_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.lessThan=" + UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByPriorityIsGreaterThanSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        // Get all the eligibilityCriteriaList where priority is greater than DEFAULT_PRIORITY
        defaultEligibilityCriteriaShouldNotBeFound("priority.greaterThan=" + DEFAULT_PRIORITY);

        // Get all the eligibilityCriteriaList where priority is greater than SMALLER_PRIORITY
        defaultEligibilityCriteriaShouldBeFound("priority.greaterThan=" + SMALLER_PRIORITY);
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);
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
        eligibilityCriteria.addAssociation(association);
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);
        Long associationId = association.getId();

        // Get all the eligibilityCriteriaList where association equals to associationId
        defaultEligibilityCriteriaShouldBeFound("associationId.equals=" + associationId);

        // Get all the eligibilityCriteriaList where association equals to (associationId + 1)
        defaultEligibilityCriteriaShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    @Test
    @Transactional
    void getAllEligibilityCriteriaByClinicalTrialIsEqualToSomething() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);
        ClinicalTrial clinicalTrial;
        if (TestUtil.findAll(em, ClinicalTrial.class).isEmpty()) {
            clinicalTrial = ClinicalTrialResourceIT.createEntity(em);
            em.persist(clinicalTrial);
            em.flush();
        } else {
            clinicalTrial = TestUtil.findAll(em, ClinicalTrial.class).get(0);
        }
        em.persist(clinicalTrial);
        em.flush();
        eligibilityCriteria.setClinicalTrial(clinicalTrial);
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);
        Long clinicalTrialId = clinicalTrial.getId();

        // Get all the eligibilityCriteriaList where clinicalTrial equals to clinicalTrialId
        defaultEligibilityCriteriaShouldBeFound("clinicalTrialId.equals=" + clinicalTrialId);

        // Get all the eligibilityCriteriaList where clinicalTrial equals to (clinicalTrialId + 1)
        defaultEligibilityCriteriaShouldNotBeFound("clinicalTrialId.equals=" + (clinicalTrialId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultEligibilityCriteriaShouldBeFound(String filter) throws Exception {
        restEligibilityCriteriaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(eligibilityCriteria.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].priority").value(hasItem(DEFAULT_PRIORITY)))
            .andExpect(jsonPath("$.[*].criteria").value(hasItem(DEFAULT_CRITERIA.toString())));

        // Check, that the count call also returns 1
        restEligibilityCriteriaMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultEligibilityCriteriaShouldNotBeFound(String filter) throws Exception {
        restEligibilityCriteriaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restEligibilityCriteriaMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingEligibilityCriteria() throws Exception {
        // Get the eligibilityCriteria
        restEligibilityCriteriaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewEligibilityCriteria() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();

        // Update the eligibilityCriteria
        EligibilityCriteria updatedEligibilityCriteria = eligibilityCriteriaRepository.findById(eligibilityCriteria.getId()).get();
        // Disconnect from session so that the updates on updatedEligibilityCriteria are not directly saved in db
        em.detach(updatedEligibilityCriteria);
        updatedEligibilityCriteria.type(UPDATED_TYPE).priority(UPDATED_PRIORITY).criteria(UPDATED_CRITERIA);

        restEligibilityCriteriaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedEligibilityCriteria.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedEligibilityCriteria))
            )
            .andExpect(status().isOk());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
        EligibilityCriteria testEligibilityCriteria = eligibilityCriteriaList.get(eligibilityCriteriaList.size() - 1);
        assertThat(testEligibilityCriteria.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testEligibilityCriteria.getPriority()).isEqualTo(UPDATED_PRIORITY);
        assertThat(testEligibilityCriteria.getCriteria()).isEqualTo(UPDATED_CRITERIA);
    }

    @Test
    @Transactional
    void putNonExistingEligibilityCriteria() throws Exception {
        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();
        eligibilityCriteria.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEligibilityCriteriaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, eligibilityCriteria.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isBadRequest());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEligibilityCriteria() throws Exception {
        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();
        eligibilityCriteria.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEligibilityCriteriaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isBadRequest());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEligibilityCriteria() throws Exception {
        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();
        eligibilityCriteria.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEligibilityCriteriaMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEligibilityCriteriaWithPatch() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();

        // Update the eligibilityCriteria using partial update
        EligibilityCriteria partialUpdatedEligibilityCriteria = new EligibilityCriteria();
        partialUpdatedEligibilityCriteria.setId(eligibilityCriteria.getId());

        partialUpdatedEligibilityCriteria.priority(UPDATED_PRIORITY);

        restEligibilityCriteriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEligibilityCriteria.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedEligibilityCriteria))
            )
            .andExpect(status().isOk());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
        EligibilityCriteria testEligibilityCriteria = eligibilityCriteriaList.get(eligibilityCriteriaList.size() - 1);
        assertThat(testEligibilityCriteria.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testEligibilityCriteria.getPriority()).isEqualTo(UPDATED_PRIORITY);
        assertThat(testEligibilityCriteria.getCriteria()).isEqualTo(DEFAULT_CRITERIA);
    }

    @Test
    @Transactional
    void fullUpdateEligibilityCriteriaWithPatch() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();

        // Update the eligibilityCriteria using partial update
        EligibilityCriteria partialUpdatedEligibilityCriteria = new EligibilityCriteria();
        partialUpdatedEligibilityCriteria.setId(eligibilityCriteria.getId());

        partialUpdatedEligibilityCriteria.type(UPDATED_TYPE).priority(UPDATED_PRIORITY).criteria(UPDATED_CRITERIA);

        restEligibilityCriteriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEligibilityCriteria.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedEligibilityCriteria))
            )
            .andExpect(status().isOk());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
        EligibilityCriteria testEligibilityCriteria = eligibilityCriteriaList.get(eligibilityCriteriaList.size() - 1);
        assertThat(testEligibilityCriteria.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testEligibilityCriteria.getPriority()).isEqualTo(UPDATED_PRIORITY);
        assertThat(testEligibilityCriteria.getCriteria()).isEqualTo(UPDATED_CRITERIA);
    }

    @Test
    @Transactional
    void patchNonExistingEligibilityCriteria() throws Exception {
        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();
        eligibilityCriteria.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEligibilityCriteriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, eligibilityCriteria.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isBadRequest());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEligibilityCriteria() throws Exception {
        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();
        eligibilityCriteria.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEligibilityCriteriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isBadRequest());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEligibilityCriteria() throws Exception {
        int databaseSizeBeforeUpdate = eligibilityCriteriaRepository.findAll().size();
        eligibilityCriteria.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEligibilityCriteriaMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(eligibilityCriteria))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EligibilityCriteria in the database
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEligibilityCriteria() throws Exception {
        // Initialize the database
        eligibilityCriteriaRepository.saveAndFlush(eligibilityCriteria);

        int databaseSizeBeforeDelete = eligibilityCriteriaRepository.findAll().size();

        // Delete the eligibilityCriteria
        restEligibilityCriteriaMockMvc
            .perform(delete(ENTITY_API_URL_ID, eligibilityCriteria.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<EligibilityCriteria> eligibilityCriteriaList = eligibilityCriteriaRepository.findAll();
        assertThat(eligibilityCriteriaList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
