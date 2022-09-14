package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class ArticleFullTextTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ArticleFullText.class);
        ArticleFullText articleFullText1 = new ArticleFullText();
        articleFullText1.setId(1L);
        ArticleFullText articleFullText2 = new ArticleFullText();
        articleFullText2.setId(articleFullText1.getId());
        assertThat(articleFullText1).isEqualTo(articleFullText2);
        articleFullText2.setId(2L);
        assertThat(articleFullText1).isNotEqualTo(articleFullText2);
        articleFullText1.setId(null);
        assertThat(articleFullText1).isNotEqualTo(articleFullText2);
    }
}
