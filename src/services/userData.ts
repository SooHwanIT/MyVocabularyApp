// services/userData.js
import { db } from './dbSetup';

const addUserWordData = (userWord) => {
    db.transaction(tx => {
        tx.executeSql(
            `INSERT INTO user_words 
            (word_id, user_id, wrong_count, correct_count, study_count, last_study_date, favorite, review_interval, exposure_count, skip_count, last_attempt_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userWord.word_id,
                userWord.user_id,
                userWord.wrong_count,
                userWord.correct_count,
                userWord.study_count,
                userWord.last_study_date,
                userWord.favorite ? 1 : 0,
                userWord.review_interval,
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
                    const updatedLastStudyDate = new Date().toISOString().split('T')[0];
                    const updatedFavorite = newWordData.favorite !== undefined ? newWordData.favorite : userWord.favorite;
                    const updatedReviewInterval = newWordData.review_interval || userWord.review_interval;
                    const updatedExposureCount = updatedStudyCount;
                    const updatedSkipCount = (newWordData.skip_count !== undefined) ? newWordData.skip_count : userWord.skip_count;
                    const lastAttemptStatus = correct ? 'correct' : (newWordData.skip ? 'skipped' : 'incorrect');

                    tx.executeSql(
                        `UPDATE user_words 
                        SET study_count = ?, correct_count = ?, wrong_count = ?, last_study_date = ?, favorite = ?, review_interval = ?, exposure_count = ?, skip_count = ?, last_attempt_status = ?
                        WHERE user_id = ? AND word_id = ?`,
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
                        () => { console.log('Data updated successfully'); },
                        error => { console.log('Error updating data', error); }
                    );
                } else {
                    const newUserWord = {
                        word_id: wordId,
                        user_id: userId,
                        wrong_count: correct ? 0 : 1,
                        correct_count: correct ? 1 : 0,
                        study_count: 1,
                        last_study_date: new Date().toISOString().split('T')[0],
                        favorite: newWordData.favorite ? 1 : 0,
                        review_interval: newWordData.review_interval || "7 days",
                        exposure_count: 1,
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

export { addUserWordData, updateOrAddUserWordData, getUserWordData, getAllData };
