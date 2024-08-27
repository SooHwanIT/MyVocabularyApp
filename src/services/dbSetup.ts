import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'wordStudy.db', location: 'default' });

const initDb = () => {
    db.transaction(tx => {
        // 기존 테이블 삭제
        tx.executeSql('DROP TABLE IF EXISTS user_words', [], () => {
            console.log('기존 테이블 삭제 성공');
        }, error => {
            console.log('테이블 삭제 중 오류 발생', error);
        });

        // 새로운 테이블 생성
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS user_words (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       word_id INTEGER,
                                                       user_id INTEGER,
                                                       wrong_count INTEGER,
                                                       correct_count INTEGER,
                                                       study_count INTEGER,
                                                       last_study_date DATETIME,
                                                       favorite INTEGER,
                                                       exposure_count INTEGER,
                                                       skip_count INTEGER,
                                                       last_attempt_status TEXT,
                                                       is_memorized INTEGER DEFAULT 0  -- 0: 미완료, 1: 완료
             )`,
            [],
            () => { console.log('새로운 테이블 생성 성공'); },
            error => { console.log('테이블 생성 중 오류 발생', error); }
        );
    });
};

export { db, initDb };
