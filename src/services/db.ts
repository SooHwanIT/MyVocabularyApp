import SQLite from 'react-native-sqlite-storage';
import words from '../data/words.json'
// SQLite 데이터베이스 열기
const db = SQLite.openDatabase({ name: 'wordStudy.db', location: 'default' });

// 비중 설정 (신규 단어: 30%, 복습 단어: 70%)
const newWordWeight = 0.3;
const reviewWordWeight = 0.7;


// 데이터베이스 초기화 (기존 데이터 삭제)
const initDb = () => {
    db.transaction(tx => {
        // 기존 테이블 삭제
        tx.executeSql('DROP TABLE IF EXISTS user_words', [], () => {
            console.log('Table dropped successfully');
        }, error => {
            console.log('Error dropping table', error);
        });

        // 새로운 테이블 생성
        tx.executeSql(
            'CREATE TABLE IF NOT EXISTS user_words (' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'word_id INTEGER, ' + // 단어 아이디
            'user_id INTEGER, ' + // 유저 아이디
            'wrong_count INTEGER, ' + // 유저가 이 단어를 틀린 횟수
            'correct_count INTEGER, ' + // 유저가 이 단어를 맞춘 횟수
            'study_count INTEGER, ' + // 유저가 이 단어를 공부한 횟수 (노출 횟수와 동일)
            'last_study_date TEXT, ' + // 마지막으로 공부한 날짜 (분단위)
            'favorite INTEGER, ' + // 즐겨찾기 여부 (0 또는 1)
            'review_interval TEXT, ' + // 복습 주기
            'exposure_count INTEGER, ' + // 노출 횟수 (study_count와 동일)
            'skip_count INTEGER, ' + // 스킵 횟수
            'last_attempt_status TEXT' + // 마지막으로 푼 기록 (정답, 오답, 스킵)
            ')',
            [],
            () => { console.log('Table created successfully'); },
            error => { console.log('Error creating table', error); }
        );
    });
};

// 사용자 단어 데이터 추가
const addUserWordData = (userWord) => {
    db.transaction(tx => {
        tx.executeSql(
            'INSERT INTO user_words (word_id, user_id, wrong_count, correct_count, study_count, last_study_date, favorite, review_interval, exposure_count, skip_count, last_attempt_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userWord.word_id,
                userWord.user_id,
                userWord.wrong_count,
                userWord.correct_count,
                userWord.study_count,
                userWord.last_study_date,
                userWord.favorite ? 1 : 0, // boolean 값을 0 또는 1로 변환
                userWord.review_interval,
                userWord.exposure_count,
                userWord.skip_count,
                userWord.last_attempt_status
            ],
            () => {
                console.log('Data inserted successfully');
                // 데이터 삽입 후 전체 사용자 단어 데이터 출력
                getUserWordData(userWord.user_id, (data) => {
                    console.log('All User Word Data:', data);
                });
            },
            error => { console.log('Error inserting data', error); }
        );
    });
};




// 사용자 단어 데이터 업데이트 또는 추가
const updateOrAddUserWordData = (userId, wordId, correct, newWordData) => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM user_words WHERE user_id = ? AND word_id = ?',
            [userId, wordId],
            (tx, results) => {
                if (results.rows.length > 0) {
                    // 사용자 단어 데이터가 존재하면 업데이트
                    const userWord = results.rows.item(0);
                    const updatedStudyCount = userWord.study_count + 1;
                    const updatedCorrectCount = correct ? userWord.correct_count + 1 : userWord.correct_count;
                    const updatedWrongCount = correct ? userWord.wrong_count : userWord.wrong_count + 1;
                    const updatedLastStudyDate = new Date().toISOString().split('T')[0];
                    const updatedFavorite = newWordData.favorite !== undefined ? newWordData.favorite : userWord.favorite;
                    const updatedReviewInterval = newWordData.review_interval || userWord.review_interval;
                    const updatedExposureCount = updatedStudyCount; // study_count와 동일
                    const updatedSkipCount = (newWordData.skip_count !== undefined) ? newWordData.skip_count : userWord.skip_count;
                    const lastAttemptStatus = correct ? 'correct' : (newWordData.skip ? 'skipped' : 'incorrect');

                    tx.executeSql(
                        'UPDATE user_words SET study_count = ?, correct_count = ?, wrong_count = ?, last_study_date = ?, favorite = ?, review_interval = ?, exposure_count = ?, skip_count = ?, last_attempt_status = ? WHERE user_id = ? AND word_id = ?',
                        [
                            updatedStudyCount,
                            updatedCorrectCount,
                            updatedWrongCount,
                            updatedLastStudyDate,
                            updatedFavorite ? 1 : 0,
                            updatedReviewInterval,
                            updatedExposureCount,
                            updatedSkipCount,
                            lastAttemptStatus,
                            userId,
                            wordId
                        ],
                        () => {
                            console.log('Data updated successfully');
                            // 데이터 업데이트 후 전체 사용자 단어 데이터 출력
                            getUserWordData(userId, (data) => {
                                console.log('All User Word Data:', data);
                            });
                        },
                        error => { console.log('Error updating data', error); }
                    );
                } else {
                    // 사용자 단어 데이터가 존재하지 않으면 추가
                    const newUserWord = {
                        word_id: wordId,
                        user_id: userId,
                        wrong_count: correct ? 0 : 1,
                        correct_count: correct ? 1 : 0,
                        study_count: 1,
                        last_study_date: new Date().toISOString().split('T')[0],
                        favorite: newWordData.favorite ? 1 : 0,
                        review_interval: newWordData.review_interval || "7 days",
                        exposure_count: 1, // study_count와 동일
                        skip_count: newWordData.skip ? 1 : 0,
                        last_attempt_status: correct ? 'correct' : (newWordData.skip ? 'skipped' : 'incorrect')
                    };

                    addUserWordData(newUserWord);
                }
            },
            error => { console.log('Error fetching data', error); }
        );
    });
};

