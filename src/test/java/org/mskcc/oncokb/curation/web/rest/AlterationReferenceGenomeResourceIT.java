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
import org.mskcc.oncokb.curation.domain.AlterationReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.repository.AlterationReferenceGenomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AlterationReferenceGenomeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class AlterationReferenceGenomeResourceIT {

    private static final ReferenceGenome DEFAULT_REFERENCE_GENOME = ReferenceGenome.GRCh37;
    private static final ReferenceGenome UPDATED_REFERENCE_GENOME = ReferenceGenome.GRCh38;

    private static final String ENTITY_API_URL = "/api/alteration-reference-genomes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private AlterationReferenceGenomeRepository alterationReferenceGenomeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAlterationReferenceGenomeMockMvc;

    private AlterationReferenceGenome alterationReferenceGenome;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AlterationReferenceGenome createEntity(EntityManager em) {
        AlterationReferenceGenome alterationReferenceGenome = new AlterationReferenceGenome().referenceGenome(DEFAULT_REFERENCE_GENOME);
        return alterationReferenceGenome;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AlterationReferenceGenome createUpdatedEntity(EntityManager em) {
        AlterationReferenceGenome alterationReferenceGenome = new AlterationReferenceGenome().referenceGenome(UPDATED_REFERENCE_GENOME);
        return alterationReferenceGenome;
    }

    @BeforeEach
    public void initTest() {
        alterationReferenceGenome = createEntity(em);
    }

    @Test
    @Transactional
    void createAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeCreate = alterationReferenceGenomeRepository.findAll().size();
        // Create the AlterationReferenceGenome
        restAlterationReferenceGenomeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isCreated());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeCreate + 1);
        AlterationReferenceGenome testAlterationReferenceGenome = alterationReferenceGenomeList.get(
            alterationReferenceGenomeList.size() - 1
        );
        assertThat(testAlterationReferenceGenome.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void createAlterationReferenceGenomeWithExistingId() throws Exception {
        // Create the AlterationReferenceGenome with an existing ID
        alterationReferenceGenome.setId(1L);

        int databaseSizeBeforeCreate = alterationReferenceGenomeRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAlterationReferenceGenomeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllAlterationReferenceGenomes() throws Exception {
        // Initialize the database
        alterationReferenceGenomeRepository.saveAndFlush(alterationReferenceGenome);

        // Get all the alterationReferenceGenomeList
        restAlterationReferenceGenomeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alterationReferenceGenome.getId().intValue())))
            .andExpect(jsonPath("$.[*].referenceGenome").value(hasItem(DEFAULT_REFERENCE_GENOME.toString())));
    }

    @Test
    @Transactional
    void getAlterationReferenceGenome() throws Exception {
        // Initialize the database
        alterationReferenceGenomeRepository.saveAndFlush(alterationReferenceGenome);

        // Get the alterationReferenceGenome
        restAlterationReferenceGenomeMockMvc
            .perform(get(ENTITY_API_URL_ID, alterationReferenceGenome.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(alterationReferenceGenome.getId().intValue()))
            .andExpect(jsonPath("$.referenceGenome").value(DEFAULT_REFERENCE_GENOME.toString()));
    }

    @Test
    @Transactional
    void getNonExistingAlterationReferenceGenome() throws Exception {
        // Get the alterationReferenceGenome
        restAlterationReferenceGenomeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewAlterationReferenceGenome() throws Exception {
        // Initialize the database
        alterationReferenceGenomeRepository.saveAndFlush(alterationReferenceGenome);

        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();

        // Update the alterationReferenceGenome
        AlterationReferenceGenome updatedAlterationReferenceGenome = alterationReferenceGenomeRepository
            .findById(alterationReferenceGenome.getId())
            .get();
        // Disconnect from session so that the updates on updatedAlterationReferenceGenome are not directly saved in db
        em.detach(updatedAlterationReferenceGenome);
        updatedAlterationReferenceGenome.referenceGenome(UPDATED_REFERENCE_GENOME);

        restAlterationReferenceGenomeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedAlterationReferenceGenome.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedAlterationReferenceGenome))
            )
            .andExpect(status().isOk());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
        AlterationReferenceGenome testAlterationReferenceGenome = alterationReferenceGenomeList.get(
            alterationReferenceGenomeList.size() - 1
        );
        assertThat(testAlterationReferenceGenome.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void putNonExistingAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();
        alterationReferenceGenome.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlterationReferenceGenomeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, alterationReferenceGenome.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();
        alterationReferenceGenome.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationReferenceGenomeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();
        alterationReferenceGenome.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationReferenceGenomeMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAlterationReferenceGenomeWithPatch() throws Exception {
        // Initialize the database
        alterationReferenceGenomeRepository.saveAndFlush(alterationReferenceGenome);

        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();

        // Update the alterationReferenceGenome using partial update
        AlterationReferenceGenome partialUpdatedAlterationReferenceGenome = new AlterationReferenceGenome();
        partialUpdatedAlterationReferenceGenome.setId(alterationReferenceGenome.getId());

        partialUpdatedAlterationReferenceGenome.referenceGenome(UPDATED_REFERENCE_GENOME);

        restAlterationReferenceGenomeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlterationReferenceGenome.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlterationReferenceGenome))
            )
            .andExpect(status().isOk());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
        AlterationReferenceGenome testAlterationReferenceGenome = alterationReferenceGenomeList.get(
            alterationReferenceGenomeList.size() - 1
        );
        assertThat(testAlterationReferenceGenome.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void fullUpdateAlterationReferenceGenomeWithPatch() throws Exception {
        // Initialize the database
        alterationReferenceGenomeRepository.saveAndFlush(alterationReferenceGenome);

        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();

        // Update the alterationReferenceGenome using partial update
        AlterationReferenceGenome partialUpdatedAlterationReferenceGenome = new AlterationReferenceGenome();
        partialUpdatedAlterationReferenceGenome.setId(alterationReferenceGenome.getId());

        partialUpdatedAlterationReferenceGenome.referenceGenome(UPDATED_REFERENCE_GENOME);

        restAlterationReferenceGenomeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlterationReferenceGenome.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlterationReferenceGenome))
            )
            .andExpect(status().isOk());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
        AlterationReferenceGenome testAlterationReferenceGenome = alterationReferenceGenomeList.get(
            alterationReferenceGenomeList.size() - 1
        );
        assertThat(testAlterationReferenceGenome.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void patchNonExistingAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();
        alterationReferenceGenome.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlterationReferenceGenomeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, alterationReferenceGenome.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();
        alterationReferenceGenome.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationReferenceGenomeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isBadRequest());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAlterationReferenceGenome() throws Exception {
        int databaseSizeBeforeUpdate = alterationReferenceGenomeRepository.findAll().size();
        alterationReferenceGenome.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationReferenceGenomeMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alterationReferenceGenome))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AlterationReferenceGenome in the database
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAlterationReferenceGenome() throws Exception {
        // Initialize the database
        alterationReferenceGenomeRepository.saveAndFlush(alterationReferenceGenome);

        int databaseSizeBeforeDelete = alterationReferenceGenomeRepository.findAll().size();

        // Delete the alterationReferenceGenome
        restAlterationReferenceGenomeMockMvc
            .perform(delete(ENTITY_API_URL_ID, alterationReferenceGenome.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<AlterationReferenceGenome> alterationReferenceGenomeList = alterationReferenceGenomeRepository.findAll();
        assertThat(alterationReferenceGenomeList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
