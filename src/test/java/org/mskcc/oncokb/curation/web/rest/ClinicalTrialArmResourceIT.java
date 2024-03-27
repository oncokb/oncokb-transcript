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
import org.mskcc.oncokb.curation.domain.ClinicalTrialArm;
import org.mskcc.oncokb.curation.repository.ClinicalTrialArmRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialArmService;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialArmCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ClinicalTrialArmResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ClinicalTrialArmResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/clinical-trial-arms";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ClinicalTrialArmRepository clinicalTrialArmRepository;

    @Mock
    private ClinicalTrialArmRepository clinicalTrialArmRepositoryMock;

    @Mock
    private ClinicalTrialArmService clinicalTrialArmServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClinicalTrialArmMockMvc;

    private ClinicalTrialArm clinicalTrialArm;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrialArm createEntity(EntityManager em) {
        ClinicalTrialArm clinicalTrialArm = new ClinicalTrialArm().name(DEFAULT_NAME);
        return clinicalTrialArm;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrialArm createUpdatedEntity(EntityManager em) {
        ClinicalTrialArm clinicalTrialArm = new ClinicalTrialArm().name(UPDATED_NAME);
        return clinicalTrialArm;
    }

    @BeforeEach
    public void initTest() {
        clinicalTrialArm = createEntity(em);
    }

    @Test
    @Transactional
    void createClinicalTrialArm() throws Exception {
        int databaseSizeBeforeCreate = clinicalTrialArmRepository.findAll().size();
        // Create the ClinicalTrialArm
        restClinicalTrialArmMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isCreated());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeCreate + 1);
        ClinicalTrialArm testClinicalTrialArm = clinicalTrialArmList.get(clinicalTrialArmList.size() - 1);
        assertThat(testClinicalTrialArm.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createClinicalTrialArmWithExistingId() throws Exception {
        // Create the ClinicalTrialArm with an existing ID
        clinicalTrialArm.setId(1L);

        int databaseSizeBeforeCreate = clinicalTrialArmRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClinicalTrialArmMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = clinicalTrialArmRepository.findAll().size();
        // set the field null
        clinicalTrialArm.setName(null);

        // Create the ClinicalTrialArm, which fails.

        restClinicalTrialArmMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isBadRequest());

        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArms() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList
        restClinicalTrialArmMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrialArm.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialArmsWithEagerRelationshipsIsEnabled() throws Exception {
        when(clinicalTrialArmServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialArmMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialArmServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialArmsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(clinicalTrialArmServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialArmMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialArmServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getClinicalTrialArm() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get the clinicalTrialArm
        restClinicalTrialArmMockMvc
            .perform(get(ENTITY_API_URL_ID, clinicalTrialArm.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clinicalTrialArm.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getClinicalTrialArmsByIdFiltering() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        Long id = clinicalTrialArm.getId();

        defaultClinicalTrialArmShouldBeFound("id.equals=" + id);
        defaultClinicalTrialArmShouldNotBeFound("id.notEquals=" + id);

        defaultClinicalTrialArmShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultClinicalTrialArmShouldNotBeFound("id.greaterThan=" + id);

        defaultClinicalTrialArmShouldBeFound("id.lessThanOrEqual=" + id);
        defaultClinicalTrialArmShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList where name equals to DEFAULT_NAME
        defaultClinicalTrialArmShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the clinicalTrialArmList where name equals to UPDATED_NAME
        defaultClinicalTrialArmShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList where name not equals to DEFAULT_NAME
        defaultClinicalTrialArmShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the clinicalTrialArmList where name not equals to UPDATED_NAME
        defaultClinicalTrialArmShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList where name in DEFAULT_NAME or UPDATED_NAME
        defaultClinicalTrialArmShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the clinicalTrialArmList where name equals to UPDATED_NAME
        defaultClinicalTrialArmShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList where name is not null
        defaultClinicalTrialArmShouldBeFound("name.specified=true");

        // Get all the clinicalTrialArmList where name is null
        defaultClinicalTrialArmShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByNameContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList where name contains DEFAULT_NAME
        defaultClinicalTrialArmShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the clinicalTrialArmList where name contains UPDATED_NAME
        defaultClinicalTrialArmShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        // Get all the clinicalTrialArmList where name does not contain DEFAULT_NAME
        defaultClinicalTrialArmShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the clinicalTrialArmList where name does not contain UPDATED_NAME
        defaultClinicalTrialArmShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);
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
        clinicalTrialArm.addAssociation(association);
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);
        Long associationId = association.getId();

        // Get all the clinicalTrialArmList where association equals to associationId
        defaultClinicalTrialArmShouldBeFound("associationId.equals=" + associationId);

        // Get all the clinicalTrialArmList where association equals to (associationId + 1)
        defaultClinicalTrialArmShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    @Test
    @Transactional
    void getAllClinicalTrialArmsByClinicalTrialIsEqualToSomething() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);
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
        clinicalTrialArm.setClinicalTrial(clinicalTrial);
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);
        Long clinicalTrialId = clinicalTrial.getId();

        // Get all the clinicalTrialArmList where clinicalTrial equals to clinicalTrialId
        defaultClinicalTrialArmShouldBeFound("clinicalTrialId.equals=" + clinicalTrialId);

        // Get all the clinicalTrialArmList where clinicalTrial equals to (clinicalTrialId + 1)
        defaultClinicalTrialArmShouldNotBeFound("clinicalTrialId.equals=" + (clinicalTrialId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultClinicalTrialArmShouldBeFound(String filter) throws Exception {
        restClinicalTrialArmMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrialArm.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));

        // Check, that the count call also returns 1
        restClinicalTrialArmMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultClinicalTrialArmShouldNotBeFound(String filter) throws Exception {
        restClinicalTrialArmMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restClinicalTrialArmMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingClinicalTrialArm() throws Exception {
        // Get the clinicalTrialArm
        restClinicalTrialArmMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewClinicalTrialArm() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();

        // Update the clinicalTrialArm
        ClinicalTrialArm updatedClinicalTrialArm = clinicalTrialArmRepository.findById(clinicalTrialArm.getId()).get();
        // Disconnect from session so that the updates on updatedClinicalTrialArm are not directly saved in db
        em.detach(updatedClinicalTrialArm);
        updatedClinicalTrialArm.name(UPDATED_NAME);

        restClinicalTrialArmMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedClinicalTrialArm.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedClinicalTrialArm))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialArm testClinicalTrialArm = clinicalTrialArmList.get(clinicalTrialArmList.size() - 1);
        assertThat(testClinicalTrialArm.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingClinicalTrialArm() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();
        clinicalTrialArm.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialArmMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clinicalTrialArm.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchClinicalTrialArm() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();
        clinicalTrialArm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialArmMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClinicalTrialArm() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();
        clinicalTrialArm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialArmMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClinicalTrialArmWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();

        // Update the clinicalTrialArm using partial update
        ClinicalTrialArm partialUpdatedClinicalTrialArm = new ClinicalTrialArm();
        partialUpdatedClinicalTrialArm.setId(clinicalTrialArm.getId());

        restClinicalTrialArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrialArm.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrialArm))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialArm testClinicalTrialArm = clinicalTrialArmList.get(clinicalTrialArmList.size() - 1);
        assertThat(testClinicalTrialArm.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateClinicalTrialArmWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();

        // Update the clinicalTrialArm using partial update
        ClinicalTrialArm partialUpdatedClinicalTrialArm = new ClinicalTrialArm();
        partialUpdatedClinicalTrialArm.setId(clinicalTrialArm.getId());

        partialUpdatedClinicalTrialArm.name(UPDATED_NAME);

        restClinicalTrialArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrialArm.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrialArm))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialArm testClinicalTrialArm = clinicalTrialArmList.get(clinicalTrialArmList.size() - 1);
        assertThat(testClinicalTrialArm.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingClinicalTrialArm() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();
        clinicalTrialArm.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clinicalTrialArm.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClinicalTrialArm() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();
        clinicalTrialArm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClinicalTrialArm() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialArmRepository.findAll().size();
        clinicalTrialArm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialArmMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialArm))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrialArm in the database
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteClinicalTrialArm() throws Exception {
        // Initialize the database
        clinicalTrialArmRepository.saveAndFlush(clinicalTrialArm);

        int databaseSizeBeforeDelete = clinicalTrialArmRepository.findAll().size();

        // Delete the clinicalTrialArm
        restClinicalTrialArmMockMvc
            .perform(delete(ENTITY_API_URL_ID, clinicalTrialArm.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<ClinicalTrialArm> clinicalTrialArmList = clinicalTrialArmRepository.findAll();
        assertThat(clinicalTrialArmList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
