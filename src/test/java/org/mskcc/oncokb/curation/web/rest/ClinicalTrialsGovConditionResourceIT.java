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
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.mskcc.oncokb.curation.repository.ClinicalTrialsGovConditionRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialsGovConditionService;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialsGovConditionCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ClinicalTrialsGovConditionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ClinicalTrialsGovConditionResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/clinical-trials-gov-conditions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository;

    @Mock
    private ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepositoryMock;

    @Mock
    private ClinicalTrialsGovConditionService clinicalTrialsGovConditionServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClinicalTrialsGovConditionMockMvc;

    private ClinicalTrialsGovCondition clinicalTrialsGovCondition;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrialsGovCondition createEntity(EntityManager em) {
        ClinicalTrialsGovCondition clinicalTrialsGovCondition = new ClinicalTrialsGovCondition().name(DEFAULT_NAME);
        return clinicalTrialsGovCondition;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrialsGovCondition createUpdatedEntity(EntityManager em) {
        ClinicalTrialsGovCondition clinicalTrialsGovCondition = new ClinicalTrialsGovCondition().name(UPDATED_NAME);
        return clinicalTrialsGovCondition;
    }

    @BeforeEach
    public void initTest() {
        clinicalTrialsGovCondition = createEntity(em);
    }

    @Test
    @Transactional
    void createClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeCreate = clinicalTrialsGovConditionRepository.findAll().size();
        // Create the ClinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isCreated());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeCreate + 1);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createClinicalTrialsGovConditionWithExistingId() throws Exception {
        // Create the ClinicalTrialsGovCondition with an existing ID
        clinicalTrialsGovCondition.setId(1L);

        int databaseSizeBeforeCreate = clinicalTrialsGovConditionRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClinicalTrialsGovConditionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = clinicalTrialsGovConditionRepository.findAll().size();
        // set the field null
        clinicalTrialsGovCondition.setName(null);

        // Create the ClinicalTrialsGovCondition, which fails.

        restClinicalTrialsGovConditionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditions() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrialsGovCondition.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsGovConditionsWithEagerRelationshipsIsEnabled() throws Exception {
        when(clinicalTrialsGovConditionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialsGovConditionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialsGovConditionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsGovConditionsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(clinicalTrialsGovConditionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialsGovConditionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialsGovConditionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getClinicalTrialsGovCondition() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clinicalTrialsGovCondition.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getClinicalTrialsGovConditionsByIdFiltering() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        Long id = clinicalTrialsGovCondition.getId();

        defaultClinicalTrialsGovConditionShouldBeFound("id.equals=" + id);
        defaultClinicalTrialsGovConditionShouldNotBeFound("id.notEquals=" + id);

        defaultClinicalTrialsGovConditionShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultClinicalTrialsGovConditionShouldNotBeFound("id.greaterThan=" + id);

        defaultClinicalTrialsGovConditionShouldBeFound("id.lessThanOrEqual=" + id);
        defaultClinicalTrialsGovConditionShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList where name equals to DEFAULT_NAME
        defaultClinicalTrialsGovConditionShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the clinicalTrialsGovConditionList where name equals to UPDATED_NAME
        defaultClinicalTrialsGovConditionShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList where name not equals to DEFAULT_NAME
        defaultClinicalTrialsGovConditionShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the clinicalTrialsGovConditionList where name not equals to UPDATED_NAME
        defaultClinicalTrialsGovConditionShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList where name in DEFAULT_NAME or UPDATED_NAME
        defaultClinicalTrialsGovConditionShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the clinicalTrialsGovConditionList where name equals to UPDATED_NAME
        defaultClinicalTrialsGovConditionShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList where name is not null
        defaultClinicalTrialsGovConditionShouldBeFound("name.specified=true");

        // Get all the clinicalTrialsGovConditionList where name is null
        defaultClinicalTrialsGovConditionShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByNameContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList where name contains DEFAULT_NAME
        defaultClinicalTrialsGovConditionShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the clinicalTrialsGovConditionList where name contains UPDATED_NAME
        defaultClinicalTrialsGovConditionShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList where name does not contain DEFAULT_NAME
        defaultClinicalTrialsGovConditionShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the clinicalTrialsGovConditionList where name does not contain UPDATED_NAME
        defaultClinicalTrialsGovConditionShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditionsByCancerTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);
        CancerType cancerType;
        if (TestUtil.findAll(em, CancerType.class).isEmpty()) {
            cancerType = CancerTypeResourceIT.createEntity(em);
            em.persist(cancerType);
            em.flush();
        } else {
            cancerType = TestUtil.findAll(em, CancerType.class).get(0);
        }
        em.persist(cancerType);
        em.flush();
        clinicalTrialsGovCondition.addCancerType(cancerType);
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);
        Long cancerTypeId = cancerType.getId();

        // Get all the clinicalTrialsGovConditionList where cancerType equals to cancerTypeId
        defaultClinicalTrialsGovConditionShouldBeFound("cancerTypeId.equals=" + cancerTypeId);

        // Get all the clinicalTrialsGovConditionList where cancerType equals to (cancerTypeId + 1)
        defaultClinicalTrialsGovConditionShouldNotBeFound("cancerTypeId.equals=" + (cancerTypeId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultClinicalTrialsGovConditionShouldBeFound(String filter) throws Exception {
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrialsGovCondition.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));

        // Check, that the count call also returns 1
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultClinicalTrialsGovConditionShouldNotBeFound(String filter) throws Exception {
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingClinicalTrialsGovCondition() throws Exception {
        // Get the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewClinicalTrialsGovCondition() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();

        // Update the clinicalTrialsGovCondition
        ClinicalTrialsGovCondition updatedClinicalTrialsGovCondition = clinicalTrialsGovConditionRepository
            .findById(clinicalTrialsGovCondition.getId())
            .get();
        // Disconnect from session so that the updates on updatedClinicalTrialsGovCondition are not directly saved in db
        em.detach(updatedClinicalTrialsGovCondition);
        updatedClinicalTrialsGovCondition.name(UPDATED_NAME);

        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedClinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedClinicalTrialsGovCondition))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClinicalTrialsGovConditionWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();

        // Update the clinicalTrialsGovCondition using partial update
        ClinicalTrialsGovCondition partialUpdatedClinicalTrialsGovCondition = new ClinicalTrialsGovCondition();
        partialUpdatedClinicalTrialsGovCondition.setId(clinicalTrialsGovCondition.getId());

        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrialsGovCondition))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateClinicalTrialsGovConditionWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();

        // Update the clinicalTrialsGovCondition using partial update
        ClinicalTrialsGovCondition partialUpdatedClinicalTrialsGovCondition = new ClinicalTrialsGovCondition();
        partialUpdatedClinicalTrialsGovCondition.setId(clinicalTrialsGovCondition.getId());

        partialUpdatedClinicalTrialsGovCondition.name(UPDATED_NAME);

        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrialsGovCondition))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteClinicalTrialsGovCondition() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeDelete = clinicalTrialsGovConditionRepository.findAll().size();

        // Delete the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(delete(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
