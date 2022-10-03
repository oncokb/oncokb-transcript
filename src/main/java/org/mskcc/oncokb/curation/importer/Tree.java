package org.mskcc.oncokb.curation.importer;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.ToString;

// TODO: The code is subjected to further review/refactoring. It comes from AI/ML team, developed by Luke Czapla.

@ToString
@AllArgsConstructor
@Builder
public class Tree {

    private String name = null;
    private List<Pair<String, String>> attributes = null;
    private List<Tree> children = null;
    private String asField = null;
    private String withLabel = null;
    private String withLabel2 = null;
    private String append = null;
    private Boolean saveItemAfter = null;
    private Boolean date = null;
    private Pair<String, String> token = null;

    public Tree() {
        /*       Tree.builder().name("PubmedArticle")
                .children(
                    Arrays.asList(Tree.builder().name("MedlineCitation").children(
                        Arrays.asList(Tree.builder().name("Article").children(
                            Arrays.asList(Tree.builder().name("ArticleTitle").asField("title").build(),
                            Tree.builder().name("Abstract").children(
                                Arrays.asList(Tree.builder().name("AbstractText").asField("abstract").withLabel("Label").build())
                            ).build()),
                        )).build(),
                        Tree.builder().name("MeshHeadingList").children(
                            Arrays.asList(Tree.builder().name("MeshHeading").children(
                                Arrays.asList(Tree.builder().name("DescriptorName").asField("meshTerms").token(Pair.<String, String>builder().key("MajorTopicYN").value("Y").build())
                                .build()))
                        .build())).build()
                        ).build())
                    .build(),
                    Tree.builder().name("PubmedData").build())
                .build();*/
    }

