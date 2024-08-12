package org.mskcc.oncokb.curation.service;

import java.io.StringReader;
import java.lang.Object;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import javax.xml.bind.*;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.Source;
import javax.xml.transform.sax.SAXSource;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.domain.enumeration.SynonymType;
import org.mskcc.oncokb.curation.domain.nih.efetch.*;
import org.mskcc.oncokb.curation.service.dto.pubmed.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXNotRecognizedException;
import org.xml.sax.SAXNotSupportedException;

@Service
public class NihEutilsService {

    private static final String DEFAULT_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
    private static final Logger logger = LoggerFactory.getLogger(NihEutilsService.class);
    private static final String EFETCH = "efetch.fcgi";
    private static final String DEFAULT_UNLABELLED_ABSTRACT_TEXT = "UNLABELLED";
    private final String baseUrl;
    private final String nihEutilsToken;
    private final SynonymService synonymService;

    public NihEutilsService(ApplicationProperties applicationProperties, SynonymService synonymService) {
        this.baseUrl = DEFAULT_BASE_URL;
        this.nihEutilsToken = applicationProperties.getNihEutilsToken();
        this.synonymService = synonymService;
    }

    private Instant parseDateByFormat(String year, String month, String day, String format) {
        return LocalDate.parse(year + "/" + month + "/" + day, DateTimeFormatter.ofPattern(format, Locale.US))
            .atStartOfDay()
            .toInstant(ZoneOffset.UTC);
    }

    private String parseListElement(List<Object> items) {
        List<String> strings = new ArrayList<>();
        items.forEach(item -> {
            if (item instanceof String) {
                strings.add(((String) item));
            } else if (item instanceof org.w3c.dom.Element) {
                strings.add((((org.w3c.dom.Element) item).getFirstChild().getTextContent()));
            }
        });
        return strings.stream().filter(StringUtils::isNotEmpty).collect(Collectors.joining(""));
    }

    private Synonym parseArticleId(ArticleId articleId) {
        Optional<Synonym> synonymOptional = synonymService.findByTypeAndSourceAndName(
            SynonymType.ARTICLE,
            articleId.getIdType(),
            articleId.getvalue()
        );
        if (synonymOptional.isEmpty()) {
            Synonym synonym = new Synonym();
            synonym.setType(SynonymType.ARTICLE.name());
            synonym.setSource(articleId.getIdType());
            synonym.setName(articleId.getvalue());
            return synonymService.save(synonym);
        } else {
            return synonymOptional.orElseThrow();
        }
    }

    private Instant parseDate(String year, String month, String day) {
        Instant date = parseDateByFormat(year, month, day, "yyyy/M/d");
        if (date == null) {
            date = parseDateByFormat(year, month, day, "yyyy/L/d");
        }
        return date;
    }

