import os
import sys

import requests


# TODO: The code is subjected to further review/refactoring. It comes from AI/ML team, developed by Luke  Czapla.

def get_pub_content(ids, fileName="pubmed_ids.xml"):
    print(ids)
    res = requests.get(
        url=f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={ids}&rettype=text"
    )
    text = res.text
    file1 = open(fileName, "w")
    file1.write(text)
    file1.close()

if __name__ == '__main__':
    if os.path.exists("pubmed_ids.xml"):
        os.remove("pubmed_ids.xml")
    if len(sys.argv) > 1:
        term = ""
        for i in range(1, len(sys.argv)):
            if term == "":
                term = term + sys.argv[i]
            else:
                term = term + " " + sys.argv[i]
        if len(sys.argv) > 2:
            fileName = sys.argv[2]
        get_pub_content(term, fileName)
    else:
        print('Provide multiple arguments (query)')

