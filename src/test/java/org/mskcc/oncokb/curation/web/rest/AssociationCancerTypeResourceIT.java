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
import org.mskcc.oncokb.curation.domain.AssociationCancerType;
import org.mskcc.oncokb.curation.domain.enumeration.AssociationCancerTypeRelation;
import org.mskcc.oncokb.curation.repository.AssociationCancerTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AssociationCancerTypeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class AssociationCancerTypeResourceIT {

    private static final AssociationCancerTypeRelation DEFAULT_RELATION = AssociationCancerTypeRelation.INCLUSION;
    private static final AssociationCancerTypeRelation UPDATED_RELATION = AssociationCancerTypeRelation.EXCLUSION;

    private static final String ENTITY_API_URL = "/api/association-cancer-types";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private AssociationCancerTypeRepository associationCancerTypeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAssociationCancerTypeMockMvc;

    private AssociationCancerType associationCancerType;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AssociationCancerType createEntity(EntityManager em) {
        AssociationCancerType associationCancerType = new AssociationCancerType().relation(DEFAULT_RELATION);
        return associationCancerType;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AssociationCancerType createUpdatedEntity(EntityManager em) {
        AssociationCancerType associationCancerType = new AssociationCancerType().relation(UPDATED_RELATION);
        return associationCancerType;
    }

    @BeforeEach
    public void initTest() {
        associationCancerType = createEntity(em);
    }

    @Test
    @Transactional
    void createAssociationCancerType() throws Exception {
        int databaseSizeBeforeCreate = associationCancerTypeRepository.findAll().size();
        // Create the AssociationCancerType
        restAssociationCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isCreated());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeCreate + 1);
        AssociationCancerType testAssociationCancerType = associationCancerTypeList.get(associationCancerTypeList.size() - 1);
        assertThat(testAssociationCancerType.getRelation()).isEqualTo(DEFAULT_RELATION);
    }

    @Test
    @Transactional
    void createAssociationCancerTypeWithExistingId() throws Exception {
        // Create the AssociationCancerType with an existing ID
        associationCancerType.setId(1L);

        int databaseSizeBeforeCreate = associationCancerTypeRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAssociationCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRelationIsRequired() throws Exception {
        int databaseSizeBeforeTest = associationCancerTypeRepository.findAll().size();
        // set the field null
        associationCancerType.setRelation(null);

        // Create the AssociationCancerType, which fails.

        restAssociationCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isBadRequest());

        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAssociationCancerTypes() throws Exception {
        // Initialize the database
        associationCancerTypeRepository.saveAndFlush(associationCancerType);

        // Get all the associationCancerTypeList
        restAssociationCancerTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(associationCancerType.getId().intValue())))
            .andExpect(jsonPath("$.[*].relation").value(hasItem(DEFAULT_RELATION.toString())));
    }

    @Test
    @Transactional
    void getAssociationCancerType() throws Exception {
        // Initialize the database
        associationCancerTypeRepository.saveAndFlush(associationCancerType);

        // Get the associationCancerType
        restAssociationCancerTypeMockMvc
            .perform(get(ENTITY_API_URL_ID, associationCancerType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(associationCancerType.getId().intValue()))
            .andExpect(jsonPath("$.relation").value(DEFAULT_RELATION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingAssociationCancerType() throws Exception {
        // Get the associationCancerType
        restAssociationCancerTypeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewAssociationCancerType() throws Exception {
        // Initialize the database
        associationCancerTypeRepository.saveAndFlush(associationCancerType);

        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();

        // Update the associationCancerType
        AssociationCancerType updatedAssociationCancerType = associationCancerTypeRepository.findById(associationCancerType.getId()).get();
        // Disconnect from session so that the updates on updatedAssociationCancerType are not directly saved in db
        em.detach(updatedAssociationCancerType);
        updatedAssociationCancerType.relation(UPDATED_RELATION);

        restAssociationCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedAssociationCancerType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedAssociationCancerType))
            )
            .andExpect(status().isOk());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
        AssociationCancerType testAssociationCancerType = associationCancerTypeList.get(associationCancerTypeList.size() - 1);
        assertThat(testAssociationCancerType.getRelation()).isEqualTo(UPDATED_RELATION);
    }

    @Test
    @Transactional
    void putNonExistingAssociationCancerType() throws Exception {
        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();
        associationCancerType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAssociationCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, associationCancerType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAssociationCancerType() throws Exception {
        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();
        associationCancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssociationCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAssociationCancerType() throws Exception {
        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();
        associationCancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssociationCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAssociationCancerTypeWithPatch() throws Exception {
        // Initialize the database
        associationCancerTypeRepository.saveAndFlush(associationCancerType);

        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();

        // Update the associationCancerType using partial update
        AssociationCancerType partialUpdatedAssociationCancerType = new AssociationCancerType();
        partialUpdatedAssociationCancerType.setId(associationCancerType.getId());

        partialUpdatedAssociationCancerType.relation(UPDATED_RELATION);

        restAssociationCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAssociationCancerType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAssociationCancerType))
            )
            .andExpect(status().isOk());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
        AssociationCancerType testAssociationCancerType = associationCancerTypeList.get(associationCancerTypeList.size() - 1);
        assertThat(testAssociationCancerType.getRelation()).isEqualTo(UPDATED_RELATION);
    }

    @Test
    @Transactional
    void fullUpdateAssociationCancerTypeWithPatch() throws Exception {
        // Initialize the database
        associationCancerTypeRepository.saveAndFlush(associationCancerType);

        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();

        // Update the associationCancerType using partial update
        AssociationCancerType partialUpdatedAssociationCancerType = new AssociationCancerType();
        partialUpdatedAssociationCancerType.setId(associationCancerType.getId());

        partialUpdatedAssociationCancerType.relation(UPDATED_RELATION);

        restAssociationCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAssociationCancerType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAssociationCancerType))
            )
            .andExpect(status().isOk());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
        AssociationCancerType testAssociationCancerType = associationCancerTypeList.get(associationCancerTypeList.size() - 1);
        assertThat(testAssociationCancerType.getRelation()).isEqualTo(UPDATED_RELATION);
    }

    @Test
    @Transactional
    void patchNonExistingAssociationCancerType() throws Exception {
        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();
        associationCancerType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAssociationCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, associationCancerType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAssociationCancerType() throws Exception {
        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();
        associationCancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssociationCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAssociationCancerType() throws Exception {
        int databaseSizeBeforeUpdate = associationCancerTypeRepository.findAll().size();
        associationCancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAssociationCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(associationCancerType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AssociationCancerType in the database
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAssociationCancerType() throws Exception {
        // Initialize the database
        associationCancerTypeRepository.saveAndFlush(associationCancerType);

        int databaseSizeBeforeDelete = associationCancerTypeRepository.findAll().size();

        // Delete the associationCancerType
        restAssociationCancerTypeMockMvc
            .perform(delete(ENTITY_API_URL_ID, associationCancerType.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<AssociationCancerType> associationCancerTypeList = associationCancerTypeRepository.findAll();
        assertThat(associationCancerTypeList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