    private PubMedDTO parsePubmedArticle(PubmedArticle pubmedArticle) {
        if (pubmedArticle != null) {
            PubMedDTO pubMedDTO = new PubMedDTO();
            AdditionalInfoDTO additionalInfoDTO = new AdditionalInfoDTO();

            Optional<MedlineCitation> medlineCitationOptional = Optional.ofNullable(pubmedArticle.getMedlineCitation());
            Optional<Article> articleOptional = Optional.ofNullable(pubmedArticle.getMedlineCitation().getArticle());
            if (medlineCitationOptional.isPresent()) {
                MedlineCitation medlineCitation = medlineCitationOptional.orElseThrow();
                pubMedDTO.setPmid(medlineCitation.getPMID().getvalue());
                if (medlineCitation.getDateCompleted() != null) {
                    Instant dateCompleted = parseDate(
                        medlineCitation.getDateCompleted().getYear().getvalue(),
                        medlineCitation.getDateCompleted().getMonth().getvalue(),
                        medlineCitation.getDateCompleted().getDay().getvalue()
                    );
                    additionalInfoDTO.setCompletedDate(dateCompleted);
                    pubMedDTO.setDate(dateCompleted);
                }
                if (medlineCitation.getDateRevised() != null) {
                    additionalInfoDTO.setRevisedDate(
                        parseDate(
                            medlineCitation.getDateRevised().getYear().getvalue(),
                            medlineCitation.getDateRevised().getMonth().getvalue(),
                            medlineCitation.getDateRevised().getDay().getvalue()
                        )
                    );
                }
            }
            if (articleOptional.isPresent()) {
                Article article = articleOptional.orElseThrow();
                if (article.getArticleTitle() != null && article.getArticleTitle().getValue() != null) {
                    pubMedDTO.setTitle(parseListElement(article.getArticleTitle().getValue()));
                }
                if (article.getAuthorList() != null && !article.getAuthorList().getAuthor().isEmpty()) {
                    List<Object> authorInfo = article
                        .getAuthorList()
                        .getAuthor()
                        .get(0)
                        .getLastNameOrForeNameOrInitialsOrSuffixOrCollectiveName();
                    Optional<Object> lastNameOptional = authorInfo.stream().filter(item -> item instanceof LastName).findFirst();
                    if (lastNameOptional.isPresent()) {
                        String authorString = ((LastName) lastNameOptional.orElseThrow()).getvalue();
                        if (article.getAuthorList().getAuthor().size() > 1) {
                            authorString += " et al.";
                        }
                        pubMedDTO.setAuthors(authorString);
                    }
                }
                if (article.getJournal() != null) {
                    Journal journal = article.getJournal();
                    JournalIssue journalIssue = journal.getJournalIssue();
                    JournalDTO journalDTO = new JournalDTO();
                    if (journal.getISSN() != null) {
                        journalDTO.setIssn(journal.getISSN().getvalue());
                    }
                    journalDTO.setTitle(journal.getTitle());
                    journalDTO.setIsoAbbreviation(journal.getISOAbbreviation());

                    journalDTO.setIssue(journalIssue.getIssue());
                    journalDTO.setVolume(journalIssue.getVolume());

                    if (article.getPaginationOrELocationID() != null) {
                        article
                            .getPaginationOrELocationID()
                            .forEach(object -> {
                                if (object instanceof Pagination) {
                                    Pagination pagination = (Pagination) object;
                                    Optional<Object> medlinePgn = pagination
                                        .getStartPageOrEndPageOrMedlinePgn()
                                        .stream()
                                        .filter(pageObject -> pageObject instanceof MedlinePgn)
                                        .findFirst();
                                    medlinePgn.ifPresent(o -> journalDTO.setPages(((MedlinePgn) o).getvalue()));
                                }
                            });
                    }

                    additionalInfoDTO.setJournal(journalDTO);
                }
                if (article.getAbstract() != null) {
                    List<AbstractText> abstractTexts = article.getAbstract().getAbstractText();
                    if (abstractTexts != null && !abstractTexts.isEmpty()) {
                        List<AbstractTextDTO> abstractTextDTOs = new ArrayList<>();
                        if (abstractTexts.size() == 1) {
                            AbstractTextDTO abstractTextDTO = abstractTextMapper(abstractTexts.get(0));
                            abstractTextDTOs.add(abstractTextDTO);
                            pubMedDTO.setContent(abstractTextDTO.getValue());
                        } else {
                            StringBuilder sb = new StringBuilder();
                            for (int i = 0; i < abstractTexts.size(); i++) {
                                AbstractTextDTO text = abstractTextMapper(abstractTexts.get(i));
                                abstractTextDTOs.add(text);
                                if (StringUtils.isNotEmpty(text.getLabel()) && !DEFAULT_UNLABELLED_ABSTRACT_TEXT.equals(text.getLabel())) {
                                    sb.append(StringUtils.capitalize(text.getLabel().toLowerCase()));
                                    sb.append(": ");
                                }
                                sb.append(text.getValue());
                                if (i < abstractTexts.size() - 1) {
                                    sb.append("\n\n");
                                }
                            }
                            pubMedDTO.setContent(sb.toString());
                        }
                        additionalInfoDTO.setAbstractTexts(abstractTextDTOs);
                    }
                }
                if (article.getDataBankList() != null) {
                    DataBankList dataBankList = article.getDataBankList();
                    dataBankList
                        .getDataBank()
                        .forEach(dataBank -> {
                            DataBankDTO dataBankDTO = new DataBankDTO();
                            dataBankDTO.setName(dataBank.getDataBankName());
                            dataBankDTO.setAccessionNumbers(
                                dataBank
                                    .getAccessionNumberList()
                                    .getAccessionNumber()
                                    .stream()
                                    .map(AccessionNumber::getvalue)
                                    .collect(Collectors.toList())
                            );
                            additionalInfoDTO.addDataBank(dataBankDTO);
                        });
                }
            }

            Optional<PubmedData> pubmedDataOptional = Optional.ofNullable(pubmedArticle.getPubmedData());
            if (pubmedDataOptional.isPresent()) {
                if (
                    pubmedDataOptional.orElseThrow().getArticleIdList() != null &&
                    pubmedDataOptional.orElseThrow().getArticleIdList().getArticleId() != null
                ) {
                    pubMedDTO.setSynonyms(
                        pubmedDataOptional
                            .orElseThrow()
                            .getArticleIdList()
                            .getArticleId()
                            .stream()
                            .map(this::parseArticleId)
                            .collect(Collectors.toSet())
                    );
                }
            }
            pubMedDTO.setAdditionalInfo(additionalInfoDTO);
            return pubMedDTO;
        }
        return null;
    }