    public static List<Tree> articleTree() {
        return Collections.singletonList(
            Tree
                .builder()
                .name("PubmedArticle")
                .saveItemAfter(true)
                .children(
                    Arrays.asList(
                        Tree
                            .builder()
                            .name("MedlineCitation")
                            .children(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .name("Article")
                                        .children(
                                            Arrays.asList(
                                                Tree
                                                    .builder()
                                                    .name("Journal")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree.builder().name("ISSN").asField("pages").build(),
                                                            Tree
                                                                .builder()
                                                                .name("JournalIssue")
                                                                .children(
                                                                    Arrays.asList(
                                                                        Tree.builder().name("Volume").asField("volume").build(),
                                                                        Tree.builder().name("Issue").asField("issue").build(),
                                                                        Tree
                                                                            .builder()
                                                                            .name("PubDate")
                                                                            .children(
                                                                                Arrays.asList(
                                                                                    Tree
                                                                                        .builder()
                                                                                        .name("Year")
                                                                                        .asField("pubDate")
                                                                                        .date(true)
                                                                                        .build(),
                                                                                    Tree
                                                                                        .builder()
                                                                                        .name("Month")
                                                                                        .asField("pubDate")
                                                                                        .date(true)
                                                                                        .build()
                                                                                )
                                                                            )
                                                                            .build()
                                                                    )
                                                                )
                                                                .build(),
                                                            Tree.builder().name("Title").asField("journal").build()
                                                        )
                                                    )
                                                    .build(),
                                                Tree.builder().name("ArticleTitle").asField("title").build(),
                                                Tree
                                                    .builder()
                                                    .name("Abstract")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree
                                                                .builder()
                                                                .name("AbstractText")
                                                                .asField("pubAbstract")
                                                                .withLabel("Label")
                                                                .append("\n")
                                                                .build()
                                                        )
                                                    )
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("ArticleDate")
                                                    .token(Pair.<String, String>builder().key("DateType").value("Electronic").build())
                                                    .children(
                                                        Arrays.asList(
                                                            Tree.builder().name("Year").asField("pubDate").date(true).build(),
                                                            Tree.builder().name("Month").asField("pubDate").date(true).build(),
                                                            Tree.builder().name("Day").asField("pubDate").date(true).build()
                                                        )
                                                    )
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("AuthorList")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree
                                                                .builder()
                                                                .name("Author")
                                                                .token(Pair.<String, String>builder().key("ValidYN").value("Y").build())
                                                                .children(
                                                                    Arrays.asList(
                                                                        Tree
                                                                            .builder()
                                                                            .name("LastName")
                                                                            .asField("authors")
                                                                            .append(";")
                                                                            .build(),
                                                                        Tree
                                                                            .builder()
                                                                            .name("Initials")
                                                                            .asField("authors")
                                                                            .append(",")
                                                                            .build(),
                                                                        Tree
                                                                            .builder()
                                                                            .name("AffiliationInfo")
                                                                            .children(
                                                                                Collections.singletonList(
                                                                                    Tree
                                                                                        .builder()
                                                                                        .name("Affiliation")
                                                                                        .asField("authors")
                                                                                        .append(";")
                                                                                        .build()
                                                                                )
                                                                            )
                                                                            .build()
                                                                    )
                                                                )
                                                                .build()
                                                        )
                                                    )
                                                    .build()
                                            )
                                        )
                                        .build(),
                                    Tree
                                        .builder()
                                        .name("MeshHeadingList")
                                        .children(
                                            Arrays.asList(
                                                Tree
                                                    .builder()
                                                    .name("MeshHeading")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree
                                                                .builder()
                                                                .name("DescriptorName")
                                                                .asField("meshTerms")
                                                                .withLabel("UI")
                                                                .withLabel2("MajorTopicYN")
                                                                .append(";")
                                                                .build()
                                                        )
                                                    )
                                                    .build()
                                            )
                                        )
                                        .build()
                                )
                            )
                            .build(),
                        Tree
                            .builder()
                            .name("PubmedData")
                            .children(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .name("ArticleIdList")
                                        .children(
                                            Arrays.asList(
                                                Tree
                                                    .builder()
                                                    .name("ArticleId")
                                                    .token(Pair.<String, String>builder().key("IdType").value("pubmed").build())
                                                    .asField("pmid")
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("ArticleId")
                                                    .token(Pair.<String, String>builder().key("IdType").value("doi").build())
                                                    .asField("doi")
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("ArticleId")
                                                    .token(Pair.<String, String>builder().key("IdType").value("pmc").build())
                                                    .asField("pmcid")
                                                    .build()
                                            )
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                )
                .build()
        );
    }

    public static List<Tree> articleTreeNoCitations() {
        return Arrays.asList(/*Tree.builder().name("PubmedBookArticle").saveItemAfter(true)
                .children(
                    Arrays.asList(Tree.builder().name("BookDocument").children(

                                ).build(),
                                Tree.builder().name("PubmedBookData").children(
                                        Arrays.asList(Tree.builder().name("History").children(
                                            Collections.singletonList(Tree.builder().name("PubMedPubDate").token(Pair.<String, String>builder().key("PubStatus").value("pubmed").build()).children(
                                                            Arrays.asList(Tree.builder().name("Year").asField("pubDate").date(true).build(),
                                                                    Tree.builder().name("Month").asField("pubDate").date(true).build(),
                                                                    Tree.builder().name("Day").asField("pubDate").date(true).build()
                                                            )).build())


                                        ).build(),
                                        Tree.builder().name("ArticleIdList").children(
                                                Collections.singletonList(Tree.builder().name("ArticleId").token(Pair.<String, String>builder().key("IdType").value("pubmed").build()).asField("pmid").build()
                                            )).build()
                                        )).build()
                                ).build()
                ).build(),*/
            Tree
                .builder()
                .name("PubmedArticle")
                .saveItemAfter(true)
                .children(
                    Arrays.asList(
                        Tree
                            .builder()
                            .name("MedlineCitation")
                            .children(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .name("Article")
                                        .children(
                                            Arrays.asList(
                                                Tree
                                                    .builder()
                                                    .name("Journal")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree.builder().name("ISSN").asField("pages").build(),
                                                            Tree
                                                                .builder()
                                                                .name("JournalIssue")
                                                                .children(
                                                                    Arrays.asList(
                                                                        Tree.builder().name("Volume").asField("volume").build(),
                                                                        Tree.builder().name("Issue").asField("issue").build(),
                                                                        Tree
                                                                            .builder()
                                                                            .name("PubDate")
                                                                            .children(
                                                                                Arrays.asList(
                                                                                    Tree
                                                                                        .builder()
                                                                                        .name("Year")
                                                                                        .asField("pubDate")
                                                                                        .date(true)
                                                                                        .build(),
                                                                                    Tree
                                                                                        .builder()
                                                                                        .name("Month")
                                                                                        .asField("pubDate")
                                                                                        .date(true)
                                                                                        .build()
                                                                                )
                                                                            )
                                                                            .build()
                                                                    )
                                                                )
                                                                .build(),
                                                            Tree.builder().name("Title").asField("journal").build()
                                                        )
                                                    )
                                                    .build(),
                                                Tree.builder().name("ArticleTitle").asField("title").build(),
                                                Tree
                                                    .builder()
                                                    .name("Abstract")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree
                                                                .builder()
                                                                .name("AbstractText")
                                                                .asField("pubAbstract")
                                                                .withLabel("Label")
                                                                .append("\n")
                                                                .build()
                                                        )
                                                    )
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("ArticleDate")
                                                    .token(Pair.<String, String>builder().key("DateType").value("Electronic").build())
                                                    .children(
                                                        Arrays.asList(
                                                            Tree.builder().name("Year").asField("pubDate").date(true).build(),
                                                            Tree.builder().name("Month").asField("pubDate").date(true).build(),
                                                            Tree.builder().name("Day").asField("pubDate").date(true).build()
                                                        )
                                                    )
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("AuthorList")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree
                                                                .builder()
                                                                .name("Author")
                                                                .token(Pair.<String, String>builder().key("ValidYN").value("Y").build())
                                                                .children(
                                                                    Arrays.asList(
                                                                        Tree
                                                                            .builder()
                                                                            .name("LastName")
                                                                            .asField("authors")
                                                                            .append(";")
                                                                            .build(),
                                                                        Tree
                                                                            .builder()
                                                                            .name("Initials")
                                                                            .asField("authors")
                                                                            .append(",")
                                                                            .build(),
                                                                        Tree
                                                                            .builder()
                                                                            .name("AffiliationInfo")
                                                                            .children(
                                                                                Collections.singletonList(
                                                                                    Tree
                                                                                        .builder()
                                                                                        .name("Affiliation")
                                                                                        .asField("authors")
                                                                                        .append(";")
                                                                                        .build()
                                                                                )
                                                                            )
                                                                            .build()
                                                                    )
                                                                )
                                                                .build()
                                                        )
                                                    )
                                                    .build()
                                            )
                                        )
                                        .build(),
                                    Tree
                                        .builder()
                                        .name("MeshHeadingList")
                                        .children(
                                            Arrays.asList(
                                                Tree
                                                    .builder()
                                                    .name("MeshHeading")
                                                    .children(
                                                        Arrays.asList(
                                                            Tree
                                                                .builder()
                                                                .name("DescriptorName")
                                                                .asField("meshTerms")
                                                                .withLabel("UI")
                                                                .withLabel2("MajorTopicYN")
                                                                .append(";")
                                                                .build()
                                                        )
                                                    )
                                                    .build()
                                            )
                                        )
                                        .build()
                                )
                            )
                            .build(),
                        Tree
                            .builder()
                            .name("PubmedData")
                            .children(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .name("ArticleIdList")
                                        .children(
                                            Arrays.asList(
                                                Tree
                                                    .builder()
                                                    .name("ArticleId")
                                                    .token(Pair.<String, String>builder().key("IdType").value("pubmed").build())
                                                    .asField("pmid")
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("ArticleId")
                                                    .token(Pair.<String, String>builder().key("IdType").value("doi").build())
                                                    .asField("doi")
                                                    .build(),
                                                Tree
                                                    .builder()
                                                    .name("ArticleId")
                                                    .token(Pair.<String, String>builder().key("IdType").value("pmc").build())
                                                    .asField("pmcid")
                                                    .build()
                                            )
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                )
                .build()
        );
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Pair<String, String>> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<Pair<String, String>> attributes) {
        this.attributes = attributes;
    }

    public String getAsField() {
        return asField;
    }

    public void setAsField(String asField) {
        this.asField = asField;
    }

    public List<Tree> getChildren() {
        return children;
    }

    public void setChildren(List<Tree> children) {
        this.children = children;
    }

    public String getWithLabel() {
        return withLabel;
    }

    public void setWithLabel(String withLabel) {
        this.withLabel = withLabel;
    }

    public String getWithLabel2() {
        return withLabel2;
    }

    public void setWithLabel2(String withLabel2) {
        this.withLabel2 = withLabel2;
    }

    public Pair<String, String> getToken() {
        return token;
    }

    public void setToken(Pair<String, String> token) {
        this.token = token;
    }

    public String getAppend() {
        return append;
    }

    public void setAppend(String append) {
        this.append = append;
    }

    public Boolean getSaveItemAfter() {
        return saveItemAfter;
    }

    public void setSaveItemAfter(Boolean saveItemAfter) {
        this.saveItemAfter = saveItemAfter;
    }

    public Boolean getDate() {
        return date;
    }

    public void setDate(Boolean date) {
        this.date = date;
    }

    @Builder
    static class Pair<A, B> {

        A key;
        B value;
    }
}
