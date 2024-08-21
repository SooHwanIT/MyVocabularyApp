// services/dbSetup.js
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'wordStudy.db', location: 'default' });

const initDb = () => {
    db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS user_words', [], () => {
            console.log('Table dropped successfully');
        }, error => {
            console.log('Error dropping table', error);
        });

        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS user_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word_id INTEGER,
                user_id INTEGER,
                wrong_count INTEGER,
                correct_count INTEGER,
                study_count INTEGER,
                last_study_date TEXT,
                favorite INTEGER,
                review_interval TEXT,
                exposure_count INTEGER,
                skip_count INTEGER,
                last_attempt_status TEXT
            )`,
            [],
            () => { console.log('Table created successfully'); },
            error => { console.log('Error creating table', error); }
        );
    });
};

export { db, initDb };