    private AbstractTextDTO abstractTextMapper(AbstractText abstractText) {
        AbstractTextDTO abstractTextDTO = new AbstractTextDTO();
        abstractTextDTO.setLabel(abstractText.getLabel());
        abstractTextDTO.setNlmCategory(abstractText.getNlmCategory());
        abstractTextDTO.setValue(parseListElement(abstractText.getValue()));
        return abstractTextDTO;
    }

    private PubMedDTO parsePubmedBookArticle(PubmedBookArticle pubmedBookArticle) {
        if (pubmedBookArticle != null) {
            PubMedDTO pubMedDTO = new PubMedDTO();
            AdditionalInfoDTO additionalInfoDTO = new AdditionalInfoDTO();

            Optional<BookDocument> bookDocumentOptional = Optional.ofNullable(pubmedBookArticle.getBookDocument());
            if (bookDocumentOptional.isPresent()) {
                BookDocument bookDocument = bookDocumentOptional.orElseThrow();
                pubMedDTO.setPmid(bookDocument.getPMID().getvalue());

                if (bookDocument.getArticleTitle() != null) {
                    pubMedDTO.setTitle(parseListElement(bookDocument.getArticleTitle().getValue()));
                }
                if (bookDocument.getAuthorList() != null && !bookDocument.getAuthorList().isEmpty()) {
                    List<Object> authorInfo = bookDocument
                        .getAuthorList()
                        .get(0)
                        .getAuthor()
                        .get(0)
                        .getLastNameOrForeNameOrInitialsOrSuffixOrCollectiveName();
                    Optional<Object> lastNameOptional = authorInfo.stream().filter(item -> item instanceof LastName).findFirst();
                    if (lastNameOptional.isPresent()) {
                        String authorString = ((LastName) lastNameOptional.orElseThrow()).getvalue();
                        if (bookDocument.getAuthorList().get(0).getAuthor().size() > 1) {
                            authorString += " et al.";
                        }
                        pubMedDTO.setAuthors(authorString);
                    }
                }

                if (bookDocument.getAbstract() != null) {
                    List<AbstractText> abstractTexts = bookDocument.getAbstract().getAbstractText();
                    if (abstractTexts != null && !abstractTexts.isEmpty()) {
                        List<AbstractTextDTO> abstractTextDTOs = new ArrayList<>();
                        if (abstractTexts.size() == 1) {
                            AbstractTextDTO abstractTextDTO = abstractTextMapper(abstractTexts.get(0));
                            abstractTextDTOs.add(abstractTextDTO);
                            pubMedDTO.setContent(abstractTextDTO.getValue());
                        } else {
                            StringBuilder sb = new StringBuilder();
                            for (int i = 0; i < abstractTexts.size(); i++) {
                                AbstractTextDTO text = abstractTextMapper(abstractTexts.get(i));
                                abstractTextDTOs.add(text);
                                if (StringUtils.isNotEmpty(text.getLabel()) && !DEFAULT_UNLABELLED_ABSTRACT_TEXT.equals(text.getLabel())) {
                                    sb.append(StringUtils.capitalize(text.getLabel().toLowerCase()));
                                    sb.append(": ");
                                }
                                sb.append(text.getValue());
                                if (i < abstractTexts.size() - 1) {
                                    sb.append("\n\n");
                                }
                            }
                            pubMedDTO.setContent(sb.toString());
                        }
                        additionalInfoDTO.setAbstractTexts(abstractTextDTOs);
                    }
                }

                if (bookDocument.getArticleIdList() != null && bookDocument.getArticleIdList().getArticleId() != null) {
                    pubMedDTO.setSynonyms(
                        bookDocument.getArticleIdList().getArticleId().stream().map(this::parseArticleId).collect(Collectors.toSet())
                    );
                }
            }
            pubMedDTO.setAdditionalInfo(additionalInfoDTO);
            return pubMedDTO;
        }
        return null;
    }

