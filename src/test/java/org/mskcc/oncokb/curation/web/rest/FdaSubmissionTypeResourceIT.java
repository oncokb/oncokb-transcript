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
import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.mskcc.oncokb.curation.domain.enumeration.FdaSubmissionTypeKey;
import org.mskcc.oncokb.curation.repository.FdaSubmissionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link FdaSubmissionTypeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FdaSubmissionTypeResourceIT {

    private static final FdaSubmissionTypeKey DEFAULT_KEY = FdaSubmissionTypeKey.PMA;
    private static final FdaSubmissionTypeKey UPDATED_KEY = FdaSubmissionTypeKey.DE_NOVO;

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_SHORT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_SHORT_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/fda-submission-types";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private FdaSubmissionTypeRepository fdaSubmissionTypeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFdaSubmissionTypeMockMvc;

    private FdaSubmissionType fdaSubmissionType;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FdaSubmissionType createEntity(EntityManager em) {
        FdaSubmissionType fdaSubmissionType = new FdaSubmissionType()
            .key(DEFAULT_KEY)
            .name(DEFAULT_NAME)
            .shortName(DEFAULT_SHORT_NAME)
            .description(DEFAULT_DESCRIPTION);
        return fdaSubmissionType;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FdaSubmissionType createUpdatedEntity(EntityManager em) {
        FdaSubmissionType fdaSubmissionType = new FdaSubmissionType()
            .key(UPDATED_KEY)
            .name(UPDATED_NAME)
            .shortName(UPDATED_SHORT_NAME)
            .description(UPDATED_DESCRIPTION);
        return fdaSubmissionType;
    }

    @BeforeEach
    public void initTest() {
        fdaSubmissionType = createEntity(em);
    }

    @Test
    @Transactional
    void createFdaSubmissionType() throws Exception {
        int databaseSizeBeforeCreate = fdaSubmissionTypeRepository.findAll().size();
        // Create the FdaSubmissionType
        restFdaSubmissionTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isCreated());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeCreate + 1);
        FdaSubmissionType testFdaSubmissionType = fdaSubmissionTypeList.get(fdaSubmissionTypeList.size() - 1);
        assertThat(testFdaSubmissionType.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testFdaSubmissionType.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFdaSubmissionType.getShortName()).isEqualTo(DEFAULT_SHORT_NAME);
        assertThat(testFdaSubmissionType.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createFdaSubmissionTypeWithExistingId() throws Exception {
        // Create the FdaSubmissionType with an existing ID
        fdaSubmissionType.setId(1L);

        int databaseSizeBeforeCreate = fdaSubmissionTypeRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFdaSubmissionTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkKeyIsRequired() throws Exception {
        int databaseSizeBeforeTest = fdaSubmissionTypeRepository.findAll().size();
        // set the field null
        fdaSubmissionType.setKey(null);

        // Create the FdaSubmissionType, which fails.

        restFdaSubmissionTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = fdaSubmissionTypeRepository.findAll().size();
        // set the field null
        fdaSubmissionType.setName(null);

        // Create the FdaSubmissionType, which fails.

        restFdaSubmissionTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionTypes() throws Exception {
        // Initialize the database
        fdaSubmissionTypeRepository.saveAndFlush(fdaSubmissionType);

        // Get all the fdaSubmissionTypeList
        restFdaSubmissionTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fdaSubmissionType.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].shortName").value(hasItem(DEFAULT_SHORT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    void getFdaSubmissionType() throws Exception {
        // Initialize the database
        fdaSubmissionTypeRepository.saveAndFlush(fdaSubmissionType);

        // Get the fdaSubmissionType
        restFdaSubmissionTypeMockMvc
            .perform(get(ENTITY_API_URL_ID, fdaSubmissionType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(fdaSubmissionType.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.shortName").value(DEFAULT_SHORT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingFdaSubmissionType() throws Exception {
        // Get the fdaSubmissionType
        restFdaSubmissionTypeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewFdaSubmissionType() throws Exception {
        // Initialize the database
        fdaSubmissionTypeRepository.saveAndFlush(fdaSubmissionType);

        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();

        // Update the fdaSubmissionType
        FdaSubmissionType updatedFdaSubmissionType = fdaSubmissionTypeRepository.findById(fdaSubmissionType.getId()).get();
        // Disconnect from session so that the updates on updatedFdaSubmissionType are not directly saved in db
        em.detach(updatedFdaSubmissionType);
        updatedFdaSubmissionType.key(UPDATED_KEY).name(UPDATED_NAME).shortName(UPDATED_SHORT_NAME).description(UPDATED_DESCRIPTION);

        restFdaSubmissionTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFdaSubmissionType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedFdaSubmissionType))
            )
            .andExpect(status().isOk());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
        FdaSubmissionType testFdaSubmissionType = fdaSubmissionTypeList.get(fdaSubmissionTypeList.size() - 1);
        assertThat(testFdaSubmissionType.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testFdaSubmissionType.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFdaSubmissionType.getShortName()).isEqualTo(UPDATED_SHORT_NAME);
        assertThat(testFdaSubmissionType.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingFdaSubmissionType() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();
        fdaSubmissionType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFdaSubmissionTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, fdaSubmissionType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFdaSubmissionType() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();
        fdaSubmissionType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFdaSubmissionType() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();
        fdaSubmissionType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionTypeMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFdaSubmissionTypeWithPatch() throws Exception {
        // Initialize the database
        fdaSubmissionTypeRepository.saveAndFlush(fdaSubmissionType);

        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();

        // Update the fdaSubmissionType using partial update
        FdaSubmissionType partialUpdatedFdaSubmissionType = new FdaSubmissionType();
        partialUpdatedFdaSubmissionType.setId(fdaSubmissionType.getId());

        partialUpdatedFdaSubmissionType.key(UPDATED_KEY).name(UPDATED_NAME);

        restFdaSubmissionTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFdaSubmissionType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFdaSubmissionType))
            )
            .andExpect(status().isOk());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
        FdaSubmissionType testFdaSubmissionType = fdaSubmissionTypeList.get(fdaSubmissionTypeList.size() - 1);
        assertThat(testFdaSubmissionType.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testFdaSubmissionType.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFdaSubmissionType.getShortName()).isEqualTo(DEFAULT_SHORT_NAME);
        assertThat(testFdaSubmissionType.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateFdaSubmissionTypeWithPatch() throws Exception {
        // Initialize the database
        fdaSubmissionTypeRepository.saveAndFlush(fdaSubmissionType);

        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();

        // Update the fdaSubmissionType using partial update
        FdaSubmissionType partialUpdatedFdaSubmissionType = new FdaSubmissionType();
        partialUpdatedFdaSubmissionType.setId(fdaSubmissionType.getId());

        partialUpdatedFdaSubmissionType.key(UPDATED_KEY).name(UPDATED_NAME).shortName(UPDATED_SHORT_NAME).description(UPDATED_DESCRIPTION);

        restFdaSubmissionTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFdaSubmissionType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFdaSubmissionType))
            )
            .andExpect(status().isOk());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
        FdaSubmissionType testFdaSubmissionType = fdaSubmissionTypeList.get(fdaSubmissionTypeList.size() - 1);
        assertThat(testFdaSubmissionType.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testFdaSubmissionType.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFdaSubmissionType.getShortName()).isEqualTo(UPDATED_SHORT_NAME);
        assertThat(testFdaSubmissionType.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingFdaSubmissionType() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();
        fdaSubmissionType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFdaSubmissionTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, fdaSubmissionType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFdaSubmissionType() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();
        fdaSubmissionType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFdaSubmissionType() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionTypeRepository.findAll().size();
        fdaSubmissionType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionTypeMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmissionType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FdaSubmissionType in the database
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFdaSubmissionType() throws Exception {
        // Initialize the database
        fdaSubmissionTypeRepository.saveAndFlush(fdaSubmissionType);

        int databaseSizeBeforeDelete = fdaSubmissionTypeRepository.findAll().size();

        // Delete the fdaSubmissionType
        restFdaSubmissionTypeMockMvc
            .perform(delete(ENTITY_API_URL_ID, fdaSubmissionType.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<FdaSubmissionType> fdaSubmissionTypeList = fdaSubmissionTypeRepository.findAll();
        assertThat(fdaSubmissionTypeList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
