// services/userData.js
import { db } from './dbSetup';

const addUserWordData = (userWord) => {
    console.log('단어 추가');
    db.transaction(tx => {
        tx.executeSql(
            `INSERT INTO user_words 
            (word_id, user_id, wrong_count, correct_count, study_count, last_study_date, favorite, exposure_count, skip_count, last_attempt_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userWord.word_id,
                userWord.user_id,
                userWord.wrong_count,
                userWord.correct_count,
                userWord.study_count,
                userWord.last_study_date,
                userWord.favorite ? 1 : 0,
                userWord.exposure_count,
                userWord.skip_count,
                userWord.last_attempt_status
            ],
            () => { console.log('Data inserted successfully'); },
            error => { console.log('Error inserting data', error); }
        );
    });
};

const updateOrAddUserWordData = (userId, wordId, correct, newWordData) => {
    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM user_words WHERE user_id = ? AND word_id = ?',
            [userId, wordId],
            (tx, results) => {
                if (results.rows.length > 0) {
                    const userWord = results.rows.item(0);
                    const updatedStudyCount = userWord.study_count + 1;
                    const updatedCorrectCount = correct ? userWord.correct_count + 1 : userWord.correct_count;
                    const updatedWrongCount = correct ? userWord.wrong_count : userWord.wrong_count + 1;
                    const updatedFavorite = newWordData.favorite !== undefined ? newWordData.favorite : userWord.favorite;
                    const updatedExposureCount = updatedStudyCount;
                    const updatedSkipCount = newWordData.skip_count !== undefined ? newWordData.skip_count : userWord.skip_count;
                    const lastAttemptStatus = correct ? 'correct' : (newWordData.skip ? 'skipped' : 'incorrect');

                    tx.executeSql(
                        `UPDATE user_words 
                        SET study_count = ?, correct_count = ?, wrong_count = ?, last_study_date = ?, favorite = ?, exposure_count = ?, skip_count = ?, last_attempt_status = ?
                        WHERE user_id = ? AND word_id = ?`,
                        [
                            updatedStudyCount,
                            updatedCorrectCount,
                            updatedWrongCount,
                            currentDateTime,  // 현재 시간으로 업데이트
                            updatedFavorite ? 1 : 0,
                            updatedReviewInterval,
                            updatedExposureCount,
                            updatedSkipCount,
                            lastAttemptStatus,
                            userId,
                            wordId
                        ],
                        () => { console.log('데이터 업데이트 성공'); },
                        error => { console.log('데이터 업데이트 중 오류 발생', error); }
                    );
                } else {
                    const newUserWord = {
                        word_id: wordId,
                        user_id: userId,
                        wrong_count: correct ? 0 : 1,
                        correct_count: correct ? 1 : 0,
                        study_count: 1,
                        last_study_date: currentDateTime,  // 현재 시간으로 초기화
                        favorite: newWordData.favorite ? 1 : 0,
                        exposure_count: 1,
                        skip_count: newWordData.skip ? 1 : 0,
                        last_attempt_status: correct ? 'correct' : (newWordData.skip ? 'skipped' : 'incorrect')
                    };

                    addUserWordData(newUserWord);
                }
            },
            error => { console.log('데이터 조회 중 오류 발생', error); }
        );
    });
};


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

const getAllData = (callback) => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM user_words',
            [],
            (tx, results) => {
                const rows = results.rows.raw();
                callback(rows);
            },
            error => { console.log('Error fetching all data', error); }
        );
    });
};

const getLastStudyTime = (wordId, callback) => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT last_study_date FROM user_words WHERE word_id = ?',
            [wordId],
            (tx, results) => {
                if (results.rows.length > 0) {
                    const lastStudyDate = results.rows.item(0).last_study_date;
                    callback(lastStudyDate);
                } else {
                    callback(null);
                }
            },
            error => { console.log('Error fetching last study date', error); }
        );
    });
};

export { addUserWordData, updateOrAddUserWordData, getUserWordData, getAllData, getLastStudyTime };
