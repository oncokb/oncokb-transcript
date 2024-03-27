package org.mskcc.oncokb.curation.service.mapper;

import com.google.gson.Gson;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.service.dto.pubmed.PubMedDTO;
import org.springframework.stereotype.Service;

/**
 * Mapper to convert between {@link PubMedDTO} and {@link Article}.
 * <p>
 * Normal mappers are generated using MapStruct, this one is hand-coded as MapStruct
 * support is still in beta, and requires a manual step with an IDE.
 */
@Service
public class PubMedMapper {

    public List<PubMedDTO> articlesToPubMedDTOs(List<Article> articles) {
        return articles.stream().filter(Objects::nonNull).map(this::articleToPubMedDTO).collect(Collectors.toList());
    }

    public PubMedDTO articleToPubMedDTO(Article article) {
        return new PubMedDTO(article);
    }

    public List<Article> pubMedDTOsToArticle(List<PubMedDTO> pubMedDTOs) {
        return pubMedDTOs.stream().filter(Objects::nonNull).map(this::pubMedDTOToArticle).collect(Collectors.toList());
    }

    public Article pubMedDTOToArticle(PubMedDTO pubMedDTO) {
        if (pubMedDTO == null) {
            return null;
        } else {
            Article article = new Article();
            article.setId(pubMedDTO.getId());
            article.setType(pubMedDTO.getType());
            article.setUid(pubMedDTO.getPmid());
            article.setTitle(pubMedDTO.getTitle());
            article.setContent(pubMedDTO.getContent());
            article.setLink(pubMedDTO.getLink());
            article.setDate(pubMedDTO.getDate());
            article.setAuthors(pubMedDTO.getAuthors());
            article.setAdditionalInfo(new Gson().toJson(pubMedDTO.getAdditionalInfo()));
            article.setFlags(pubMedDTO.getFlags());
            article.setSynonyms(pubMedDTO.getSynonyms());
            return article;
        }
    }
}
