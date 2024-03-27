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
import org.mskcc.oncokb.curation.domain.AlleleState;
import org.mskcc.oncokb.curation.repository.AlleleStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AlleleStateResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class AlleleStateResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/allele-states";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private AlleleStateRepository alleleStateRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAlleleStateMockMvc;

    private AlleleState alleleState;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AlleleState createEntity(EntityManager em) {
        AlleleState alleleState = new AlleleState().name(DEFAULT_NAME);
        return alleleState;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AlleleState createUpdatedEntity(EntityManager em) {
        AlleleState alleleState = new AlleleState().name(UPDATED_NAME);
        return alleleState;
    }

    @BeforeEach
    public void initTest() {
        alleleState = createEntity(em);
    }

    @Test
    @Transactional
    void createAlleleState() throws Exception {
        int databaseSizeBeforeCreate = alleleStateRepository.findAll().size();
        // Create the AlleleState
        restAlleleStateMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isCreated());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeCreate + 1);
        AlleleState testAlleleState = alleleStateList.get(alleleStateList.size() - 1);
        assertThat(testAlleleState.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createAlleleStateWithExistingId() throws Exception {
        // Create the AlleleState with an existing ID
        alleleState.setId(1L);

        int databaseSizeBeforeCreate = alleleStateRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAlleleStateMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = alleleStateRepository.findAll().size();
        // set the field null
        alleleState.setName(null);

        // Create the AlleleState, which fails.

        restAlleleStateMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isBadRequest());

        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAlleleStates() throws Exception {
        // Initialize the database
        alleleStateRepository.saveAndFlush(alleleState);

        // Get all the alleleStateList
        restAlleleStateMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alleleState.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @Test
    @Transactional
    void getAlleleState() throws Exception {
        // Initialize the database
        alleleStateRepository.saveAndFlush(alleleState);

        // Get the alleleState
        restAlleleStateMockMvc
            .perform(get(ENTITY_API_URL_ID, alleleState.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(alleleState.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getNonExistingAlleleState() throws Exception {
        // Get the alleleState
        restAlleleStateMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewAlleleState() throws Exception {
        // Initialize the database
        alleleStateRepository.saveAndFlush(alleleState);

        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();

        // Update the alleleState
        AlleleState updatedAlleleState = alleleStateRepository.findById(alleleState.getId()).get();
        // Disconnect from session so that the updates on updatedAlleleState are not directly saved in db
        em.detach(updatedAlleleState);
        updatedAlleleState.name(UPDATED_NAME);

        restAlleleStateMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedAlleleState.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedAlleleState))
            )
            .andExpect(status().isOk());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
        AlleleState testAlleleState = alleleStateList.get(alleleStateList.size() - 1);
        assertThat(testAlleleState.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingAlleleState() throws Exception {
        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();
        alleleState.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlleleStateMockMvc
            .perform(
                put(ENTITY_API_URL_ID, alleleState.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAlleleState() throws Exception {
        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();
        alleleState.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlleleStateMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAlleleState() throws Exception {
        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();
        alleleState.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlleleStateMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAlleleStateWithPatch() throws Exception {
        // Initialize the database
        alleleStateRepository.saveAndFlush(alleleState);

        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();

        // Update the alleleState using partial update
        AlleleState partialUpdatedAlleleState = new AlleleState();
        partialUpdatedAlleleState.setId(alleleState.getId());

        restAlleleStateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlleleState.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlleleState))
            )
            .andExpect(status().isOk());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
        AlleleState testAlleleState = alleleStateList.get(alleleStateList.size() - 1);
        assertThat(testAlleleState.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateAlleleStateWithPatch() throws Exception {
        // Initialize the database
        alleleStateRepository.saveAndFlush(alleleState);

        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();

        // Update the alleleState using partial update
        AlleleState partialUpdatedAlleleState = new AlleleState();
        partialUpdatedAlleleState.setId(alleleState.getId());

        partialUpdatedAlleleState.name(UPDATED_NAME);

        restAlleleStateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlleleState.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlleleState))
            )
            .andExpect(status().isOk());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
        AlleleState testAlleleState = alleleStateList.get(alleleStateList.size() - 1);
        assertThat(testAlleleState.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingAlleleState() throws Exception {
        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();
        alleleState.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlleleStateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, alleleState.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAlleleState() throws Exception {
        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();
        alleleState.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlleleStateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAlleleState() throws Exception {
        int databaseSizeBeforeUpdate = alleleStateRepository.findAll().size();
        alleleState.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlleleStateMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alleleState))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AlleleState in the database
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAlleleState() throws Exception {
        // Initialize the database
        alleleStateRepository.saveAndFlush(alleleState);

        int databaseSizeBeforeDelete = alleleStateRepository.findAll().size();

        // Delete the alleleState
        restAlleleStateMockMvc
            .perform(delete(ENTITY_API_URL_ID, alleleState.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<AlleleState> alleleStateList = alleleStateRepository.findAll();
        assertThat(alleleStateList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