// 사용자 단어 데이터 가져오기 함수
const getUserWordData = (userId, callback) => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM user_words WHERE user_id = ?',
            [userId],
            (tx, results) => {
                const rows = results.rows.raw();
                console.log('All User Word Data:', rows); // 전체 유저 단어 데이터 콘솔 출력
                callback(rows);
            },
            error => { console.log('Error fetching data', error); }
        );
    });
};

// 신규 단어 가져오기 함수
const getNextNewWord = (userId, callback) => {
    console.log("이거실행333");
    getUserWordData(userId, (userWords) => {
        console.log("이거실행44",userWords);
        if (!Array.isArray(userWords)) {
            console.log("이거 실행66");
            console.log('Error: userWords is not an array.');
            callback(null);
            return;
        }
        console.log("이거 실행77");
        const studiedWordIds = userWords.map(userWord => userWord.word_id);
        console.log("이거실행88",studiedWordIds);
        console.log("words",words);
        const nextNewWord = words.find(word => !studiedWordIds.includes(word.id));
        console.log("이거실행55",nextNewWord);
        if (nextNewWord) {
            console.log('Fetching new word:', nextNewWord);
            callback(nextNewWord);
        } else {
            console.log('No new words available.');
            callback(null);
        }
    });
};


// 복습할 단어 추천 함수
const getReviewRecommendedWords = (userId, callback) => {
    getUserWordData(userId, (userWords) => {
        const recommendedReviewWords = userWords
            .map(word => {
                const daysSinceLastStudy = Math.floor((new Date() - new Date(word.last_study_date)) / (1000 * 60 * 60 * 24));
                let score = 0;

                // 점수 계산 로직
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


// 단어 추천 최종 함수
const getNextWord = (userId, callback) => {
    // 비중에 따라 랜덤으로 신규 단어 또는 복습 단어 결정
    const isNewWord = Math.random() < newWordWeight;
    console.log("isNewWord ? ", isNewWord);
    if (isNewWord) {
        // 신규 단어를 추천
        getNextNewWord(userId, (newWord) => {
            if (newWord) {
                console.log("newWord",newWord);
                callback(newWord);
            } else {
                // 신규 단어가 없으면 복습 단어로 대체
                getReviewRecommendedWords(userId, (recommendedReviewWords) => {

                    console.log("신규단어 없음");
                    if (recommendedReviewWords.length > 0) {

                        callback(recommendedReviewWords[0]);
                    } else {
                        callback(null); // 둘 다 없으면 null 반환
                    }
                });
            }
        });
    } else {
        // 복습 단어를 추천
        getReviewRecommendedWords(userId, (recommendedReviewWords) => {
            if (recommendedReviewWords.length > 0){
                console.log('복습단어추천',recommendedReviewWords[0]);
                callback(recommendedReviewWords[0]);
            } else {
                // 복습 단어가 없으면 신규 단어로 대체
                getNextNewWord(userId, (newWord) => {

                    console.log('복습단어가 없어서 신규단어');
                    if (newWord) {
                        console.log("newWord",newWord);
                        callback(newWord);
                    } else {
                        console.log("null");
                        callback(null); // 둘 다 없으면 null 반환
                    }
                });
            }
        });
    }
};

export { initDb, updateOrAddUserWordData, getUserWordData, getReviewRecommendedWords , getNextNewWord, getNextWord};
