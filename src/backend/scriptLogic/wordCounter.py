


def countWordInFile(file_path, wordToCount):
    try:
        file = open(file_path, "r")
        fileText = file.read()

        # Now search file text for appearances of word
        wordCounter = fileText.count(wordToCount)
        print(wordToCount  + " appears " + wordCounter + " times")


    except Exception as e:
        print(f"Error counting words: {e}")
        return 0