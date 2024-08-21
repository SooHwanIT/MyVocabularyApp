// services/wordRecommendation.js
import { getUserWordData } from './userData';
import words from '../data/words.json';

const newWordWeight = 0.3;
const reviewWordWeight = 0.7;

const getNextNewWord = (userId, callback) => {
    getUserWordData(userId, (userWords) => {
        const studiedWordIds = userWords.map(userWord => userWord.word_id);
        const nextNewWord = words.find(word => !studiedWordIds.includes(word.id));

        if (nextNewWord) {
            callback(nextNewWord);
        } else {
            callback(null);
        }
    });
};

const getReviewRecommendedWords = (userId, callback) => {
    getUserWordData(userId, (userWords) => {
        const recommendedReviewWords = userWords
            .map(word => {
                const daysSinceLastStudy = Math.floor((new Date() - new Date(word.last_study_date)) / (1000 * 60 * 60 * 24));
                let score = 0;

                switch (word.last_attempt_status) {
                    case 'correct':
                        score -= (word.correct_count * 2) + (word.study_count * 1) - (daysSinceLastStudy * 0.5);
                        break;
                    case 'incorrect':
                        score += (word.wrong_count * 3) + (daysSinceLastStudy * 1);
                        break;
                    case 'skipped':
                        score += (word.skip_count * 2) + (daysSinceLastStudy * 1);
                        break;
                    default:
                        score += (daysSinceLastStudy * 0.5);
                        break;
                }

                score += (daysSinceLastStudy * 0.5);
                score += (word.study_count * 0.5);
                score -= (word.correct_count * 0.5);
                score += (word.wrong_count * 1);
                score += (word.skip_count * 1);
                score += (word.exposure_count * 0.5);
                score += (word.favorite ? 5 : 0);

                return {
                    ...word,
                    score,
                    daysSinceLastStudy,
                };
            })
            .filter(word => word.daysSinceLastStudy >= parseInt(word.review_interval))
            .sort((a, b) => b.score - a.score);

        callback(recommendedReviewWords);
    });
};

const getNextWord = (userId, callback) => {
    const isNewWord = Math.random() < newWordWeight;

    if (isNewWord) {
        getNextNewWord(userId, (newWord) => {
            if (newWord) {
                callback(newWord);
            } else {
                getReviewRecommendedWords(userId, (recommendedReviewWords) => {
                    if (recommendedReviewWords.length > 0) {
                        callback(recommendedReviewWords[0]);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    } else {
        getReviewRecommendedWords(userId, (recommendedReviewWords) => {
            if (recommendedReviewWords.length > 0){
                callback(recommendedReviewWords[0]);
            } else {
                getNextNewWord(userId, (newWord) => {
                    if (newWord) {
                        callback(newWord);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
};

export { getNextNewWord, getReviewRecommendedWords, getNextWord };
