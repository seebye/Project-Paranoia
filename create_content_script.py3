#!/usr/bin/env python3

from os import remove as deleteFile
from os.path import isfile

OUTPUT_FILE = "js/content/main.js"
INPUT_FILES = [
        "js/shared/constants.js"
		, "js/shared/utils.js"
		, "js/injection/utils.js"
		, "js/injection/parameters.js"
		, "js/injection/cookie.js"
		, "js/injection/hook.js"
		, "js/injection/main.js"
]

strOutput = ""

for strPath in INPUT_FILES:
    strInput = open(strPath).read().replace("\\", "\\\\")

    astrInput = strInput.split("\n")

    strOutput += "\n\n\n"

    for i, strLine in enumerate(astrInput):
        if('"' in strLine):
            raise Exception("QuotesException: found \" at line "+str(i+1)+" in \""+strPath+"\"")
        strOutput += ("+" if strOutput != "\n\n\n" else "") \
                    + '"'+strLine+"\\n\"\n"


if(isfile(OUTPUT_FILE)):
    deleteFile(OUTPUT_FILE)

open(OUTPUT_FILE, 'w+').write("inject("+strOutput+");")
