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
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.Treatment;
import org.mskcc.oncokb.curation.domain.TreatmentPriority;
import org.mskcc.oncokb.curation.repository.TreatmentRepository;
import org.mskcc.oncokb.curation.service.TreatmentService;
import org.mskcc.oncokb.curation.service.criteria.TreatmentCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TreatmentResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TreatmentResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/treatments";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Mock
    private TreatmentRepository treatmentRepositoryMock;

    @Mock
    private TreatmentService treatmentServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTreatmentMockMvc;

    private Treatment treatment;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Treatment createEntity(EntityManager em) {
        Treatment treatment = new Treatment().name(DEFAULT_NAME);
        return treatment;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Treatment createUpdatedEntity(EntityManager em) {
        Treatment treatment = new Treatment().name(UPDATED_NAME);
        return treatment;
    }

    @BeforeEach
    public void initTest() {
        treatment = createEntity(em);
    }

    @Test
    @Transactional
    void createTreatment() throws Exception {
        int databaseSizeBeforeCreate = treatmentRepository.findAll().size();
        // Create the Treatment
        restTreatmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isCreated());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeCreate + 1);
        Treatment testTreatment = treatmentList.get(treatmentList.size() - 1);
        assertThat(testTreatment.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createTreatmentWithExistingId() throws Exception {
        // Create the Treatment with an existing ID
        treatment.setId(1L);

        int databaseSizeBeforeCreate = treatmentRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTreatmentMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isBadRequest());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllTreatments() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList
        restTreatmentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(treatment.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTreatmentsWithEagerRelationshipsIsEnabled() throws Exception {
        when(treatmentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTreatmentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(treatmentServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTreatmentsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(treatmentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTreatmentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(treatmentServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getTreatment() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get the treatment
        restTreatmentMockMvc
            .perform(get(ENTITY_API_URL_ID, treatment.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(treatment.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getTreatmentsByIdFiltering() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        Long id = treatment.getId();

        defaultTreatmentShouldBeFound("id.equals=" + id);
        defaultTreatmentShouldNotBeFound("id.notEquals=" + id);

        defaultTreatmentShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultTreatmentShouldNotBeFound("id.greaterThan=" + id);

        defaultTreatmentShouldBeFound("id.lessThanOrEqual=" + id);
        defaultTreatmentShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllTreatmentsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList where name equals to DEFAULT_NAME
        defaultTreatmentShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the treatmentList where name equals to UPDATED_NAME
        defaultTreatmentShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTreatmentsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList where name not equals to DEFAULT_NAME
        defaultTreatmentShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the treatmentList where name not equals to UPDATED_NAME
        defaultTreatmentShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTreatmentsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList where name in DEFAULT_NAME or UPDATED_NAME
        defaultTreatmentShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the treatmentList where name equals to UPDATED_NAME
        defaultTreatmentShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTreatmentsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList where name is not null
        defaultTreatmentShouldBeFound("name.specified=true");

        // Get all the treatmentList where name is null
        defaultTreatmentShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllTreatmentsByNameContainsSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList where name contains DEFAULT_NAME
        defaultTreatmentShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the treatmentList where name contains UPDATED_NAME
        defaultTreatmentShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTreatmentsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        // Get all the treatmentList where name does not contain DEFAULT_NAME
        defaultTreatmentShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the treatmentList where name does not contain UPDATED_NAME
        defaultTreatmentShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllTreatmentsByTreatmentPriorityIsEqualToSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);
        TreatmentPriority treatmentPriority;
        if (TestUtil.findAll(em, TreatmentPriority.class).isEmpty()) {
            treatmentPriority = TreatmentPriorityResourceIT.createEntity(em);
            em.persist(treatmentPriority);
            em.flush();
        } else {
            treatmentPriority = TestUtil.findAll(em, TreatmentPriority.class).get(0);
        }
        em.persist(treatmentPriority);
        em.flush();
        treatment.addTreatmentPriority(treatmentPriority);
        treatmentRepository.saveAndFlush(treatment);
        Long treatmentPriorityId = treatmentPriority.getId();

        // Get all the treatmentList where treatmentPriority equals to treatmentPriorityId
        defaultTreatmentShouldBeFound("treatmentPriorityId.equals=" + treatmentPriorityId);

        // Get all the treatmentList where treatmentPriority equals to (treatmentPriorityId + 1)
        defaultTreatmentShouldNotBeFound("treatmentPriorityId.equals=" + (treatmentPriorityId + 1));
    }

    @Test
    @Transactional
    void getAllTreatmentsByDrugIsEqualToSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);
        Drug drug;
        if (TestUtil.findAll(em, Drug.class).isEmpty()) {
            drug = DrugResourceIT.createEntity(em);
            em.persist(drug);
            em.flush();
        } else {
            drug = TestUtil.findAll(em, Drug.class).get(0);
        }
        em.persist(drug);
        em.flush();
        treatment.addDrug(drug);
        treatmentRepository.saveAndFlush(treatment);
        Long drugId = drug.getId();

        // Get all the treatmentList where drug equals to drugId
        defaultTreatmentShouldBeFound("drugId.equals=" + drugId);

        // Get all the treatmentList where drug equals to (drugId + 1)
        defaultTreatmentShouldNotBeFound("drugId.equals=" + (drugId + 1));
    }

    @Test
    @Transactional
    void getAllTreatmentsByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);
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
        treatment.addAssociation(association);
        treatmentRepository.saveAndFlush(treatment);
        Long associationId = association.getId();

        // Get all the treatmentList where association equals to associationId
        defaultTreatmentShouldBeFound("associationId.equals=" + associationId);

        // Get all the treatmentList where association equals to (associationId + 1)
        defaultTreatmentShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultTreatmentShouldBeFound(String filter) throws Exception {
        restTreatmentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(treatment.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));

        // Check, that the count call also returns 1
        restTreatmentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultTreatmentShouldNotBeFound(String filter) throws Exception {
        restTreatmentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restTreatmentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingTreatment() throws Exception {
        // Get the treatment
        restTreatmentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewTreatment() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();

        // Update the treatment
        Treatment updatedTreatment = treatmentRepository.findById(treatment.getId()).get();
        // Disconnect from session so that the updates on updatedTreatment are not directly saved in db
        em.detach(updatedTreatment);
        updatedTreatment.name(UPDATED_NAME);

        restTreatmentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTreatment.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedTreatment))
            )
            .andExpect(status().isOk());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
        Treatment testTreatment = treatmentList.get(treatmentList.size() - 1);
        assertThat(testTreatment.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingTreatment() throws Exception {
        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();
        treatment.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTreatmentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, treatment.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isBadRequest());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTreatment() throws Exception {
        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();
        treatment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isBadRequest());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTreatment() throws Exception {
        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();
        treatment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTreatmentWithPatch() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();

        // Update the treatment using partial update
        Treatment partialUpdatedTreatment = new Treatment();
        partialUpdatedTreatment.setId(treatment.getId());

        restTreatmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTreatment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTreatment))
            )
            .andExpect(status().isOk());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
        Treatment testTreatment = treatmentList.get(treatmentList.size() - 1);
        assertThat(testTreatment.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateTreatmentWithPatch() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();

        // Update the treatment using partial update
        Treatment partialUpdatedTreatment = new Treatment();
        partialUpdatedTreatment.setId(treatment.getId());

        partialUpdatedTreatment.name(UPDATED_NAME);

        restTreatmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTreatment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTreatment))
            )
            .andExpect(status().isOk());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
        Treatment testTreatment = treatmentList.get(treatmentList.size() - 1);
        assertThat(testTreatment.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingTreatment() throws Exception {
        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();
        treatment.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTreatmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, treatment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isBadRequest());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTreatment() throws Exception {
        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();
        treatment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isBadRequest());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTreatment() throws Exception {
        int databaseSizeBeforeUpdate = treatmentRepository.findAll().size();
        treatment.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(treatment))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Treatment in the database
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTreatment() throws Exception {
        // Initialize the database
        treatmentRepository.saveAndFlush(treatment);

        int databaseSizeBeforeDelete = treatmentRepository.findAll().size();

        // Delete the treatment
        restTreatmentMockMvc
            .perform(delete(ENTITY_API_URL_ID, treatment.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Treatment> treatmentList = treatmentRepository.findAll();
        assertThat(treatmentList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