    public PubMedDTO fetchPubmedArticle(String pmid) {
        if (StringUtils.isEmpty(pmid)) {
            return null;
        }
        Map<String, String> fetchParams = new HashMap<>();
        fetchParams.put("db", "pubmed");
        fetchParams.put("id", pmid);
        fetchParams.put("retmode", "xml");

        // We can NIH EUtils API call without the token, but it comes with limitation on the IP.
        if (StringUtils.isNotEmpty(nihEutilsToken)) {
            fetchParams.put("api_key", nihEutilsToken);
        }

        PubmedArticleSet pubmedArticleSet = fetch(fetchParams);
        if (pubmedArticleSet != null) {
            List<Object> objects = pubmedArticleSet.getPubmedArticleOrPubmedBookArticle();
            if (objects.size() == 1) {
                if (objects.get(0) instanceof PubmedArticle) {
                    PubmedArticle pubmedArticle = (PubmedArticle) objects.get(0);
                    return parsePubmedArticle(pubmedArticle);
                }
                if (objects.get(0) instanceof PubmedBookArticle) {
                    PubmedBookArticle pubmedBookArticle = (PubmedBookArticle) objects.get(0);
                    return parsePubmedBookArticle(pubmedBookArticle);
                }
            }
        }
        return null;
    }

    private PubmedArticleSet fetch(Map<String, String> queryParams) {
        logger.debug("making efetch query with params {}", queryParams);
        StringBuilder sb = new StringBuilder();
        sb.append(this.baseUrl);
        sb.append(EFETCH);
        sb.append("?");
        sb.append(queryParams.entrySet().stream().map(entry -> entry.getKey() + "=" + entry.getValue()).collect(Collectors.joining("&")));
        RestTemplate rest = new RestTemplate();

        SAXParserFactory spf = SAXParserFactory.newInstance();
        try {
            spf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false);
            logger.info("Fetch {}", sb);
            Source xmlSource = new SAXSource(
                spf.newSAXParser().getXMLReader(),
                new InputSource(new StringReader(rest.getForObject(sb.toString(), String.class)))
            );
            JAXBContext jc = JAXBContext.newInstance(PubmedArticleSet.class);
            Unmarshaller um = jc.createUnmarshaller();
            return (PubmedArticleSet) um.unmarshal(xmlSource);
        } catch (ParserConfigurationException e) {
            throw new RuntimeException(e);
        } catch (SAXNotRecognizedException e) {
            throw new RuntimeException(e);
        } catch (SAXNotSupportedException e) {
            throw new RuntimeException(e);
        } catch (JAXBException e) {
            throw new RuntimeException(e);
        } catch (SAXException e) {
            throw new RuntimeException(e);
        }
    }
}
