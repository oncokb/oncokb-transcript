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
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.repository.BiomarkerAssociationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link BiomarkerAssociationResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class BiomarkerAssociationResourceIT {

    private static final String ENTITY_API_URL = "/api/biomarker-associations";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private BiomarkerAssociationRepository biomarkerAssociationRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restBiomarkerAssociationMockMvc;

    private BiomarkerAssociation biomarkerAssociation;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static BiomarkerAssociation createEntity(EntityManager em) {
        BiomarkerAssociation biomarkerAssociation = new BiomarkerAssociation();
        return biomarkerAssociation;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static BiomarkerAssociation createUpdatedEntity(EntityManager em) {
        BiomarkerAssociation biomarkerAssociation = new BiomarkerAssociation();
        return biomarkerAssociation;
    }

    @BeforeEach
    public void initTest() {
        biomarkerAssociation = createEntity(em);
    }

    @Test
    @Transactional
    void createBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeCreate = biomarkerAssociationRepository.findAll().size();
        // Create the BiomarkerAssociation
        restBiomarkerAssociationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isCreated());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeCreate + 1);
        BiomarkerAssociation testBiomarkerAssociation = biomarkerAssociationList.get(biomarkerAssociationList.size() - 1);
    }

    @Test
    @Transactional
    void createBiomarkerAssociationWithExistingId() throws Exception {
        // Create the BiomarkerAssociation with an existing ID
        biomarkerAssociation.setId(1L);

        int databaseSizeBeforeCreate = biomarkerAssociationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restBiomarkerAssociationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isBadRequest());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllBiomarkerAssociations() throws Exception {
        // Initialize the database
        biomarkerAssociationRepository.saveAndFlush(biomarkerAssociation);

        // Get all the biomarkerAssociationList
        restBiomarkerAssociationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(biomarkerAssociation.getId().intValue())));
    }

    @Test
    @Transactional
    void getBiomarkerAssociation() throws Exception {
        // Initialize the database
        biomarkerAssociationRepository.saveAndFlush(biomarkerAssociation);

        // Get the biomarkerAssociation
        restBiomarkerAssociationMockMvc
            .perform(get(ENTITY_API_URL_ID, biomarkerAssociation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(biomarkerAssociation.getId().intValue()));
    }

    @Test
    @Transactional
    void getNonExistingBiomarkerAssociation() throws Exception {
        // Get the biomarkerAssociation
        restBiomarkerAssociationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewBiomarkerAssociation() throws Exception {
        // Initialize the database
        biomarkerAssociationRepository.saveAndFlush(biomarkerAssociation);

        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();

        // Update the biomarkerAssociation
        BiomarkerAssociation updatedBiomarkerAssociation = biomarkerAssociationRepository.findById(biomarkerAssociation.getId()).get();
        // Disconnect from session so that the updates on updatedBiomarkerAssociation are not directly saved in db
        em.detach(updatedBiomarkerAssociation);

        restBiomarkerAssociationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedBiomarkerAssociation.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedBiomarkerAssociation))
            )
            .andExpect(status().isOk());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
        BiomarkerAssociation testBiomarkerAssociation = biomarkerAssociationList.get(biomarkerAssociationList.size() - 1);
    }

    @Test
    @Transactional
    void putNonExistingBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();
        biomarkerAssociation.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBiomarkerAssociationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, biomarkerAssociation.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isBadRequest());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();
        biomarkerAssociation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBiomarkerAssociationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isBadRequest());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();
        biomarkerAssociation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBiomarkerAssociationMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateBiomarkerAssociationWithPatch() throws Exception {
        // Initialize the database
        biomarkerAssociationRepository.saveAndFlush(biomarkerAssociation);

        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();

        // Update the biomarkerAssociation using partial update
        BiomarkerAssociation partialUpdatedBiomarkerAssociation = new BiomarkerAssociation();
        partialUpdatedBiomarkerAssociation.setId(biomarkerAssociation.getId());

        restBiomarkerAssociationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBiomarkerAssociation.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedBiomarkerAssociation))
            )
            .andExpect(status().isOk());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
        BiomarkerAssociation testBiomarkerAssociation = biomarkerAssociationList.get(biomarkerAssociationList.size() - 1);
    }

    @Test
    @Transactional
    void fullUpdateBiomarkerAssociationWithPatch() throws Exception {
        // Initialize the database
        biomarkerAssociationRepository.saveAndFlush(biomarkerAssociation);

        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();

        // Update the biomarkerAssociation using partial update
        BiomarkerAssociation partialUpdatedBiomarkerAssociation = new BiomarkerAssociation();
        partialUpdatedBiomarkerAssociation.setId(biomarkerAssociation.getId());

        restBiomarkerAssociationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBiomarkerAssociation.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedBiomarkerAssociation))
            )
            .andExpect(status().isOk());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
        BiomarkerAssociation testBiomarkerAssociation = biomarkerAssociationList.get(biomarkerAssociationList.size() - 1);
    }

    @Test
    @Transactional
    void patchNonExistingBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();
        biomarkerAssociation.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBiomarkerAssociationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, biomarkerAssociation.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isBadRequest());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();
        biomarkerAssociation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBiomarkerAssociationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isBadRequest());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamBiomarkerAssociation() throws Exception {
        int databaseSizeBeforeUpdate = biomarkerAssociationRepository.findAll().size();
        biomarkerAssociation.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBiomarkerAssociationMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(biomarkerAssociation))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the BiomarkerAssociation in the database
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteBiomarkerAssociation() throws Exception {
        // Initialize the database
        biomarkerAssociationRepository.saveAndFlush(biomarkerAssociation);

        int databaseSizeBeforeDelete = biomarkerAssociationRepository.findAll().size();

        // Delete the biomarkerAssociation
        restBiomarkerAssociationMockMvc
            .perform(delete(ENTITY_API_URL_ID, biomarkerAssociation.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<BiomarkerAssociation> biomarkerAssociationList = biomarkerAssociationRepository.findAll();
        assertThat(biomarkerAssociationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
