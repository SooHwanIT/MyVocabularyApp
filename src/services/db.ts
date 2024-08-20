import SQLite from 'react-native-sqlite-storage';

// SQLite 데이터베이스 열기
const db = SQLite.openDatabase({ name: 'wordStudy.db', location: 'default' });

// 데이터베이스 초기화
const initDb = () => {
    db.transaction(tx => {
        tx.executeSql(
            'CREATE TABLE IF NOT EXISTS user_words (id INTEGER PRIMARY KEY AUTOINCREMENT, word_id INTEGER, user_id INTEGER, wrong_count INTEGER, correct_count INTEGER, study_count INTEGER, last_study_date TEXT)',
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
            'INSERT INTO user_words (word_id, user_id, wrong_count, correct_count, study_count, last_study_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userWord.word_id, userWord.user_id, userWord.wrong_count, userWord.correct_count, userWord.study_count, userWord.last_study_date],
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
const updateOrAddUserWordData = (userId, wordId, correct) => {
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

                    tx.executeSql(
                        'UPDATE user_words SET study_count = ?, correct_count = ?, wrong_count = ?, last_study_date = ? WHERE user_id = ? AND word_id = ?',
                        [updatedStudyCount, updatedCorrectCount, updatedWrongCount, updatedLastStudyDate, userId, wordId],
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

export { initDb, updateOrAddUserWordData, getUserWordData };
