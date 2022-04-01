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
import org.mskcc.oncokb.curation.domain.SpecimenType;
import org.mskcc.oncokb.curation.repository.SpecimenTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link SpecimenTypeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SpecimenTypeResourceIT {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/specimen-types";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private SpecimenTypeRepository specimenTypeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSpecimenTypeMockMvc;

    private SpecimenType specimenType;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SpecimenType createEntity(EntityManager em) {
        SpecimenType specimenType = new SpecimenType().type(DEFAULT_TYPE).name(DEFAULT_NAME);
        return specimenType;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SpecimenType createUpdatedEntity(EntityManager em) {
        SpecimenType specimenType = new SpecimenType().type(UPDATED_TYPE).name(UPDATED_NAME);
        return specimenType;
    }

    @BeforeEach
    public void initTest() {
        specimenType = createEntity(em);
    }

    @Test
    @Transactional
    void createSpecimenType() throws Exception {
        int databaseSizeBeforeCreate = specimenTypeRepository.findAll().size();
        // Create the SpecimenType
        restSpecimenTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isCreated());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeCreate + 1);
        SpecimenType testSpecimenType = specimenTypeList.get(specimenTypeList.size() - 1);
        assertThat(testSpecimenType.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testSpecimenType.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createSpecimenTypeWithExistingId() throws Exception {
        // Create the SpecimenType with an existing ID
        specimenType.setId(1L);

        int databaseSizeBeforeCreate = specimenTypeRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSpecimenTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = specimenTypeRepository.findAll().size();
        // set the field null
        specimenType.setType(null);

        // Create the SpecimenType, which fails.

        restSpecimenTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = specimenTypeRepository.findAll().size();
        // set the field null
        specimenType.setName(null);

        // Create the SpecimenType, which fails.

        restSpecimenTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSpecimenTypes() throws Exception {
        // Initialize the database
        specimenTypeRepository.saveAndFlush(specimenType);

        // Get all the specimenTypeList
        restSpecimenTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(specimenType.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @Test
    @Transactional
    void getSpecimenType() throws Exception {
        // Initialize the database
        specimenTypeRepository.saveAndFlush(specimenType);

        // Get the specimenType
        restSpecimenTypeMockMvc
            .perform(get(ENTITY_API_URL_ID, specimenType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(specimenType.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getNonExistingSpecimenType() throws Exception {
        // Get the specimenType
        restSpecimenTypeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewSpecimenType() throws Exception {
        // Initialize the database
        specimenTypeRepository.saveAndFlush(specimenType);

        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();

        // Update the specimenType
        SpecimenType updatedSpecimenType = specimenTypeRepository.findById(specimenType.getId()).get();
        // Disconnect from session so that the updates on updatedSpecimenType are not directly saved in db
        em.detach(updatedSpecimenType);
        updatedSpecimenType.type(UPDATED_TYPE).name(UPDATED_NAME);

        restSpecimenTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedSpecimenType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedSpecimenType))
            )
            .andExpect(status().isOk());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
        SpecimenType testSpecimenType = specimenTypeList.get(specimenTypeList.size() - 1);
        assertThat(testSpecimenType.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testSpecimenType.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingSpecimenType() throws Exception {
        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();
        specimenType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSpecimenTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, specimenType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSpecimenType() throws Exception {
        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();
        specimenType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSpecimenTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSpecimenType() throws Exception {
        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();
        specimenType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSpecimenTypeMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSpecimenTypeWithPatch() throws Exception {
        // Initialize the database
        specimenTypeRepository.saveAndFlush(specimenType);

        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();

        // Update the specimenType using partial update
        SpecimenType partialUpdatedSpecimenType = new SpecimenType();
        partialUpdatedSpecimenType.setId(specimenType.getId());

        partialUpdatedSpecimenType.type(UPDATED_TYPE);

        restSpecimenTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSpecimenType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSpecimenType))
            )
            .andExpect(status().isOk());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
        SpecimenType testSpecimenType = specimenTypeList.get(specimenTypeList.size() - 1);
        assertThat(testSpecimenType.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testSpecimenType.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateSpecimenTypeWithPatch() throws Exception {
        // Initialize the database
        specimenTypeRepository.saveAndFlush(specimenType);

        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();

        // Update the specimenType using partial update
        SpecimenType partialUpdatedSpecimenType = new SpecimenType();
        partialUpdatedSpecimenType.setId(specimenType.getId());

        partialUpdatedSpecimenType.type(UPDATED_TYPE).name(UPDATED_NAME);

        restSpecimenTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSpecimenType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSpecimenType))
            )
            .andExpect(status().isOk());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
        SpecimenType testSpecimenType = specimenTypeList.get(specimenTypeList.size() - 1);
        assertThat(testSpecimenType.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testSpecimenType.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingSpecimenType() throws Exception {
        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();
        specimenType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSpecimenTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, specimenType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSpecimenType() throws Exception {
        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();
        specimenType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSpecimenTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isBadRequest());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSpecimenType() throws Exception {
        int databaseSizeBeforeUpdate = specimenTypeRepository.findAll().size();
        specimenType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSpecimenTypeMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(specimenType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SpecimenType in the database
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSpecimenType() throws Exception {
        // Initialize the database
        specimenTypeRepository.saveAndFlush(specimenType);

        int databaseSizeBeforeDelete = specimenTypeRepository.findAll().size();

        // Delete the specimenType
        restSpecimenTypeMockMvc
            .perform(delete(ENTITY_API_URL_ID, specimenType.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<SpecimenType> specimenTypeList = specimenTypeRepository.findAll();
        assertThat(specimenTypeList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
