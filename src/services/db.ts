import SQLite from 'react-native-sqlite-storage';

// SQLite 데이터베이스 열기
const db = SQLite.openDatabase({ name: 'wordStudy.db', location: 'default' });

// 데이터베이스 초기화 (기존 데이터 삭제)
const initDb = () => {
    db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS user_words', [], () => {
            console.log('Table dropped successfully');
        }, error => {
            console.log('Error dropping table', error);
        });

        tx.executeSql(
            'CREATE TABLE IF NOT EXISTS user_words (' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'word_id INTEGER, ' +
            'user_id INTEGER, ' +
            'wrong_count INTEGER, ' +
            'correct_count INTEGER, ' +
            'study_count INTEGER, ' +
            'last_study_date TEXT, ' +
            'favorite INTEGER, ' + // 즐겨찾기 여부 (0 또는 1)
            'review_interval TEXT, ' + // 복습 주기
            'exposure_count INTEGER, ' + // 노출 횟수
            'skip_count INTEGER' + // 스킵 횟수
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
            'INSERT INTO user_words (word_id, user_id, wrong_count, correct_count, study_count, last_study_date, favorite, review_interval, exposure_count, skip_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
                userWord.skip_count
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
                    const updatedExposureCount = (newWordData.exposure_count !== undefined) ? newWordData.exposure_count : userWord.exposure_count;
                    const updatedSkipCount = (newWordData.skip_count !== undefined) ? newWordData.skip_count : userWord.skip_count;

                    tx.executeSql(
                        'UPDATE user_words SET study_count = ?, correct_count = ?, wrong_count = ?, last_study_date = ?, favorite = ?, review_interval = ?, exposure_count = ?, skip_count = ? WHERE user_id = ? AND word_id = ?',
                        [
                            updatedStudyCount,
                            updatedCorrectCount,
                            updatedWrongCount,
                            updatedLastStudyDate,
                            updatedFavorite ? 1 : 0,
                            updatedReviewInterval,
                            updatedExposureCount,
                            updatedSkipCount,
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
                        exposure_count: newWordData.exposure_count || 0,
                        skip_count: newWordData.skip_count || 0
                    };

                    addUserWordData(newUserWord);
                }
            },
            error => { console.log('Error fetching data', error); }
        );
    });
};


// 사용자 단어 데이터 가져오기
const getUserWordData = (userId, callback) => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM user_words WHERE user_id = ?',
            [userId],
            (tx, results) => {
                const rows = results.rows.raw();
                callback(rows);
            },
            error => { console.log('Error fetching data', error); }
        );
    });
};

// 추천 단어 목록 가져오기
const getRecommendedWords = (userId, callback) => {
    getUserWordData(userId, (userWords) => {
        const recommendedWords = userWords.map(word => {
            const daysSinceLastStudy = Math.floor((new Date() - new Date(word.last_study_date)) / (1000 * 60 * 60 * 24));
            const score = (word.wrong_count * 2) +
                (word.study_count * -1) +
                (word.correct_count * -1) +
                (daysSinceLastStudy * 1.5) +
                (word.exposure_count * 0.5) +
                (word.skip_count * -2)
                // (word.favorite ? 5 : 0);

            return {
                ...word,
                score,
                daysSinceLastStudy,
            };
        })
            .filter(word => word.daysSinceLastStudy >= parseInt(word.review_interval)) // 복습 필요성 판단
            .sort((a, b) => b.score - a.score) // 점수 내림차순 정렬

        callback(recommendedWords);
    });
};


export { initDb, updateOrAddUserWordData, getUserWordData, getRecommendedWords };
