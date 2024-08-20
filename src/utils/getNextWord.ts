export const getNextWord = (wordList, userWordData) => {
    const remainingWords = wordList.filter(word =>
        !userWordData.some(userData => userData.word_id === word.id)
    );

    const studiedWords = userWordData.map(userData => {
        const word = wordList.find(w => w.id === userData.word_id);
        return { ...userData, word };
    });

    studiedWords.sort((a, b) => {
        if (a.study_count !== b.study_count) {
            return a.study_count - b.study_count;
        }
        if (a.correct_count !== b.correct_count) {
            return a.correct_count - b.correct_count;
        }
        return new Date(a.last_study_date) - new Date(b.last_study_date);
    });

    if (remainingWords.length > 0) {
        return remainingWords[Math.floor(Math.random() * remainingWords.length)];
    }

    return studiedWords.length ? studiedWords[0].word : null;
};
