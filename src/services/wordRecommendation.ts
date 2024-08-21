// services/wordRecommendation.js
import { getUserWordData } from './userData';
import words from '../data/words.json';


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
            .filter(word => word.daysSinceLastStudy >= parseInt(word.review_interval))  // 임시로 필터링 비활성화
            .sort((a, b) => b.score - a.score);

        callback(recommendedReviewWords);
    });
};


const getNextWord = (userId, callback) => {
    const newWordWeight = 0.3;
    const isNewWord = Math.random() < newWordWeight;

    if (isNewWord) {
        console.log("새로운 단어를 시도합니다.");
        getNextNewWord(userId, (newWord) => {
            if (newWord) {
                console.log("새로운 단어를 가져왔습니다:", newWord);
                callback(newWord);
            } else {
                console.log("새로운 단어가 없습니다. 복습 추천 단어를 가져옵니다.");
                getReviewRecommendedWords(userId, (recommendedReviewWords) => {
                    if (recommendedReviewWords.length > 0) {
                        console.log("복습 추천 단어를 가져왔습니다:", recommendedReviewWords[0]);
                        callback(recommendedReviewWords[0]);
                    } else {
                        console.log("복습 추천 단어가 없습니다.");
                        callback(null);
                    }
                });
            }
        });
    } else {
        console.log("복습 추천 단어를 시도합니다.");
        getReviewRecommendedWords(userId, (recommendedReviewWords) => {
            if (recommendedReviewWords.length > 0){
                console.log("복습 추천 단어를 가져왔습니다:", recommendedReviewWords[0]);
                callback(recommendedReviewWords[0]);
            } else {
                console.log("복습 추천 단어가 없습니다. 새로운 단어를 가져옵니다.");
                getNextNewWord(userId, (newWord) => {
                    if (newWord) {
                        console.log("새로운 단어를 가져왔습니다:", newWord);
                        callback(newWord);
                    } else {
                        console.log("가져올 새로운 단어가 없습니다.");
                        callback(null);
                    }
                });
            }
        });
    }
};


export { getNextNewWord, getReviewRecommendedWords, getNextWord };
