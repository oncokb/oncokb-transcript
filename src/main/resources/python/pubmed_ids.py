import os
import sys

import requests


def get_pub_content(ids, done=False):
    print(ids)
    res = requests.get(
        url=f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={ids}&rettype=text"
    )
    text = res.text
    result = ''
    file1 = open("pubmed_ids.xml", "w")
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
        get_pub_content(term, True)
    else:
        print('Provide multiple arguments (query)')

