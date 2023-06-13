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
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.repository.ArticleRepository;
import org.mskcc.oncokb.curation.service.criteria.ArticleCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link ArticleResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ArticleResourceIT {

    private static final String DEFAULT_PMID = "AAAAAAAAAA";
    private static final String UPDATED_PMID = "BBBBBBBBBB";

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_JOURNAL = "AAAAAAAAAA";
    private static final String UPDATED_JOURNAL = "BBBBBBBBBB";

    private static final String DEFAULT_PUB_DATE = "AAAAAAAAAA";
    private static final String UPDATED_PUB_DATE = "BBBBBBBBBB";

    private static final String DEFAULT_VOLUME = "AAAAAAAAAA";
    private static final String UPDATED_VOLUME = "BBBBBBBBBB";

    private static final String DEFAULT_ISSUE = "AAAAAAAAAA";
    private static final String UPDATED_ISSUE = "BBBBBBBBBB";

    private static final String DEFAULT_PAGES = "AAAAAAAAAA";
    private static final String UPDATED_PAGES = "BBBBBBBBBB";

    private static final String DEFAULT_AUTHORS = "AAAAAAAAAA";
    private static final String UPDATED_AUTHORS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/articles";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restArticleMockMvc;

    private Article article;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Article createEntity(EntityManager em) {
        Article article = new Article()
            .pmid(DEFAULT_PMID)
            .title(DEFAULT_TITLE)
            .journal(DEFAULT_JOURNAL)
            .pubDate(DEFAULT_PUB_DATE)
            .volume(DEFAULT_VOLUME)
            .issue(DEFAULT_ISSUE)
            .pages(DEFAULT_PAGES)
            .authors(DEFAULT_AUTHORS);
        return article;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Article createUpdatedEntity(EntityManager em) {
        Article article = new Article()
            .pmid(UPDATED_PMID)
            .title(UPDATED_TITLE)
            .journal(UPDATED_JOURNAL)
            .pubDate(UPDATED_PUB_DATE)
            .volume(UPDATED_VOLUME)
            .issue(UPDATED_ISSUE)
            .pages(UPDATED_PAGES)
            .authors(UPDATED_AUTHORS);
        return article;
    }

    @BeforeEach
    public void initTest() {
        article = createEntity(em);
    }

    @Test
    @Transactional
    void createArticle() throws Exception {
        int databaseSizeBeforeCreate = articleRepository.findAll().size();
        // Create the Article
        restArticleMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isCreated());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeCreate + 1);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getPmid()).isEqualTo(DEFAULT_PMID);
        assertThat(testArticle.getTitle()).isEqualTo(DEFAULT_TITLE);
        assertThat(testArticle.getJournal()).isEqualTo(DEFAULT_JOURNAL);
        assertThat(testArticle.getPubDate()).isEqualTo(DEFAULT_PUB_DATE);
        assertThat(testArticle.getVolume()).isEqualTo(DEFAULT_VOLUME);
        assertThat(testArticle.getIssue()).isEqualTo(DEFAULT_ISSUE);
        assertThat(testArticle.getPages()).isEqualTo(DEFAULT_PAGES);
        assertThat(testArticle.getAuthors()).isEqualTo(DEFAULT_AUTHORS);
    }

    @Test
    @Transactional
    void createArticleWithExistingId() throws Exception {
        // Create the Article with an existing ID
        article.setId(1L);

        int databaseSizeBeforeCreate = articleRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restArticleMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllArticles() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(article.getId().intValue())))
            .andExpect(jsonPath("$.[*].pmid").value(hasItem(DEFAULT_PMID)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE.toString())))
            .andExpect(jsonPath("$.[*].journal").value(hasItem(DEFAULT_JOURNAL)))
            .andExpect(jsonPath("$.[*].pubDate").value(hasItem(DEFAULT_PUB_DATE)))
            .andExpect(jsonPath("$.[*].volume").value(hasItem(DEFAULT_VOLUME)))
            .andExpect(jsonPath("$.[*].issue").value(hasItem(DEFAULT_ISSUE)))
            .andExpect(jsonPath("$.[*].pages").value(hasItem(DEFAULT_PAGES)))
            .andExpect(jsonPath("$.[*].authors").value(hasItem(DEFAULT_AUTHORS)));
    }

    @Test
    @Transactional
    void getArticle() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get the article
        restArticleMockMvc
            .perform(get(ENTITY_API_URL_ID, article.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(article.getId().intValue()))
            .andExpect(jsonPath("$.pmid").value(DEFAULT_PMID))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE.toString()))
            .andExpect(jsonPath("$.journal").value(DEFAULT_JOURNAL))
            .andExpect(jsonPath("$.pubDate").value(DEFAULT_PUB_DATE))
            .andExpect(jsonPath("$.volume").value(DEFAULT_VOLUME))
            .andExpect(jsonPath("$.issue").value(DEFAULT_ISSUE))
            .andExpect(jsonPath("$.pages").value(DEFAULT_PAGES))
            .andExpect(jsonPath("$.authors").value(DEFAULT_AUTHORS));
    }

    @Test
    @Transactional
    void getArticlesByIdFiltering() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        Long id = article.getId();

        defaultArticleShouldBeFound("id.equals=" + id);
        defaultArticleShouldNotBeFound("id.notEquals=" + id);

        defaultArticleShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultArticleShouldNotBeFound("id.greaterThan=" + id);

        defaultArticleShouldBeFound("id.lessThanOrEqual=" + id);
        defaultArticleShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllArticlesByPmidIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pmid equals to DEFAULT_PMID
        defaultArticleShouldBeFound("pmid.equals=" + DEFAULT_PMID);

        // Get all the articleList where pmid equals to UPDATED_PMID
        defaultArticleShouldNotBeFound("pmid.equals=" + UPDATED_PMID);
    }

    @Test
    @Transactional
    void getAllArticlesByPmidIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pmid not equals to DEFAULT_PMID
        defaultArticleShouldNotBeFound("pmid.notEquals=" + DEFAULT_PMID);

        // Get all the articleList where pmid not equals to UPDATED_PMID
        defaultArticleShouldBeFound("pmid.notEquals=" + UPDATED_PMID);
    }

    @Test
    @Transactional
    void getAllArticlesByPmidIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pmid in DEFAULT_PMID or UPDATED_PMID
        defaultArticleShouldBeFound("pmid.in=" + DEFAULT_PMID + "," + UPDATED_PMID);

        // Get all the articleList where pmid equals to UPDATED_PMID
        defaultArticleShouldNotBeFound("pmid.in=" + UPDATED_PMID);
    }

    @Test
    @Transactional
    void getAllArticlesByPmidIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pmid is not null
        defaultArticleShouldBeFound("pmid.specified=true");

        // Get all the articleList where pmid is null
        defaultArticleShouldNotBeFound("pmid.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByPmidContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pmid contains DEFAULT_PMID
        defaultArticleShouldBeFound("pmid.contains=" + DEFAULT_PMID);

        // Get all the articleList where pmid contains UPDATED_PMID
        defaultArticleShouldNotBeFound("pmid.contains=" + UPDATED_PMID);
    }

    @Test
    @Transactional
    void getAllArticlesByPmidNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pmid does not contain DEFAULT_PMID
        defaultArticleShouldNotBeFound("pmid.doesNotContain=" + DEFAULT_PMID);

        // Get all the articleList where pmid does not contain UPDATED_PMID
        defaultArticleShouldBeFound("pmid.doesNotContain=" + UPDATED_PMID);
    }

    @Test
    @Transactional
    void getAllArticlesByJournalIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where journal equals to DEFAULT_JOURNAL
        defaultArticleShouldBeFound("journal.equals=" + DEFAULT_JOURNAL);

        // Get all the articleList where journal equals to UPDATED_JOURNAL
        defaultArticleShouldNotBeFound("journal.equals=" + UPDATED_JOURNAL);
    }

    @Test
    @Transactional
    void getAllArticlesByJournalIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where journal not equals to DEFAULT_JOURNAL
        defaultArticleShouldNotBeFound("journal.notEquals=" + DEFAULT_JOURNAL);

        // Get all the articleList where journal not equals to UPDATED_JOURNAL
        defaultArticleShouldBeFound("journal.notEquals=" + UPDATED_JOURNAL);
    }

    @Test
    @Transactional
    void getAllArticlesByJournalIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where journal in DEFAULT_JOURNAL or UPDATED_JOURNAL
        defaultArticleShouldBeFound("journal.in=" + DEFAULT_JOURNAL + "," + UPDATED_JOURNAL);

        // Get all the articleList where journal equals to UPDATED_JOURNAL
        defaultArticleShouldNotBeFound("journal.in=" + UPDATED_JOURNAL);
    }

    @Test
    @Transactional
    void getAllArticlesByJournalIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where journal is not null
        defaultArticleShouldBeFound("journal.specified=true");

        // Get all the articleList where journal is null
        defaultArticleShouldNotBeFound("journal.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByJournalContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where journal contains DEFAULT_JOURNAL
        defaultArticleShouldBeFound("journal.contains=" + DEFAULT_JOURNAL);

        // Get all the articleList where journal contains UPDATED_JOURNAL
        defaultArticleShouldNotBeFound("journal.contains=" + UPDATED_JOURNAL);
    }

    @Test
    @Transactional
    void getAllArticlesByJournalNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where journal does not contain DEFAULT_JOURNAL
        defaultArticleShouldNotBeFound("journal.doesNotContain=" + DEFAULT_JOURNAL);

        // Get all the articleList where journal does not contain UPDATED_JOURNAL
        defaultArticleShouldBeFound("journal.doesNotContain=" + UPDATED_JOURNAL);
    }

    @Test
    @Transactional
    void getAllArticlesByPubDateIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pubDate equals to DEFAULT_PUB_DATE
        defaultArticleShouldBeFound("pubDate.equals=" + DEFAULT_PUB_DATE);

        // Get all the articleList where pubDate equals to UPDATED_PUB_DATE
        defaultArticleShouldNotBeFound("pubDate.equals=" + UPDATED_PUB_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByPubDateIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pubDate not equals to DEFAULT_PUB_DATE
        defaultArticleShouldNotBeFound("pubDate.notEquals=" + DEFAULT_PUB_DATE);

        // Get all the articleList where pubDate not equals to UPDATED_PUB_DATE
        defaultArticleShouldBeFound("pubDate.notEquals=" + UPDATED_PUB_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByPubDateIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pubDate in DEFAULT_PUB_DATE or UPDATED_PUB_DATE
        defaultArticleShouldBeFound("pubDate.in=" + DEFAULT_PUB_DATE + "," + UPDATED_PUB_DATE);

        // Get all the articleList where pubDate equals to UPDATED_PUB_DATE
        defaultArticleShouldNotBeFound("pubDate.in=" + UPDATED_PUB_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByPubDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pubDate is not null
        defaultArticleShouldBeFound("pubDate.specified=true");

        // Get all the articleList where pubDate is null
        defaultArticleShouldNotBeFound("pubDate.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByPubDateContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pubDate contains DEFAULT_PUB_DATE
        defaultArticleShouldBeFound("pubDate.contains=" + DEFAULT_PUB_DATE);

        // Get all the articleList where pubDate contains UPDATED_PUB_DATE
        defaultArticleShouldNotBeFound("pubDate.contains=" + UPDATED_PUB_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByPubDateNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pubDate does not contain DEFAULT_PUB_DATE
        defaultArticleShouldNotBeFound("pubDate.doesNotContain=" + DEFAULT_PUB_DATE);

        // Get all the articleList where pubDate does not contain UPDATED_PUB_DATE
        defaultArticleShouldBeFound("pubDate.doesNotContain=" + UPDATED_PUB_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByVolumeIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where volume equals to DEFAULT_VOLUME
        defaultArticleShouldBeFound("volume.equals=" + DEFAULT_VOLUME);

        // Get all the articleList where volume equals to UPDATED_VOLUME
        defaultArticleShouldNotBeFound("volume.equals=" + UPDATED_VOLUME);
    }

    @Test
    @Transactional
    void getAllArticlesByVolumeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where volume not equals to DEFAULT_VOLUME
        defaultArticleShouldNotBeFound("volume.notEquals=" + DEFAULT_VOLUME);

        // Get all the articleList where volume not equals to UPDATED_VOLUME
        defaultArticleShouldBeFound("volume.notEquals=" + UPDATED_VOLUME);
    }

    @Test
    @Transactional
    void getAllArticlesByVolumeIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where volume in DEFAULT_VOLUME or UPDATED_VOLUME
        defaultArticleShouldBeFound("volume.in=" + DEFAULT_VOLUME + "," + UPDATED_VOLUME);

        // Get all the articleList where volume equals to UPDATED_VOLUME
        defaultArticleShouldNotBeFound("volume.in=" + UPDATED_VOLUME);
    }

    @Test
    @Transactional
    void getAllArticlesByVolumeIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where volume is not null
        defaultArticleShouldBeFound("volume.specified=true");

        // Get all the articleList where volume is null
        defaultArticleShouldNotBeFound("volume.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByVolumeContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where volume contains DEFAULT_VOLUME
        defaultArticleShouldBeFound("volume.contains=" + DEFAULT_VOLUME);

        // Get all the articleList where volume contains UPDATED_VOLUME
        defaultArticleShouldNotBeFound("volume.contains=" + UPDATED_VOLUME);
    }

    @Test
    @Transactional
    void getAllArticlesByVolumeNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where volume does not contain DEFAULT_VOLUME
        defaultArticleShouldNotBeFound("volume.doesNotContain=" + DEFAULT_VOLUME);

        // Get all the articleList where volume does not contain UPDATED_VOLUME
        defaultArticleShouldBeFound("volume.doesNotContain=" + UPDATED_VOLUME);
    }

    @Test
    @Transactional
    void getAllArticlesByIssueIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where issue equals to DEFAULT_ISSUE
        defaultArticleShouldBeFound("issue.equals=" + DEFAULT_ISSUE);

        // Get all the articleList where issue equals to UPDATED_ISSUE
        defaultArticleShouldNotBeFound("issue.equals=" + UPDATED_ISSUE);
    }

    @Test
    @Transactional
    void getAllArticlesByIssueIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where issue not equals to DEFAULT_ISSUE
        defaultArticleShouldNotBeFound("issue.notEquals=" + DEFAULT_ISSUE);

        // Get all the articleList where issue not equals to UPDATED_ISSUE
        defaultArticleShouldBeFound("issue.notEquals=" + UPDATED_ISSUE);
    }

    @Test
    @Transactional
    void getAllArticlesByIssueIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where issue in DEFAULT_ISSUE or UPDATED_ISSUE
        defaultArticleShouldBeFound("issue.in=" + DEFAULT_ISSUE + "," + UPDATED_ISSUE);

        // Get all the articleList where issue equals to UPDATED_ISSUE
        defaultArticleShouldNotBeFound("issue.in=" + UPDATED_ISSUE);
    }

    @Test
    @Transactional
    void getAllArticlesByIssueIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where issue is not null
        defaultArticleShouldBeFound("issue.specified=true");

        // Get all the articleList where issue is null
        defaultArticleShouldNotBeFound("issue.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByIssueContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where issue contains DEFAULT_ISSUE
        defaultArticleShouldBeFound("issue.contains=" + DEFAULT_ISSUE);

        // Get all the articleList where issue contains UPDATED_ISSUE
        defaultArticleShouldNotBeFound("issue.contains=" + UPDATED_ISSUE);
    }

    @Test
    @Transactional
    void getAllArticlesByIssueNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where issue does not contain DEFAULT_ISSUE
        defaultArticleShouldNotBeFound("issue.doesNotContain=" + DEFAULT_ISSUE);

        // Get all the articleList where issue does not contain UPDATED_ISSUE
        defaultArticleShouldBeFound("issue.doesNotContain=" + UPDATED_ISSUE);
    }

    @Test
    @Transactional
    void getAllArticlesByPagesIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pages equals to DEFAULT_PAGES
        defaultArticleShouldBeFound("pages.equals=" + DEFAULT_PAGES);

        // Get all the articleList where pages equals to UPDATED_PAGES
        defaultArticleShouldNotBeFound("pages.equals=" + UPDATED_PAGES);
    }

    @Test
    @Transactional
    void getAllArticlesByPagesIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pages not equals to DEFAULT_PAGES
        defaultArticleShouldNotBeFound("pages.notEquals=" + DEFAULT_PAGES);

        // Get all the articleList where pages not equals to UPDATED_PAGES
        defaultArticleShouldBeFound("pages.notEquals=" + UPDATED_PAGES);
    }

    @Test
    @Transactional
    void getAllArticlesByPagesIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pages in DEFAULT_PAGES or UPDATED_PAGES
        defaultArticleShouldBeFound("pages.in=" + DEFAULT_PAGES + "," + UPDATED_PAGES);

        // Get all the articleList where pages equals to UPDATED_PAGES
        defaultArticleShouldNotBeFound("pages.in=" + UPDATED_PAGES);
    }

    @Test
    @Transactional
    void getAllArticlesByPagesIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pages is not null
        defaultArticleShouldBeFound("pages.specified=true");

        // Get all the articleList where pages is null
        defaultArticleShouldNotBeFound("pages.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByPagesContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pages contains DEFAULT_PAGES
        defaultArticleShouldBeFound("pages.contains=" + DEFAULT_PAGES);

        // Get all the articleList where pages contains UPDATED_PAGES
        defaultArticleShouldNotBeFound("pages.contains=" + UPDATED_PAGES);
    }

    @Test
    @Transactional
    void getAllArticlesByPagesNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where pages does not contain DEFAULT_PAGES
        defaultArticleShouldNotBeFound("pages.doesNotContain=" + DEFAULT_PAGES);

        // Get all the articleList where pages does not contain UPDATED_PAGES
        defaultArticleShouldBeFound("pages.doesNotContain=" + UPDATED_PAGES);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors equals to DEFAULT_AUTHORS
        defaultArticleShouldBeFound("authors.equals=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors equals to UPDATED_AUTHORS
        defaultArticleShouldNotBeFound("authors.equals=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors not equals to DEFAULT_AUTHORS
        defaultArticleShouldNotBeFound("authors.notEquals=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors not equals to UPDATED_AUTHORS
        defaultArticleShouldBeFound("authors.notEquals=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors in DEFAULT_AUTHORS or UPDATED_AUTHORS
        defaultArticleShouldBeFound("authors.in=" + DEFAULT_AUTHORS + "," + UPDATED_AUTHORS);

        // Get all the articleList where authors equals to UPDATED_AUTHORS
        defaultArticleShouldNotBeFound("authors.in=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors is not null
        defaultArticleShouldBeFound("authors.specified=true");

        // Get all the articleList where authors is null
        defaultArticleShouldNotBeFound("authors.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors contains DEFAULT_AUTHORS
        defaultArticleShouldBeFound("authors.contains=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors contains UPDATED_AUTHORS
        defaultArticleShouldNotBeFound("authors.contains=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors does not contain DEFAULT_AUTHORS
        defaultArticleShouldNotBeFound("authors.doesNotContain=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors does not contain UPDATED_AUTHORS
        defaultArticleShouldBeFound("authors.doesNotContain=" + UPDATED_AUTHORS);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultArticleShouldBeFound(String filter) throws Exception {
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(article.getId().intValue())))
            .andExpect(jsonPath("$.[*].pmid").value(hasItem(DEFAULT_PMID)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE.toString())))
            .andExpect(jsonPath("$.[*].journal").value(hasItem(DEFAULT_JOURNAL)))
            .andExpect(jsonPath("$.[*].pubDate").value(hasItem(DEFAULT_PUB_DATE)))
            .andExpect(jsonPath("$.[*].volume").value(hasItem(DEFAULT_VOLUME)))
            .andExpect(jsonPath("$.[*].issue").value(hasItem(DEFAULT_ISSUE)))
            .andExpect(jsonPath("$.[*].pages").value(hasItem(DEFAULT_PAGES)))
            .andExpect(jsonPath("$.[*].authors").value(hasItem(DEFAULT_AUTHORS)));

        // Check, that the count call also returns 1
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultArticleShouldNotBeFound(String filter) throws Exception {
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingArticle() throws Exception {
        // Get the article
        restArticleMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewArticle() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeUpdate = articleRepository.findAll().size();

        // Update the article
        Article updatedArticle = articleRepository.findById(article.getId()).get();
        // Disconnect from session so that the updates on updatedArticle are not directly saved in db
        em.detach(updatedArticle);
        updatedArticle
            .pmid(UPDATED_PMID)
            .title(UPDATED_TITLE)
            .journal(UPDATED_JOURNAL)
            .pubDate(UPDATED_PUB_DATE)
            .volume(UPDATED_VOLUME)
            .issue(UPDATED_ISSUE)
            .pages(UPDATED_PAGES)
            .authors(UPDATED_AUTHORS);

        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedArticle.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedArticle))
            )
            .andExpect(status().isOk());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getPmid()).isEqualTo(UPDATED_PMID);
        assertThat(testArticle.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testArticle.getJournal()).isEqualTo(UPDATED_JOURNAL);
        assertThat(testArticle.getPubDate()).isEqualTo(UPDATED_PUB_DATE);
        assertThat(testArticle.getVolume()).isEqualTo(UPDATED_VOLUME);
        assertThat(testArticle.getIssue()).isEqualTo(UPDATED_ISSUE);
        assertThat(testArticle.getPages()).isEqualTo(UPDATED_PAGES);
        assertThat(testArticle.getAuthors()).isEqualTo(UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void putNonExistingArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, article.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateArticleWithPatch() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeUpdate = articleRepository.findAll().size();

        // Update the article using partial update
        Article partialUpdatedArticle = new Article();
        partialUpdatedArticle.setId(article.getId());

        partialUpdatedArticle.pmid(UPDATED_PMID).title(UPDATED_TITLE).journal(UPDATED_JOURNAL).issue(UPDATED_ISSUE);

        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArticle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArticle))
            )
            .andExpect(status().isOk());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getPmid()).isEqualTo(UPDATED_PMID);
        assertThat(testArticle.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testArticle.getJournal()).isEqualTo(UPDATED_JOURNAL);
        assertThat(testArticle.getPubDate()).isEqualTo(DEFAULT_PUB_DATE);
        assertThat(testArticle.getVolume()).isEqualTo(DEFAULT_VOLUME);
        assertThat(testArticle.getIssue()).isEqualTo(UPDATED_ISSUE);
        assertThat(testArticle.getPages()).isEqualTo(DEFAULT_PAGES);
        assertThat(testArticle.getAuthors()).isEqualTo(DEFAULT_AUTHORS);
    }

    @Test
    @Transactional
    void fullUpdateArticleWithPatch() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeUpdate = articleRepository.findAll().size();

        // Update the article using partial update
        Article partialUpdatedArticle = new Article();
        partialUpdatedArticle.setId(article.getId());

        partialUpdatedArticle
            .pmid(UPDATED_PMID)
            .title(UPDATED_TITLE)
            .journal(UPDATED_JOURNAL)
            .pubDate(UPDATED_PUB_DATE)
            .volume(UPDATED_VOLUME)
            .issue(UPDATED_ISSUE)
            .pages(UPDATED_PAGES)
            .authors(UPDATED_AUTHORS);

        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArticle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArticle))
            )
            .andExpect(status().isOk());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getPmid()).isEqualTo(UPDATED_PMID);
        assertThat(testArticle.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testArticle.getJournal()).isEqualTo(UPDATED_JOURNAL);
        assertThat(testArticle.getPubDate()).isEqualTo(UPDATED_PUB_DATE);
        assertThat(testArticle.getVolume()).isEqualTo(UPDATED_VOLUME);
        assertThat(testArticle.getIssue()).isEqualTo(UPDATED_ISSUE);
        assertThat(testArticle.getPages()).isEqualTo(UPDATED_PAGES);
        assertThat(testArticle.getAuthors()).isEqualTo(UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void patchNonExistingArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, article.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteArticle() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeDelete = articleRepository.findAll().size();

        // Delete the article
        restArticleMockMvc
            .perform(delete(ENTITY_API_URL_ID, article.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
