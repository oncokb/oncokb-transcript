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
import org.mskcc.oncokb.curation.domain.TreatmentPriority;
import org.mskcc.oncokb.curation.repository.TreatmentPriorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TreatmentPriorityResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TreatmentPriorityResourceIT {

    private static final Integer DEFAULT_PRIORITY = 1;
    private static final Integer UPDATED_PRIORITY = 2;

    private static final String ENTITY_API_URL = "/api/treatment-priorities";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private TreatmentPriorityRepository treatmentPriorityRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTreatmentPriorityMockMvc;

    private TreatmentPriority treatmentPriority;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TreatmentPriority createEntity(EntityManager em) {
        TreatmentPriority treatmentPriority = new TreatmentPriority().priority(DEFAULT_PRIORITY);
        return treatmentPriority;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TreatmentPriority createUpdatedEntity(EntityManager em) {
        TreatmentPriority treatmentPriority = new TreatmentPriority().priority(UPDATED_PRIORITY);
        return treatmentPriority;
    }

    @BeforeEach
    public void initTest() {
        treatmentPriority = createEntity(em);
    }

    @Test
    @Transactional
    void createTreatmentPriority() throws Exception {
        int databaseSizeBeforeCreate = treatmentPriorityRepository.findAll().size();
        // Create the TreatmentPriority
        restTreatmentPriorityMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isCreated());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeCreate + 1);
        TreatmentPriority testTreatmentPriority = treatmentPriorityList.get(treatmentPriorityList.size() - 1);
        assertThat(testTreatmentPriority.getPriority()).isEqualTo(DEFAULT_PRIORITY);
    }

    @Test
    @Transactional
    void createTreatmentPriorityWithExistingId() throws Exception {
        // Create the TreatmentPriority with an existing ID
        treatmentPriority.setId(1L);

        int databaseSizeBeforeCreate = treatmentPriorityRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTreatmentPriorityMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPriorityIsRequired() throws Exception {
        int databaseSizeBeforeTest = treatmentPriorityRepository.findAll().size();
        // set the field null
        treatmentPriority.setPriority(null);

        // Create the TreatmentPriority, which fails.

        restTreatmentPriorityMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isBadRequest());

        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTreatmentPriorities() throws Exception {
        // Initialize the database
        treatmentPriorityRepository.saveAndFlush(treatmentPriority);

        // Get all the treatmentPriorityList
        restTreatmentPriorityMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(treatmentPriority.getId().intValue())))
            .andExpect(jsonPath("$.[*].priority").value(hasItem(DEFAULT_PRIORITY)));
    }

    @Test
    @Transactional
    void getTreatmentPriority() throws Exception {
        // Initialize the database
        treatmentPriorityRepository.saveAndFlush(treatmentPriority);

        // Get the treatmentPriority
        restTreatmentPriorityMockMvc
            .perform(get(ENTITY_API_URL_ID, treatmentPriority.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(treatmentPriority.getId().intValue()))
            .andExpect(jsonPath("$.priority").value(DEFAULT_PRIORITY));
    }

    @Test
    @Transactional
    void getNonExistingTreatmentPriority() throws Exception {
        // Get the treatmentPriority
        restTreatmentPriorityMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewTreatmentPriority() throws Exception {
        // Initialize the database
        treatmentPriorityRepository.saveAndFlush(treatmentPriority);

        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();

        // Update the treatmentPriority
        TreatmentPriority updatedTreatmentPriority = treatmentPriorityRepository.findById(treatmentPriority.getId()).get();
        // Disconnect from session so that the updates on updatedTreatmentPriority are not directly saved in db
        em.detach(updatedTreatmentPriority);
        updatedTreatmentPriority.priority(UPDATED_PRIORITY);

        restTreatmentPriorityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTreatmentPriority.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedTreatmentPriority))
            )
            .andExpect(status().isOk());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
        TreatmentPriority testTreatmentPriority = treatmentPriorityList.get(treatmentPriorityList.size() - 1);
        assertThat(testTreatmentPriority.getPriority()).isEqualTo(UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void putNonExistingTreatmentPriority() throws Exception {
        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();
        treatmentPriority.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTreatmentPriorityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, treatmentPriority.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTreatmentPriority() throws Exception {
        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();
        treatmentPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentPriorityMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTreatmentPriority() throws Exception {
        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();
        treatmentPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentPriorityMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTreatmentPriorityWithPatch() throws Exception {
        // Initialize the database
        treatmentPriorityRepository.saveAndFlush(treatmentPriority);

        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();

        // Update the treatmentPriority using partial update
        TreatmentPriority partialUpdatedTreatmentPriority = new TreatmentPriority();
        partialUpdatedTreatmentPriority.setId(treatmentPriority.getId());

        restTreatmentPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTreatmentPriority.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTreatmentPriority))
            )
            .andExpect(status().isOk());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
        TreatmentPriority testTreatmentPriority = treatmentPriorityList.get(treatmentPriorityList.size() - 1);
        assertThat(testTreatmentPriority.getPriority()).isEqualTo(DEFAULT_PRIORITY);
    }

    @Test
    @Transactional
    void fullUpdateTreatmentPriorityWithPatch() throws Exception {
        // Initialize the database
        treatmentPriorityRepository.saveAndFlush(treatmentPriority);

        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();

        // Update the treatmentPriority using partial update
        TreatmentPriority partialUpdatedTreatmentPriority = new TreatmentPriority();
        partialUpdatedTreatmentPriority.setId(treatmentPriority.getId());

        partialUpdatedTreatmentPriority.priority(UPDATED_PRIORITY);

        restTreatmentPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTreatmentPriority.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTreatmentPriority))
            )
            .andExpect(status().isOk());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
        TreatmentPriority testTreatmentPriority = treatmentPriorityList.get(treatmentPriorityList.size() - 1);
        assertThat(testTreatmentPriority.getPriority()).isEqualTo(UPDATED_PRIORITY);
    }

    @Test
    @Transactional
    void patchNonExistingTreatmentPriority() throws Exception {
        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();
        treatmentPriority.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTreatmentPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, treatmentPriority.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTreatmentPriority() throws Exception {
        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();
        treatmentPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isBadRequest());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTreatmentPriority() throws Exception {
        int databaseSizeBeforeUpdate = treatmentPriorityRepository.findAll().size();
        treatmentPriority.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTreatmentPriorityMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(treatmentPriority))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the TreatmentPriority in the database
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTreatmentPriority() throws Exception {
        // Initialize the database
        treatmentPriorityRepository.saveAndFlush(treatmentPriority);

        int databaseSizeBeforeDelete = treatmentPriorityRepository.findAll().size();

        // Delete the treatmentPriority
        restTreatmentPriorityMockMvc
            .perform(delete(ENTITY_API_URL_ID, treatmentPriority.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<TreatmentPriority> treatmentPriorityList = treatmentPriorityRepository.findAll();
        assertThat(treatmentPriorityList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
