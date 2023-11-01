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
import org.mskcc.oncokb.curation.domain.DrugPriority;
import org.mskcc.oncokb.curation.repository.DrugPriorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link DrugPriorityResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DrugPriorityResourceIT {

    private static final Integer DEFAULT_PRIORITY = 1;
    private static final Integer UPDATED_PRIORITY = 2;

    private static final String ENTITY_API_URL = "/api/drug-priorities";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DrugPriorityRepository drugPriorityRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDrugPriorityMockMvc;

    private DrugPriority drugPriority;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DrugPriority createEntity(EntityManager em) {
        DrugPriority drugPriority = new DrugPriority().priority(DEFAULT_PRIORITY);
        return drugPriority;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DrugPriority createUpdatedEntity(EntityManager em) {
        DrugPriority drugPriority = new DrugPriority().priority(UPDATED_PRIORITY);
        return drugPriority;
    }

    @BeforeEach
    public void initTest() {
        drugPriority = createEntity(em);
    }

    @Test
    @Transactional
    void createDrugPriority() throws Exception {
        int databaseSizeBeforeCreate = drugPriorityRepository.findAll().size();
        // Create the DrugPriority
        restDrugPriorityMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isCreated());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeCreate + 1);
        DrugPriority testDrugPriority = drugPriorityList.get(drugPriorityList.size() - 1);
        assertThat(testDrugPriority.getPriority()).isEqualTo(DEFAULT_PRIORITY);
    }

    @Test
    @Transactional
    void createDrugPriorityWithExistingId() throws Exception {
        // Create the DrugPriority with an existing ID
        drugPriority.setId(1L);

        int databaseSizeBeforeCreate = drugPriorityRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDrugPriorityMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPriorityIsRequired() throws Exception {
        int databaseSizeBeforeTest = drugPriorityRepository.findAll().size();
        // set the field null
        drugPriority.setPriority(null);

        // Create the DrugPriority, which fails.

        restDrugPriorityMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isBadRequest());

        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDrugPriorities() throws Exception {
        // Initialize the database
        drugPriorityRepository.saveAndFlush(drugPriority);

        // Get all the drugPriorityList
        restDrugPriorityMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drugPriority.getId().intValue())))
            .andExpect(jsonPath("$.[*].priority").value(hasItem(DEFAULT_PRIORITY)));
    }

    @Test
    @Transactional
    void getDrugPriority() throws Exception {
        // Initialize the database
        drugPriorityRepository.saveAndFlush(drugPriority);

        // Get the drugPriority
        restDrugPriorityMockMvc
            .perform(get(ENTITY_API_URL_ID, drugPriority.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(drugPriority.getId().intValue()))
            .andExpect(jsonPath("$.priority").value(DEFAULT_PRIORITY));
    }

    @Test
    @Transactional
    void getNonExistingDrugPriority() throws Exception {
        // Get the drugPriority
        restDrugPriorityMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewDrugPriority() throws Exception {
        // Initialize the database
        drugPriorityRepository.saveAndFlush(drugPriority);

        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();

        // Update the drugPriority
        DrugPriority updatedDrugPriority = drugPriorityRepository.findById(drugPriority.getId()).get();
        // Disconnect from session so that the updates on updatedDrugPriority are not directly saved in db
        em.detach(updatedDrugPriority);
        updatedDrugPriority.priority(UPDATED_PRIORITY);

        restDrugPriorityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDrugPriority.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedDrugPriority))
            )
            .andExpect(status().isOk());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
        DrugPriority testDrugPriority = drugPriorityList.get(drugPriorityList.size() - 1);
        assertThat(testDrugPriority.getPriority()).isEqualTo(UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void putNonExistingDrugPriority() throws Exception {
        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();
        drugPriority.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugPriorityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, drugPriority.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDrugPriority() throws Exception {
        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();
        drugPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugPriorityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDrugPriority() throws Exception {
        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();
        drugPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugPriorityMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDrugPriorityWithPatch() throws Exception {
        // Initialize the database
        drugPriorityRepository.saveAndFlush(drugPriority);

        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();

        // Update the drugPriority using partial update
        DrugPriority partialUpdatedDrugPriority = new DrugPriority();
        partialUpdatedDrugPriority.setId(drugPriority.getId());

        restDrugPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrugPriority.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrugPriority))
            )
            .andExpect(status().isOk());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
        DrugPriority testDrugPriority = drugPriorityList.get(drugPriorityList.size() - 1);
        assertThat(testDrugPriority.getPriority()).isEqualTo(DEFAULT_PRIORITY);
    }

    @Test
    @Transactional
    void fullUpdateDrugPriorityWithPatch() throws Exception {
        // Initialize the database
        drugPriorityRepository.saveAndFlush(drugPriority);

        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();

        // Update the drugPriority using partial update
        DrugPriority partialUpdatedDrugPriority = new DrugPriority();
        partialUpdatedDrugPriority.setId(drugPriority.getId());

        partialUpdatedDrugPriority.priority(UPDATED_PRIORITY);

        restDrugPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrugPriority.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrugPriority))
            )
            .andExpect(status().isOk());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
        DrugPriority testDrugPriority = drugPriorityList.get(drugPriorityList.size() - 1);
        assertThat(testDrugPriority.getPriority()).isEqualTo(UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void patchNonExistingDrugPriority() throws Exception {
        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();
        drugPriority.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, drugPriority.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDrugPriority() throws Exception {
        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();
        drugPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDrugPriority() throws Exception {
        int databaseSizeBeforeUpdate = drugPriorityRepository.findAll().size();
        drugPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugPriority))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DrugPriority in the database
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDrugPriority() throws Exception {
        // Initialize the database
        drugPriorityRepository.saveAndFlush(drugPriority);

        int databaseSizeBeforeDelete = drugPriorityRepository.findAll().size();

        // Delete the drugPriority
        restDrugPriorityMockMvc
            .perform(delete(ENTITY_API_URL_ID, drugPriority.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<DrugPriority> drugPriorityList = drugPriorityRepository.findAll();
        assertThat(drugPriorityList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
